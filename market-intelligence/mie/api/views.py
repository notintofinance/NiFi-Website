"""Read-side view models shared by the JSON API and HTML pages."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from mie.core.enums import InformationLayer
from collections import defaultdict

from mie.db.models import (
    ClaudeEventTyping,
    ClaudePrediction,
    Event,
    EventImpact,
    FinbertPrediction,
    IngestionRun,
    ModelVersion,
    SentimentSnapshot,
    Source,
)
from mie.intelligence.aggregation import WINDOWS, BreadthResult
from mie.intelligence.history import (
    METHODOLOGY_VERSION,
    MOMENTUM_PAIRS,
    asset_breadth_at,
    breadth_at,
    drivers,
    reversals_all,
    series,
    week_on_week,
)
from mie.intelligence.labels import GLOBAL, LABEL_SOURCES, LabelBook
from mie.intelligence.service import (
    event_divergence,
    finbert_layer_labels,
    latest_claude,
    latest_comparison,
    media_narrative,
)
from mie.models.claude import load_asset_universe



@dataclass
class EventFilters:
    country: str | None = None
    asset_class: str | None = None
    ticker: str | None = None
    event_type: str | None = None
    source_type: str | None = None
    sentiment: str | None = None     # Claude factual label
    agreement: str | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None


def any_fixture_data(session: Session) -> bool:
    return bool(session.scalar(select(func.count()).select_from(Source).where(Source.is_fixture.is_(True))))


def event_row(session: Session, e: Event) -> dict:
    claude = latest_claude(session, e.id)
    fb = finbert_layer_labels(session, e.id)
    comp = latest_comparison(session, e.id, InformationLayer.FACTUAL)
    sources = {ed.document.source for ed in e.documents}
    return {
        "id": e.id,
        "event_time": e.event_time.isoformat(),
        "event_time_quality": e.event_time_quality,
        "title": e.title,
        "event_type": e.event_type,
        "country": e.country,
        "entities": sorted(ee.entity.name for ee in e.entities),
        "tickers": sorted({t for ee in e.entities for t in ee.entity.tickers}),
        "asset_classes": e.asset_classes,
        # Same rule as comparisons and aggregation: no factual text, no factual label.
        "claude_label": claude.factual_sentiment if claude and any(
            st.layer == InformationLayer.FACTUAL.value for st in e.statements) else None,
        "finbert_label": fb[InformationLayer.FACTUAL.value].value if fb[InformationLayer.FACTUAL.value] else None,
        "agreement": comp.status if comp else "NOT_CLASSIFIED",
        "review_required": _needs_review(session, e.id),  # either compared layer
        "document_count": len(e.documents),
        "source_count": len(sources),
        "source_types": sorted({s.source_type for s in sources}),
        "is_fixture": all(s.is_fixture for s in sources) if sources else False,
        "divergence_flags": event_divergence(session, e),
    }


def list_events(session: Session, f: EventFilters, limit: int = 500) -> list[dict]:
    q = select(Event).order_by(Event.event_time.desc(), Event.id.desc())
    if f.country:
        q = q.where(Event.country == f.country)
    if f.event_type:
        q = q.where(Event.event_type == f.event_type)
    if f.date_from:
        q = q.where(Event.event_time >= f.date_from)
    if f.date_to:
        q = q.where(Event.event_time <= f.date_to)
    rows = []
    for e in session.scalars(q).all():
        r = event_row(session, e)
        if f.asset_class and f.asset_class not in r["asset_classes"]:
            continue
        if f.ticker and f.ticker.upper() not in r["tickers"]:
            continue
        if f.source_type and f.source_type not in r["source_types"]:
            continue
        if f.sentiment and r["claude_label"] != f.sentiment:
            continue
        if f.agreement and r["agreement"] != f.agreement:
            continue
        rows.append(r)
        if len(rows) >= limit:
            break
    return rows


def event_detail(session: Session, event_id: int) -> dict | None:
    e = session.get(Event, event_id)
    if e is None:
        return None
    row = event_row(session, e)
    fb_rows = {p.statement_id: p for p in session.scalars(
        select(FinbertPrediction).where(FinbertPrediction.event_id == e.id)
        .order_by(FinbertPrediction.id)).all()}
    layers: dict[str, list[dict]] = {layer.value: [] for layer in InformationLayer}
    for st in e.statements:
        p = fb_rows.get(st.id)
        layers[st.layer].append({
            "text": st.text, "document_id": st.document_id, "computed": st.value,
            "finbert": p.label if p else None,
            "finbert_probabilities": p.probabilities if p else None,
        })
    claude = latest_claude(session, e.id)
    claude_history = session.scalars(select(ClaudePrediction).where(ClaudePrediction.event_id == e.id)
                                     .order_by(ClaudePrediction.id.desc())).all()
    impacts = session.scalars(select(EventImpact).where(EventImpact.claude_prediction_id == claude.id)).all() \
        if claude else []
    media = media_narrative(session, e)
    comps = {layer.value: latest_comparison(session, e.id, layer)
             for layer in (InformationLayer.FACTUAL, InformationLayer.MANAGEMENT)}
    return {
        **row,
        "extraction_method": e.extraction_method,
        "event_type_history": e.event_type_history,
        "dedup_method": e.dedup_method,
        "layers": layers,
        "finbert_layer_labels": {k: (v.value if v else None) for k, v in finbert_layer_labels(session, e.id).items()},
        "claude": None if claude is None else {
            "prediction_id": claude.id, "model": claude.served_model, "prompt_version": claude.prompt_version,
            "predicted_at": claude.predicted_at.isoformat(), "as_of": claude.as_of.isoformat(),
            "factual_sentiment": claude.factual_sentiment, "management_tone": claude.management_tone,
            "impact_horizon": claude.impact_horizon, "output": claude.output,
            "input_tokens": claude.input_tokens, "output_tokens": claude.output_tokens,
        },
        "claude_history": [{"id": c.id, "status": c.status, "model": c.served_model,
                            "prompt_version": c.prompt_version, "predicted_at": c.predicted_at.isoformat(),
                            "factual_sentiment": c.factual_sentiment} for c in claude_history],
        "impacts": [{"asset": i.asset, "direction": i.direction, "horizon": i.horizon,
                     "rationale": i.rationale} for i in impacts],
        "comparisons": {k: (None if c is None else {"status": c.status, "review_required": c.review_required,
                                                   "claude": c.claude_label, "finbert": c.finbert_label})
                        for k, c in comps.items()},
        "media_narrative": {"n": media.n, "counts": {"positive": media.positive, "neutral": media.neutral,
                                                     "negative": media.negative},
                            "shares": media.shares(), "dispersion": media.dispersion},
        "divergence_flags": event_divergence(session, e),
        "documents": [{
            "document_id": ed.document.id, "source": ed.document.source.name,
            "source_type": ed.document.source.source_type, "is_fixture": ed.document.source.is_fixture,
            "headline": ed.document.headline, "url": ed.document.url,
            "published_at": ed.document.published_at.isoformat() if ed.document.published_at else None,
            "retrieved_at": ed.document.retrieved_at.isoformat(),
            "attached_by": ed.attached_by, "similarity": ed.similarity,
            "categories": ed.document.raw_metadata.get("categories", []),
        } for ed in e.documents],
    }


def breadth_table(session: Session, as_of: datetime | None = None, scope: str = GLOBAL,
                  mode: str = "POINT_IN_TIME", book: LabelBook | None = None) -> dict:
    """Breadth per window for every label source, reported separately. Never averaged."""
    as_of = as_of or datetime.now(timezone.utc)
    book = book or LabelBook.from_session(session)
    out = {}
    for src, desc in LABEL_SOURCES.items():
        out[src] = {"description": desc, "windows": {
            w: breadth_at(book, src, as_of, d, scope, mode)[0].as_dict() for w, d in WINDOWS.items()}}
    return {"as_of": as_of.isoformat(), "scope": scope, "scopes": book.scopes(), "mode": mode,
            "methodology_version": METHODOLOGY_VERSION, "by_label_source": out}


def _contrib(c) -> dict:
    return {"event_id": c.event_id, "title": c.title, "event_type": c.event_type,
            "event_time": c.event_time.isoformat(), "label": c.label.value}


def drivers_view(session: Session, source: str = "claude_factual", window: str = "7D", scope: str = GLOBAL,
                 as_of: datetime | None = None, book: LabelBook | None = None) -> dict:
    as_of = as_of or datetime.now(timezone.utc)
    book = book or LabelBook.from_session(session)
    b, contributors = breadth_at(book, source, as_of, WINDOWS[window], scope)
    return {"as_of": as_of.isoformat(), "label_source": source, "description": LABEL_SOURCES[source],
            "window": window, "scope": scope, "breadth": b.as_dict(),
            "drivers": {k: [_contrib(c) for c in v] for k, v in drivers(contributors).items()}}


def momentum_view(session: Session, as_of: datetime | None = None, book: LabelBook | None = None) -> dict:
    as_of = as_of or datetime.now(timezone.utc)
    book = book or LabelBook.from_session(session)
    return {"as_of": as_of.isoformat(), "pairs": [list(p) for p in MOMENTUM_PAIRS],
            "reversals": reversals_all(book, as_of)}


def history_view(session: Session, source: str = "claude_factual", window: str = "7D", scope: str = GLOBAL,
                 days: int = 30, end: datetime | None = None) -> dict:
    """Daily point-in-time series next to the restated series. `differs` marks days
    where today's labels would change what was knowable then."""
    end = end or datetime.now(timezone.utc)
    book = LabelBook.from_session(session)
    pit = series(book, source, WINDOWS[window], end, days, scope, "POINT_IN_TIME")
    restated = series(book, source, WINDOWS[window], end, days, scope, "RESTATED")
    rows = []
    for (t, p), (_, r) in zip(pit, restated):
        rows.append({"t": t.isoformat(), "point_in_time": p.as_dict(), "restated": r.as_dict(),
                     "differs": (p.breadth_scaled, p.total_classified) != (r.breadth_scaled, r.total_classified)})
    snaps = session.scalars(select(SentimentSnapshot).where(
        SentimentSnapshot.label_source == source, SentimentSnapshot.window == window,
        SentimentSnapshot.scope == scope).order_by(SentimentSnapshot.as_of.desc()).limit(days)).all()
    return {"label_source": source, "description": LABEL_SOURCES[source], "window": window, "scope": scope,
            "scopes": book.scopes(), "days": days, "methodology_version": METHODOLOGY_VERSION, "rows": rows,
            "snapshots": [{"as_of": sn.as_of.isoformat(), "breadth": sn.breadth,
                           "breadth_scaled": None if sn.breadth is None else round(sn.breadth * 100),
                           "total_classified": sn.total_classified, "methodology_version": sn.methodology_version}
                          for sn in snaps]}


