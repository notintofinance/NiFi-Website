"""Orchestrates model runs and read-side views over stored predictions.

Order of operations enforces blindness: FinBERT and Claude are run and stored
independently, then `run_comparisons` reads both. Neither classifier is ever
given the other's output.
"""
from __future__ import annotations

import hashlib
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from mie.core.config import Settings, claude_kwargs
from mie.core.enums import EventType, InformationLayer, Sentiment
from mie.db.models import (
    ClaudeEventTyping,
    ClaudePrediction,
    Event,
    EventImpact,
    EventStatement,
    FinbertPrediction,
    ModelComparison,
)
from mie.db.repository import get_or_create_model_version
from mie.intelligence.comparison import compare, tone_to_sentiment
from mie.intelligence.narrative import NarrativeDistribution, divergence_flags, narrative_distribution
from mie.models.briefing import build_event_brief
from mie.models.claude import ClaudeClassifier, EventTyper, api_error_policy
from mie.models.finbert import FinbertUnavailable, SentenceClassifier, derive_event_label

log = logging.getLogger(__name__)
COMPARED_LAYERS = (InformationLayer.FACTUAL, InformationLayer.MANAGEMENT)


@dataclass
class StageReport:
    stage: str
    ran: bool
    skipped_reason: str | None = None
    counts: dict[str, int] = field(default_factory=dict)


def _sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# ----------------------------------------------------------------------------- FinBERT
def run_finbert(session: Session, clf: SentenceClassifier, event_ids: list[int] | None = None) -> StageReport:
    report = StageReport("finbert", ran=False)
    try:
        if hasattr(clf, "load"):
            clf.load()
    except FinbertUnavailable as exc:
        report.skipped_reason = str(exc)
        return report
    mv = get_or_create_model_version(session, clf.name, clf.version, "FINBERT")
    q = select(EventStatement).where(EventStatement.value.is_(None))  # computed facts never go to FinBERT
    if event_ids is not None:
        q = q.where(EventStatement.event_id.in_(event_ids))
    todo, not_applicable = [], 0
    for st in session.scalars(q).all():
        if st.language not in clf.languages:
            not_applicable += 1
            continue
        h = _sha(st.text)
        exists = session.scalar(select(FinbertPrediction.id).where(
            FinbertPrediction.statement_id == st.id, FinbertPrediction.model_version_id == mv.id,
            FinbertPrediction.input_hash == h))
        if not exists:
            todo.append((st, h))
    if todo:
        preds = clf.predict([st.text for st, _ in todo])
        for (st, h), p in zip(todo, preds):
            session.add(FinbertPrediction(event_id=st.event_id, statement_id=st.id, layer=st.layer,
                                          model_version_id=mv.id, label=p.label.value,
                                          probabilities=p.probabilities, input_hash=h))
    session.flush()
    report.ran = True
    report.counts = {"predicted": len(todo), "not_applicable_language": not_applicable}
    return report


# ----------------------------------------------------------------------------- Claude
def _claude_gate(settings: Settings, stage: str) -> StageReport | None:
    if not settings.claude_enabled:
        return StageReport(stage, ran=False, skipped_reason="CLAUDE_ENABLED is false")
    return None


def run_claude_typing(session: Session, settings: Settings, typer: EventTyper | None = None,
                      event_ids: list[int] | None = None, as_of: datetime | None = None) -> StageReport:
    """Proposes a type for events the rules left as OTHER. Runs before interpretation
    so a newly typed event can be interpreted in the same pass. Changes are recorded
    in events.event_type_history, never applied silently."""
    stage = "claude_typing"
    if (skip := _claude_gate(settings, stage)) is not None:
        return skip
    if not settings.claude_type_other_events:
        return StageReport(stage, ran=False, skipped_reason="CLAUDE_TYPE_OTHER_EVENTS is false")
    typer = typer or EventTyper(**claude_kwargs(settings))
    as_of = as_of or datetime.now(timezone.utc)
    mv = get_or_create_model_version(session, typer.model, typer.model, "CLAUDE",
                                     {"effort": typer.call.effort})
    q = select(Event).where(Event.event_type == EventType.OTHER.value, Event.event_key.is_(None))
    if event_ids is not None:
        q = q.where(Event.id.in_(event_ids))
    counts: dict[str, int] = defaultdict(int)
    for event in session.scalars(q).all():
        brief = build_event_brief(session, event, as_of, settings.brief_max_statements_per_layer,
                                  external_llm=True)
        if brief.is_empty():
            counts["skipped_empty_or_not_permitted"] += 1
            continue
        h = _sha(typer.build_user_message(brief))
        if session.scalar(select(ClaudeEventTyping.id).where(
                ClaudeEventTyping.event_id == event.id, ClaudeEventTyping.model_version_id == mv.id,
                ClaudeEventTyping.prompt_version == typer.prompt_version,
                ClaudeEventTyping.input_hash == h)):
            counts["unchanged"] += 1
            continue
        try:
            result = typer.classify(brief)
        except Exception as exc:
            action, label = api_error_policy(exc)
            log.error("claude typing failed for event %s (%s): %s", event.id, label, exc)
            counts[label] += 1
            if action == "stop":
                break
            continue
        out = result.output
        row = ClaudeEventTyping(
            event_id=event.id, model_version_id=mv.id, prompt_version=typer.prompt_version,
            served_model=result.served_model, status=result.status, previous_event_type=event.event_type,
            proposed_event_type=out.event_type.value if out else None, rationale=out.rationale if out else None,
            input_hash=h, as_of=as_of, input_tokens=result.input_tokens, output_tokens=result.output_tokens,
            error_message=result.error_message)
        session.add(row)
        session.flush()
        if out and out.event_type is not EventType.OTHER:
            event.event_type_history = [*event.event_type_history, {
                "from": event.event_type, "to": out.event_type.value, "by": f"{typer.model}/{typer.prompt_version}",
                "claude_event_typing_id": row.id, "at": datetime.now(timezone.utc).isoformat()}]
            event.event_type = out.event_type.value
            event.extraction_method = f"{event.extraction_method}+CLAUDE_TYPED"
            row.applied = True
            counts["retyped"] += 1
        else:
            counts[result.status.lower() if result.status != "OK" else "kept_other"] += 1
    session.flush()
    return StageReport(stage, ran=True, counts=dict(counts))


