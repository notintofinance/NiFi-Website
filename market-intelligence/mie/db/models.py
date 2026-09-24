"""Relational schema. Runs unchanged on SQLite (MVP) and PostgreSQL.

Prediction tables are append-only: rows are inserted, never updated. A new
model version, prompt version or input produces a new row.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    TypeDecorator,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UTCDateTime(TypeDecorator):
    """Stores UTC; always returns timezone-aware UTC (SQLite drops tzinfo otherwise)."""

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value: datetime | None, dialect: Any) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            raise ValueError("naive datetime not allowed in UTCDateTime column")
        return value.astimezone(timezone.utc)

    def process_result_value(self, value: datetime | None, dialect: Any) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)


class Base(DeclarativeBase):
    pass


# --------------------------------------------------------------------------- data engine
class Source(Base):
    __tablename__ = "sources"
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    source_type: Mapped[str] = mapped_column(String(40))
    country: Mapped[str | None] = mapped_column(String(8))
    base_url: Mapped[str | None] = mapped_column(String(500))
    access_method: Mapped[str] = mapped_column(String(40))
    licence_note: Mapped[str] = mapped_column(Text)
    allow_external_llm: Mapped[bool] = mapped_column(Boolean, default=False)
    is_fixture: Mapped[bool] = mapped_column(Boolean, default=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (UniqueConstraint("source_id", "external_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("sources.id"))
    external_id: Mapped[str] = mapped_column(String(500))
    url: Mapped[str | None] = mapped_column(String(1000))
    document_type: Mapped[str] = mapped_column(String(40))
    language: Mapped[str] = mapped_column(String(8))
    headline: Mapped[str] = mapped_column(Text)
    body: Mapped[str] = mapped_column(Text, default="")
    author: Mapped[str | None] = mapped_column(String(300))
    published_at: Mapped[datetime | None] = mapped_column(UTCDateTime)
    retrieved_at: Mapped[datetime] = mapped_column(UTCDateTime)
    timestamp_quality: Mapped[str] = mapped_column(String(40))
    content_hash: Mapped[str] = mapped_column(String(64))
    content_revisions: Mapped[int] = mapped_column(Integer, default=0)
    raw_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    # PENDING -> EVENTED | HISTORY_ONLY (stored series history, not a new release)
    processing_status: Mapped[str] = mapped_column(String(20), default="PENDING")

    source: Mapped[Source] = relationship()

    @property
    def knowledge_time(self) -> datetime:
        return self.published_at or self.retrieved_at


class Entity(Base):
    __tablename__ = "entities"
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    entity_type: Mapped[str] = mapped_column(String(40))
    country: Mapped[str | None] = mapped_column(String(8))
    tickers: Mapped[list] = mapped_column(JSON, default=list)
    asset_classes: Mapped[list] = mapped_column(JSON, default=list)


class DocumentEntity(Base):
    __tablename__ = "document_entities"
    __table_args__ = (UniqueConstraint("document_id", "entity_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"))
    entity_id: Mapped[int] = mapped_column(ForeignKey("entities.id"))
    matched_alias: Mapped[str] = mapped_column(String(200))
    method: Mapped[str] = mapped_column(String(40), default="DICTIONARY_V1")


class MacroObservation(Base):
    __tablename__ = "macro_observations"
    __table_args__ = (UniqueConstraint("source_id", "series_id", "period"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("sources.id"))
    series_id: Mapped[str] = mapped_column(String(80))
    period: Mapped[str] = mapped_column(String(20))       # e.g. 2026-08
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(40))
    derived: Mapped[dict] = mapped_column(JSON, default=dict)
    document_id: Mapped[int | None] = mapped_column(ForeignKey("documents.id"))


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("sources.id"))
    started_at: Mapped[datetime] = mapped_column(UTCDateTime)
    finished_at: Mapped[datetime | None] = mapped_column(UTCDateTime)
    status: Mapped[str] = mapped_column(String(20))
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    fetched: Mapped[int] = mapped_column(Integer, default=0)
    parsed: Mapped[int] = mapped_column(Integer, default=0)
    inserted: Mapped[int] = mapped_column(Integer, default=0)
    duplicates: Mapped[int] = mapped_column(Integer, default=0)
    missing_timestamps: Mapped[int] = mapped_column(Integer, default=0)
    parse_errors: Mapped[int] = mapped_column(Integer, default=0)
    error_type: Mapped[str | None] = mapped_column(String(120))
    error_message: Mapped[str | None] = mapped_column(Text)

    source: Mapped[Source] = relationship()


# --------------------------------------------------------------------------- event engine
class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    # Natural key for structured events (e.g. "BLS:CUUR0000SA0:2026-08"); NULL for clustered text.
    event_key: Mapped[str | None] = mapped_column(String(200), unique=True)
    event_type: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(Text)
    event_time: Mapped[datetime] = mapped_column(UTCDateTime)
    event_time_quality: Mapped[str] = mapped_column(String(40))
    country: Mapped[str | None] = mapped_column(String(8))
    asset_classes: Mapped[list] = mapped_column(JSON, default=list)
    extraction_method: Mapped[str] = mapped_column(String(60))
    dedup_method: Mapped[str] = mapped_column(String(60))
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    documents: Mapped[list["EventDocument"]] = relationship(back_populates="event")
    statements: Mapped[list["EventStatement"]] = relationship(
        back_populates="event", order_by="EventStatement.position"
    )
    entities: Mapped[list["EventEntity"]] = relationship()


class EventDocument(Base):
    __tablename__ = "event_documents"
    # A document belongs to exactly one event.
    __table_args__ = (UniqueConstraint("document_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"))
    similarity: Mapped[float | None] = mapped_column(Float)  # observed score at attach time
    attached_by: Mapped[str] = mapped_column(String(60))      # NATURAL_KEY | NEW_EVENT | LEXICAL_COSINE_V1
    attached_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    event: Mapped[Event] = relationship(back_populates="documents")
    document: Mapped[Document] = relationship()


class EventEntity(Base):
    __tablename__ = "event_entities"
    __table_args__ = (UniqueConstraint("event_id", "entity_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    entity_id: Mapped[int] = mapped_column(ForeignKey("entities.id"))
    entity: Mapped[Entity] = relationship()


class EventStatement(Base):
    """One statement in one information layer, traceable to its document."""
    __tablename__ = "event_statements"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"))
    layer: Mapped[str] = mapped_column(String(20))
    text: Mapped[str] = mapped_column(Text)
    # none_as_null: store SQL NULL (not JSON null) so "IS NULL" filters work.
    value: Mapped[dict | None] = mapped_column(JSON(none_as_null=True))  # structured fact, when computed
    language: Mapped[str] = mapped_column(String(8), default="en")
    position: Mapped[int] = mapped_column(Integer, default=0)

    event: Mapped[Event] = relationship(back_populates="statements")
    document: Mapped[Document] = relationship()


# --------------------------------------------------------------------------- intelligence engine
class ModelVersion(Base):
    __tablename__ = "model_versions"
    __table_args__ = (UniqueConstraint("name", "version"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    version: Mapped[str] = mapped_column(String(120))
    kind: Mapped[str] = mapped_column(String(40))
    config: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


class FinbertPrediction(Base):
    """Sentence-level FinBERT output (append-only). Probabilities are diagnostic only."""
    __tablename__ = "finbert_predictions"
    __table_args__ = (UniqueConstraint("statement_id", "model_version_id", "input_hash"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    statement_id: Mapped[int] = mapped_column(ForeignKey("event_statements.id"))
    layer: Mapped[str] = mapped_column(String(20))
    model_version_id: Mapped[int] = mapped_column(ForeignKey("model_versions.id"))
    label: Mapped[str] = mapped_column(String(20))
    probabilities: Mapped[dict] = mapped_column(JSON)
    input_hash: Mapped[str] = mapped_column(String(64))
    predicted_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


class ClaudePrediction(Base):
    __tablename__ = "claude_predictions"
    __table_args__ = (UniqueConstraint("event_id", "model_version_id", "prompt_version", "input_hash"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    model_version_id: Mapped[int] = mapped_column(ForeignKey("model_versions.id"))
    prompt_version: Mapped[str] = mapped_column(String(40))
    served_model: Mapped[str | None] = mapped_column(String(120))  # what actually answered
    status: Mapped[str] = mapped_column(String(20))                 # OK | REFUSED | INVALID | ERROR
    factual_sentiment: Mapped[str | None] = mapped_column(String(30))
    management_tone: Mapped[str | None] = mapped_column(String(30))
    impact_horizon: Mapped[str | None] = mapped_column(String(30))
    output: Mapped[dict] = mapped_column(JSON, default=dict)
    input_hash: Mapped[str] = mapped_column(String(64))
    as_of: Mapped[datetime] = mapped_column(UTCDateTime)  # point-in-time cut-off of the brief
    input_tokens: Mapped[int | None] = mapped_column(Integer)
    output_tokens: Mapped[int | None] = mapped_column(Integer)
    error_message: Mapped[str | None] = mapped_column(Text)
    predicted_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


class EventImpact(Base):
    """One asset implication per row; never combined into a global score."""
    __tablename__ = "event_impacts"
    id: Mapped[int] = mapped_column(primary_key=True)
    claude_prediction_id: Mapped[int] = mapped_column(ForeignKey("claude_predictions.id"))
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    asset: Mapped[str] = mapped_column(String(80))
    direction: Mapped[str] = mapped_column(String(30))
    horizon: Mapped[str] = mapped_column(String(30))
    rationale: Mapped[str] = mapped_column(Text)


class ModelComparison(Base):
    __tablename__ = "model_comparisons"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    layer: Mapped[str] = mapped_column(String(20))
    finbert_model_version_id: Mapped[int | None] = mapped_column(ForeignKey("model_versions.id"))
    claude_prediction_id: Mapped[int | None] = mapped_column(ForeignKey("claude_predictions.id"))
    finbert_label: Mapped[str | None] = mapped_column(String(30))
    claude_label: Mapped[str | None] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30))
    review_required: Mapped[bool] = mapped_column(Boolean, default=False)
    compared_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


class MarketData(Base):
    """Reserved for post-hoc validation (event studies). Classifiers must never read it."""
    __tablename__ = "market_data"
    id: Mapped[int] = mapped_column(primary_key=True)
    instrument: Mapped[str] = mapped_column(String(80))
    observed_at: Mapped[datetime] = mapped_column(UTCDateTime)
    field: Mapped[str] = mapped_column(String(40))
    value: Mapped[float] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(120))