def source_health(session: Session) -> list[dict]:
    out = []
    for src in session.scalars(select(Source).order_by(Source.key)).all():
        runs = session.scalars(select(IngestionRun).where(IngestionRun.source_id == src.id)
                               .order_by(IngestionRun.id.desc()).limit(10)).all()
        last_ok = next((r for r in runs if r.status in ("SUCCESS", "PARTIAL")), None)
        out.append({
            "key": src.key, "name": src.name, "source_type": src.source_type, "is_fixture": src.is_fixture,
            "allow_external_llm": src.allow_external_llm, "licence_note": src.licence_note,
            "last_success_at": last_ok.finished_at.isoformat() if last_ok and last_ok.finished_at else None,
            "runs": [{"started_at": r.started_at.isoformat(), "status": r.status, "attempts": r.attempts,
                      "parsed": r.parsed, "inserted": r.inserted, "duplicates": r.duplicates,
                      "missing_timestamps": r.missing_timestamps, "parse_errors": r.parse_errors,
                      "error_type": r.error_type, "error_message": r.error_message} for r in runs],
        })
    return out


def heat_bin(breadth_scaled: int | None) -> str:
    """Display quantisation for the heatmap: sign plus magnitude third. This only
    colours the cell (the exact value is printed in it) and never feeds a calculation."""
    if breadth_scaled is None:
        return "na"
    if breadth_scaled == 0:
        return "z"
    level = 1 if abs(breadth_scaled) <= 33 else 2 if abs(breadth_scaled) <= 66 else 3
    return ("p" if breadth_scaled > 0 else "n") + str(level)