def run_claude(session: Session, settings: Settings, clf: ClaudeClassifier | None = None,
               event_ids: list[int] | None = None, as_of: datetime | None = None) -> StageReport:
    if (skip := _claude_gate(settings, "claude")) is not None:
        return skip
    clf = clf or ClaudeClassifier(**claude_kwargs(settings))
    as_of = as_of or datetime.now(timezone.utc)
    mv = get_or_create_model_version(session, clf.model, clf.model, "CLAUDE",
                                     {"effort": clf.effort, "prompt_version": clf.prompt_version})
    counts: dict[str, int] = defaultdict(int)
    for event, brief, status in eligible_briefs(session, settings, clf, mv.id, event_ids, as_of):
        if status != "SEND":
            counts[status.lower()] += 1
            continue
        try:
            result = clf.classify(brief)
        except Exception as exc:  # transient API errors are logged, not stored as predictions
            action, label = api_error_policy(exc)
            log.error("claude call failed for event %s (%s): %s", event.id, label, exc)
            counts[label] += 1
            if action == "stop":
                break
            continue
        out = result.output
        pred = ClaudePrediction(
            event_id=event.id, model_version_id=mv.id, prompt_version=clf.prompt_version,
            served_model=result.served_model, status=result.status,
            factual_sentiment=out.factual_sentiment.value if out else None,
            management_tone=out.management_tone.value if out else None,
            impact_horizon=out.impact_horizon.value if out else None,
            output=result.raw, input_hash=brief.input_hash(), as_of=as_of, input_tokens=result.input_tokens,
            output_tokens=result.output_tokens, cache_read_input_tokens=result.cache_read_input_tokens,
            error_message=result.error_message,
        )
        session.add(pred)
        session.flush()
        if out:
            for imp in out.asset_implications:
                session.add(EventImpact(claude_prediction_id=pred.id, event_id=event.id, asset=imp.asset,
                                        direction=imp.direction, horizon=imp.horizon.value,
                                        rationale=imp.rationale))
        counts[result.status.lower()] += 1
    session.flush()
    return StageReport("claude", ran=True, counts=dict(counts))


def eligible_briefs(session: Session, settings: Settings, clf: ClaudeClassifier, model_version_id: int | None,
                    event_ids: list[int] | None, as_of: datetime):
    """Yields (event, brief, status) for every event, where status is SEND,
    OUT_OF_SCOPE_TYPE, SKIPPED_EMPTY_OR_NOT_PERMITTED or UNCHANGED. Shared by the
    live run and the pre-flight preview, so the preview shows exactly what would be sent."""
    q = select(Event).order_by(Event.id)
    if event_ids is not None:
        q = q.where(Event.id.in_(event_ids))
    for event in session.scalars(q).all():
        brief = build_event_brief(session, event, as_of, settings.brief_max_statements_per_layer,
                                  external_llm=True)
        if event.event_type not in settings.claude_event_types:
            yield event, brief, "OUT_OF_SCOPE_TYPE"
        elif brief.is_empty():
            yield event, brief, "SKIPPED_EMPTY_OR_NOT_PERMITTED"
        elif model_version_id is not None and session.scalar(select(ClaudePrediction.id).where(
                ClaudePrediction.event_id == event.id, ClaudePrediction.model_version_id == model_version_id,
                ClaudePrediction.prompt_version == clf.prompt_version,
                ClaudePrediction.input_hash == brief.input_hash())):
            yield event, brief, "UNCHANGED"
        else:
            yield event, brief, "SEND"


