"""End-to-end pass: ingest → events → FinBERT → Claude typing → Claude interpretation → comparison → snapshot.

Each stage is independent and reports `skipped` with a reason instead of failing
the whole pipeline.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from dataclasses import asdict

from sqlalchemy.orm import Session, sessionmaker

from mie.core.config import FIXTURE_DIR, Settings
from mie.ingestion.registry import load_connectors
from mie.ingestion.runner import run_all
from mie.intelligence.history import take_snapshot
from mie.intelligence.labels import LabelBook
from mie.intelligence.service import StageReport, run_claude, run_claude_typing, run_comparisons, run_finbert
from mie.models.claude import ClaudeClassifier, EventTyper
from mie.models.finbert import FinbertClassifier, SentenceClassifier
from mie.processing.event_extractor import EventExtractor

log = logging.getLogger(__name__)


def ingest(session: Session, settings: Settings, fixtures: bool) -> StageReport:
    connectors = load_connectors(settings, fixtures=fixtures)
    runs = run_all(session, connectors, settings.http_user_agent, settings.http_timeout_s,
                   settings.http_max_attempts, fixture_dir=FIXTURE_DIR if fixtures else None)
    return StageReport("ingest", ran=True, counts={
        f"{r.source.key}:{r.status}": r.inserted for r in runs})


def process(session: Session, settings: Settings) -> StageReport:
    stats = EventExtractor(session, settings).process_pending()
    return StageReport("events", ran=True, counts={
        "documents": stats.documents, "new_events": stats.new_events,
        "attached_to_existing": stats.attached_to_existing, "history_only": stats.history_only})


def snapshot(session: Session, as_of: datetime | None = None) -> StageReport:
    """Record the point-in-time values as shown now (append-only audit trail)."""
    as_of = as_of or datetime.now(timezone.utc)
    rows = take_snapshot(session, LabelBook.from_session(session), as_of)
    return StageReport("snapshot", ran=True, counts={"rows": rows})


def run_pipeline(factory: sessionmaker[Session], settings: Settings, fixtures: bool = False,
                 finbert: SentenceClassifier | None = None,
                 claude: ClaudeClassifier | None = None,
                 typer: EventTyper | None = None) -> list[StageReport]:
    reports: list[StageReport] = []
    with factory() as session:
        reports.append(ingest(session, settings, fixtures))
        session.commit()
        reports.append(process(session, settings))
        session.commit()
        if settings.finbert_enabled:
            clf = finbert or FinbertClassifier(settings.finbert_model, settings.finbert_revision)
            reports.append(run_finbert(session, clf))
        else:
            reports.append(StageReport("finbert", ran=False, skipped_reason="FINBERT_ENABLED is false"))
        session.commit()
        # Typing first: an event re-typed from OTHER can be interpreted in the same pass.
        reports.append(run_claude_typing(session, settings, typer))
        session.commit()
        reports.append(run_claude(session, settings, claude))
        session.commit()
        reports.append(run_comparisons(session))
        session.commit()
        reports.append(snapshot(session))
        session.commit()
    for r in reports:
        log.info("stage %s", asdict(r))
    return reports