def _cell(b: BreadthResult) -> dict:
    return {**b.as_dict(), "bin": heat_bin(b.breadth_scaled)}


def asset_table(session: Session, as_of: datetime | None = None, book: LabelBook | None = None) -> dict:
    """Per-asset point-in-time breadth from Claude's implications, with the 7D value's
    change versus one week earlier. One row per asset; no cross-asset total."""
    as_of = as_of or datetime.now(timezone.utc)
    book = book or LabelBook.from_session(session)
    names = load_asset_universe()
    rows = []
    for asset in book.assets():
        windows = {w: _cell(asset_breadth_at(book, asset, as_of, d)) for w, d in WINDOWS.items()}
        prev = asset_breadth_at(book, asset, as_of - timedelta(days=7), WINDOWS["7D"])
        cur7 = asset_breadth_at(book, asset, as_of, WINDOWS["7D"])
        rows.append({"asset": asset, "name": names.get(asset, asset), "windows": windows,
                     "wow_7d": week_on_week(cur7, prev)})
    return {"as_of": as_of.isoformat(), "assets": rows}


STRIP_SOURCES = ("claude_factual", "finbert_factual")


def headline_strip(session: Session, sources: tuple[str, ...] = STRIP_SOURCES, as_of: datetime | None = None,
                   book: LabelBook | None = None) -> list[dict]:
    """One card per scope, one row per label source (24H / 7D / 30D + 7D week-on-week).
    Models sit side by side; they are never combined."""
    as_of = as_of or datetime.now(timezone.utc)
    book = book or LabelBook.from_session(session)
    cards = []
    for scope in book.scopes():
        rows = []
        for src in sources:
            vals = {w: _cell(breadth_at(book, src, as_of, WINDOWS[w], scope)[0]) for w in ("24H", "7D", "30D")}
            prev = breadth_at(book, src, as_of - timedelta(days=7), WINDOWS["7D"], scope)[0]
            cur7 = breadth_at(book, src, as_of, WINDOWS["7D"], scope)[0]
            rows.append({"label_source": src, "description": LABEL_SOURCES[src], "windows": vals,
                         "wow_7d": week_on_week(cur7, prev)})
        cards.append({"scope": scope, "rows": rows})
    return cards