# ----------------------------------------------------------------------------- read side
def latest_claude(session: Session, event_id: int) -> ClaudePrediction | None:
    return session.scalar(select(ClaudePrediction).where(
        ClaudePrediction.event_id == event_id, ClaudePrediction.status == "OK")
        .order_by(ClaudePrediction.predicted_at.desc(), ClaudePrediction.id.desc()).limit(1))


def _latest_finbert_rows(session: Session, event_id: int) -> list[FinbertPrediction]:
    rows = session.scalars(select(FinbertPrediction).where(FinbertPrediction.event_id == event_id)).all()
    if not rows:
        return []
    mv = max(r.model_version_id for r in rows)  # latest model version that covered this event
    return [r for r in rows if r.model_version_id == mv]


def finbert_layer_labels(session: Session, event_id: int) -> dict[str, Sentiment | None]:
    by_layer: dict[str, list[str]] = defaultdict(list)
    for r in _latest_finbert_rows(session, event_id):
        by_layer[r.layer].append(r.label)
    return {layer.value: derive_event_label(by_layer.get(layer.value, [])) for layer in InformationLayer}


def media_narrative(session: Session, event: Event) -> NarrativeDistribution:
    """One FinBERT-derived label per media document attached to the event."""
    per_doc: dict[int, list[str]] = defaultdict(list)
    stmt_doc = {st.id: st.document_id for st in event.statements}
    for r in _latest_finbert_rows(session, event.id):
        if r.layer == InformationLayer.MEDIA.value:
            per_doc[stmt_doc[r.statement_id]].append(r.label)
    return narrative_distribution(lbl for lbl in (derive_event_label(v) for v in per_doc.values())
                                  if lbl in (Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE))


def run_comparisons(session: Session, event_ids: list[int] | None = None) -> StageReport:
    q = select(Event)
    if event_ids is not None:
        q = q.where(Event.id.in_(event_ids))
    counts = defaultdict(int)
    for event in session.scalars(q).all():
        claude = latest_claude(session, event.id)
        fb = finbert_layer_labels(session, event.id)
        fb_rows = _latest_finbert_rows(session, event.id)
        fb_mv = fb_rows[0].model_version_id if fb_rows else None
        layers_present = {st.layer for st in event.statements}
        for layer in COMPARED_LAYERS:
            c_label = None
            # A layer with no statements has nothing to compare. Ignore any label the
            # model gave for it (e.g. a management tone when there was no management text).
            if claude is not None and layer.value in layers_present:
                c_label = (Sentiment(claude.factual_sentiment) if layer is InformationLayer.FACTUAL
                           else tone_to_sentiment(claude.management_tone))
            f_label = fb[layer.value]
            result = compare(c_label, f_label)
            prev = session.scalar(select(ModelComparison).where(
                ModelComparison.event_id == event.id, ModelComparison.layer == layer.value)
                .order_by(ModelComparison.id.desc()).limit(1))
            key = (claude.id if claude else None, fb_mv, c_label and c_label.value, f_label and f_label.value)
            if prev and (prev.claude_prediction_id, prev.finbert_model_version_id,
                         prev.claude_label, prev.finbert_label) == key:
                continue  # nothing changed; keep history free of duplicates
            session.add(ModelComparison(
                event_id=event.id, layer=layer.value, finbert_model_version_id=fb_mv,
                claude_prediction_id=claude.id if claude else None,
                finbert_label=f_label.value if f_label else None, claude_label=c_label.value if c_label else None,
                status=result.status.value, review_required=result.review_required))
            counts[result.status.value] += 1
    session.flush()
    return StageReport("comparison", ran=True, counts=dict(counts))


def latest_comparison(session: Session, event_id: int, layer: InformationLayer) -> ModelComparison | None:
    return session.scalar(select(ModelComparison).where(
        ModelComparison.event_id == event_id, ModelComparison.layer == layer.value)
        .order_by(ModelComparison.id.desc()).limit(1))


def event_divergence(session: Session, event: Event) -> list[str]:
    claude = latest_claude(session, event.id)
    if claude is None:
        return []
    media = media_narrative(session, event)
    return divergence_flags(Sentiment(claude.factual_sentiment), tone_to_sentiment(claude.management_tone),
                            media if media.n else None)


def latest_implications(session: Session) -> list[tuple[Event, EventImpact]]:
    """Implications from each event's latest OK interpretation only, so a superseded
    prediction never double-counts."""
    out = []
    for event in session.scalars(select(Event)).all():
        pred = latest_claude(session, event.id)
        if pred is None:
            continue
        for imp in session.scalars(select(EventImpact).where(EventImpact.claude_prediction_id == pred.id)).all():
            out.append((event, imp))
    return out
