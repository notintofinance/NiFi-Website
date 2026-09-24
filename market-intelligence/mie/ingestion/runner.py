"""Runs connectors, stores documents, logs every run. One failing source never
stops the others."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from mie.core.enums import RunStatus
from mie.core.schemas import NormalizedDocument
from mie.db.models import Document, IngestionRun, MacroObservation, Source
from mie.db.repository import upsert_source
from mie.ingestion.base import FetchError, HttpFetcher, ParseError, SourceConnector
from mie.processing.cleaner import content_hash

log = logging.getLogger(__name__)


@dataclass
class StoreResult:
    inserted: list[int]
    duplicates: int
    revised: int


def store_documents(session: Session, source: Source, docs: list[NormalizedDocument]) -> StoreResult:
    inserted: list[int] = []
    duplicates = revised = 0
    for d in docs:
        h = content_hash(d.headline, d.body)
        existing = session.scalar(
            select(Document).where(Document.source_id == source.id, Document.external_id == d.external_id)
        )
        if existing is not None:
            if existing.content_hash == h:
                duplicates += 1
                continue
            # Republished with different content: keep a trace instead of overwriting silently.
            history = list(existing.raw_metadata.get("previous_versions", []))
            history.append({"content_hash": existing.content_hash, "headline": existing.headline,
                            "retrieved_at": existing.retrieved_at.isoformat()})
            existing.raw_metadata = {**d.raw_metadata, "previous_versions": history}
            existing.headline, existing.body, existing.content_hash = d.headline, d.body, h
            existing.content_revisions += 1
            revised += 1
            continue
        row = Document(
            source_id=source.id, external_id=d.external_id, url=d.url,
            document_type=d.document_type.value, language=d.language, headline=d.headline,
            body=d.body, author=d.author, published_at=d.published_at, retrieved_at=d.retrieved_at,
            timestamp_quality=d.timestamp_quality.value, content_hash=h, raw_metadata=d.raw_metadata,
        )
        session.add(row)
        session.flush()
        inserted.append(row.id)
        obs = d.raw_metadata.get("observation")
        if obs:
            _store_observation(session, source, row, obs)
    return StoreResult(inserted, duplicates, revised)


def _store_observation(session: Session, source: Source, doc: Document, obs: dict) -> None:
    row = session.scalar(select(MacroObservation).where(
        MacroObservation.source_id == source.id,
        MacroObservation.series_id == obs["series_id"],
        MacroObservation.period == obs["period"],
    ))
    if row is None:
        session.add(MacroObservation(
            source_id=source.id, series_id=obs["series_id"], period=obs["period"],
            value=obs["value"], unit=obs["unit"], document_id=doc.id, derived={},
        ))
    elif row.value != obs["value"]:
        revisions = list(row.derived.get("revisions", []))
        revisions.append({"previous_value": row.value, "document_id": row.document_id})
        row.derived = {**row.derived, "revisions": revisions}
        row.value, row.document_id = obs["value"], doc.id
    session.flush()


def run_connector(session: Session, connector: SourceConnector, http: HttpFetcher | None,
                  fixture_dir: Path | None = None) -> IngestionRun:
    source = upsert_source(session, connector.spec)
    run = IngestionRun(source_id=source.id, started_at=datetime.now(timezone.utc), status=RunStatus.FAILED.value)
    session.add(run)
    session.flush()
    try:
        if fixture_dir is not None:
            payloads = connector.load_fixtures(fixture_dir)
            run.attempts = 1
        else:
            assert http is not None
            payloads = connector.fetch(http)
            run.attempts = http.last_attempts
        run.fetched = len(payloads)
        docs: list[NormalizedDocument] = []
        for p in payloads:
            try:
                docs.extend(connector.parse(p))
            except ParseError as exc:
                run.parse_errors += 1
                run.error_type, run.error_message = "ParseError", str(exc)[:2000]
        run.parsed = len(docs)
        run.missing_timestamps = sum(1 for d in docs if d.published_at is None)
        with session.begin_nested():  # a storage failure rolls back this source only
            result = store_documents(session, source, docs)
        run.inserted, run.duplicates = len(result.inserted), result.duplicates
        run.status = (RunStatus.PARTIAL if run.parse_errors else RunStatus.SUCCESS).value
    except FetchError as exc:
        run.attempts = exc.attempts
        run.error_type = type(exc.cause).__name__ if exc.cause else "FetchError"
        run.error_message = str(exc)[:2000]
        log.error("source %s unavailable: %s", connector.spec.key, exc)
    except Exception as exc:  # isolate unexpected connector bugs from other sources
        run.error_type, run.error_message = type(exc).__name__, str(exc)[:2000]
        log.exception("source %s failed", connector.spec.key)
    run.finished_at = datetime.now(timezone.utc)
    session.flush()
    return run


def run_all(session: Session, connectors: list[SourceConnector], user_agent: str, timeout_s: float,
            max_attempts: int, fixture_dir: Path | None = None) -> list[IngestionRun]:
    runs: list[IngestionRun] = []
    with httpx.Client(headers={"User-Agent": user_agent}, timeout=timeout_s, follow_redirects=True) as client:
        http = HttpFetcher(client, max_attempts=max_attempts)
        for c in connectors:
            runs.append(run_connector(session, c, http, fixture_dir))
            session.commit()
    return runs