def default_driver_source(book: LabelBook) -> str:
    """Claude's labels when Claude has run at all; otherwise FinBERT's. The page
    always names the source shown, so this is a visible choice, not a silent swap."""
    return "claude_factual" if any(e.claude for e in book.events) else "finbert_factual"


def divergences(session: Session, days: int = 30, as_of: datetime | None = None) -> list[dict]:
    as_of = as_of or datetime.now(timezone.utc)
    out = []
    for e in session.scalars(select(Event).where(Event.event_time > as_of - timedelta(days=days))
                             .order_by(Event.event_time.desc())).all():
        flags = event_divergence(session, e)
        if flags:
            out.append({**event_row(session, e), "flags": flags})
    return out


CSV_COLUMNS = ["id", "event_time", "event_time_quality", "event_type", "title", "country", "entities", "tickers",
               "asset_classes", "claude_label", "finbert_label", "agreement", "review_required",
               "divergence_flags", "document_count", "source_count", "source_types", "is_fixture", "detail_url"]


def _csv_safe(value) -> str:
    """Neutralise spreadsheet formula injection: text from external sources must
    never execute when an analyst opens the export."""
    text = "; ".join(map(str, value)) if isinstance(value, list) else ("" if value is None else str(value))
    return "'" + text if text[:1] in ("=", "+", "-", "@", "\t", "\r") else text


