"""Read-side view models shared by the JSON API and HTML pages."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from mie.core.enums import InformationLayer, Sentiment
from collections import defaultdict

from mie.db.models import (
    ClaudeEventTyping,
    ClaudePrediction,
    Event,
    EventImpact,
    FinbertPrediction,
    IngestionRun,
    ModelVersion,
    Source,
)
from mie.intelligence.aggregation import AssetImplicationObs, LabelledEvent, asset_breadth, windowed_breadth
from mie.intelligence.service import (
    event_divergence,
    finbert_layer_labels,
    latest_claude,
    latest_comparison,
    latest_implications,
    media_narrative,
)
from mie.models.claude import load_asset_universe

LABEL_SOURCES = ("claude", "finbert", "agreed")


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
        "claude_label": claude.factual_sentiment if claude else None,
        "finbert_label": fb[InformationLayer.FACTUAL.value].value if fb[InformationLayer.FACTUAL.value] else None,
        "agreement": comp.status if comp else "NOT_CLASSIFIED",
        "review_required": _needs_review(session, e.id),  # either compared layer
        "document_count": len(e.documents),
        "source_count": len(sources),
        "source_types": sorted({s.source_type for s in sources}),
        "is_fixture": all(s.is_fixture for s in sources) if sources else False,
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
        } for ed in e.documents],
    }


def breadth_table(session: Session, as_of: datetime | None = None, country: str | None = None,
                  asset_class: str | None = None) -> dict:
    """Breadth per window, reported separately for each label source. Never averaged."""
    as_of = as_of or datetime.now(timezone.utc)
    f = EventFilters(country=country, asset_class=asset_class)
    rows = list_events(session, f, limit=100_000)
    out = {}
    for src in LABEL_SOURCES:
        labelled = []
        for r in rows:
            if src == "claude":
                label = r["claude_label"]
            elif src == "finbert":
                label = r["finbert_label"]
            else:
                label = r["claude_label"] if r["agreement"] == "AGREE" else None
            labelled.append(LabelledEvent(r["id"], datetime.fromisoformat(r["event_time"]),
                                          Sentiment(label) if label else None))
        out[src] = {w: b.as_dict() for w, b in windowed_breadth(labelled, as_of).items()}
    return {"as_of": as_of.isoformat(), "country": country, "asset_class": asset_class, "by_label_source": out}


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


def asset_table(session: Session, as_of: datetime | None = None) -> dict:
    """Per-asset breadth from Claude's implications. One entry per asset, no total."""
    as_of = as_of or datetime.now(timezone.utc)
    names = load_asset_universe()
    obs = [AssetImplicationObs(e.id, e.event_time, i.asset, i.direction) for e, i in latest_implications(session)]
    return {"as_of": as_of.isoformat(), "assets": [
        {"asset": a, "name": names.get(a, a), "windows": {w: b.as_dict() for w, b in ws.items()}}
        for a, ws in asset_breadth(obs, as_of).items()]}


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
