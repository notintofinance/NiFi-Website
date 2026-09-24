"""Typed contracts between the Data, Event and Intelligence engines."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, field_validator

from mie.core.enums import DocumentType, SourceType, TimestampQuality


def ensure_utc(value: datetime | None) -> datetime | None:
    """Naive datetimes are rejected rather than guessed: point-in-time correctness
    depends on knowing the zone."""
    if value is None:
        return None
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("naive datetime not allowed; attach a timezone")
    return value.astimezone(timezone.utc)


class SourceSpec(BaseModel):
    """Descriptive source metadata. Deliberately has no credibility weight."""
    key: str
    name: str
    source_type: SourceType
    country: str | None = None
    base_url: str | None = None
    access_method: str                      # e.g. "RSS", "REST_API", "HTML"
    licence_note: str
    allow_external_llm: bool = False        # may content be sent to an external AI provider?
    is_fixture: bool = False


class NormalizedDocument(BaseModel):
    external_id: str                        # original document ID at the source
    source_key: str
    document_type: DocumentType
    language: str = "en"
    headline: str
    body: str = ""
    url: str | None = None
    author: str | None = None
    published_at: datetime | None = None
    retrieved_at: datetime
    raw_metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("published_at", "retrieved_at")
    @classmethod
    def _to_utc(cls, value: datetime | None) -> datetime | None:
        return ensure_utc(value)

    @property
    def timestamp_quality(self) -> TimestampQuality:
        return TimestampQuality.SOURCE if self.published_at else TimestampQuality.MISSING_PUBLISHED_AT

    @property
    def knowledge_time(self) -> datetime:
        """Earliest time we can claim to have known this. Never earlier than retrieval
        when the publisher gave no timestamp."""
        return self.published_at or self.retrieved_at


class RawPayload(BaseModel):
    """Raw bytes as fetched, plus fetch context. Parsing is a separate pure step."""
    source_key: str
    content: bytes
    content_type: str | None = None
    fetched_at: datetime
    request_meta: dict[str, Any] = Field(default_factory=dict)