def events_csv(rows: list[dict], base_url: str = "") -> str:
    import csv
    import io
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(CSV_COLUMNS)
    for r in rows:
        r = {**r, "detail_url": f"{base_url}/events/{r['id']}"}
        w.writerow([_csv_safe(r.get(c)) for c in CSV_COLUMNS])
    return buf.getvalue()


def _needs_review(session: Session, event_id: int) -> bool:
    return any((c := latest_comparison(session, event_id, layer)) is not None and c.review_required
               for layer in (InformationLayer.FACTUAL, InformationLayer.MANAGEMENT))


def _rate(agree: int, disagree: int) -> float | None:
    return agree / (agree + disagree) if agree + disagree else None


def model_diagnostics(session: Session) -> dict:
    mvs = {m.id: m for m in session.scalars(select(ModelVersion)).all()}

    def usage(rows) -> list[dict]:
        groups: dict[tuple, dict] = {}
        for r in rows:
            k = (mvs[r.model_version_id].name, r.prompt_version, r.served_model)
            g = groups.setdefault(k, {"model": k[0], "prompt_version": k[1], "served_model": k[2],
                                      "status": defaultdict(int), "input_tokens": 0, "output_tokens": 0,
                                      "cache_read_input_tokens": 0})
            g["status"][r.status] += 1
            g["input_tokens"] += r.input_tokens or 0
            g["output_tokens"] += r.output_tokens or 0
            g["cache_read_input_tokens"] += getattr(r, "cache_read_input_tokens", None) or 0
        return [{**g, "status": dict(g["status"])} for g in groups.values()]

    finbert = defaultdict(lambda: defaultdict(int))
    for p in session.scalars(select(FinbertPrediction)).all():
        finbert[mvs[p.model_version_id].version][p.label] += 1

    agreement: dict[str, dict[str, dict[str, int]]] = {"FACTUAL": defaultdict(lambda: defaultdict(int)),
                                                       "MANAGEMENT": defaultdict(lambda: defaultdict(int))}
    events = session.scalars(select(Event).order_by(Event.event_time.desc())).all()
    for e in events:
        for layer in (InformationLayer.FACTUAL, InformationLayer.MANAGEMENT):
            c = latest_comparison(session, e.id, layer)
            if c is not None:
                agreement[layer.value][e.event_type][c.status] += 1
                agreement[layer.value]["ALL"][c.status] += 1
    agreement_rows = {
        layer: [{"event_type": t, "counts": dict(c), "n_both_directional": c["AGREE"] + c["DISAGREE"],
                 "agreement_rate": _rate(c["AGREE"], c["DISAGREE"])}
                for t, c in sorted(by_type.items(), key=lambda kv: (kv[0] != "ALL", kv[0]))]
        for layer, by_type in agreement.items()
    }
    retyped = [{"event_id": e.id, "title": e.title, "history": e.event_type_history}
               for e in events if e.event_type_history]
    return {
        "claude_interpretation": usage(session.scalars(select(ClaudePrediction)).all()),
        "claude_typing": usage(session.scalars(select(ClaudeEventTyping)).all()),
        "finbert": [{"version": v, "labels": dict(c), "n": sum(c.values())} for v, c in finbert.items()],
        "agreement": agreement_rows,
        "retyped_events": retyped,
        "review_queue": [event_row(session, e) for e in events if _needs_review(session, e.id)],
    }
