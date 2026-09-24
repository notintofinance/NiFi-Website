"""Point-in-time event labels for aggregation.

A LabelBook loads every event with its prediction history once, then answers
"what label did source S assign to event E, using only predictions that existed
at time t?". Aggregation and history are built on this, so a historical
breadth value can be reproduced exactly as it would have been shown at t.

Label sources are separate information layers or models. None is ever averaged
with another.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Callable

from sqlalchemy import select
from sqlalchemy.orm import Session

from mie.core.enums import InformationLayer, Sentiment
from mie.db.models import ClaudePrediction, Event, EventStatement, FinbertPrediction
from mie.intelligence.comparison import NON_DIRECTIONAL, tone_to_sentiment
from mie.intelligence.narrative import narrative_distribution
from mie.models.finbert import derive_event_label

GLOBAL = "GLOBAL"

LABEL_SOURCES: dict[str, str] = {
    "claude_factual": "Claude: factual layer",
    "finbert_factual": "FinBERT: factual layer (derived from sentences)",
    "agreed_factual": "Factual layer, events where Claude and FinBERT agree",
    "claude_management": "Claude: management tone",
    "finbert_management": "FinBERT: management layer",
    "media_narrative": "Media narrative: plurality of per-article FinBERT labels",
}


@dataclass(frozen=True)
class ClaudeObs:
    predicted_at: datetime
    prediction_id: int
    factual: Sentiment | None
    management: Sentiment | None


@dataclass(frozen=True)
class FinbertObs:
    predicted_at: datetime
    model_version_id: int
    layer: str
    label: str
    document_id: int


@dataclass
class EventRecord:
    event_id: int
    title: str
    event_type: str
    country: str | None
    event_time: datetime
    known_at: datetime                 # earliest retrieval of any supporting document
    layers_present: frozenset[str]
    claude: list[ClaudeObs] = field(default_factory=list)    # sorted by (predicted_at, id)
    finbert: list[FinbertObs] = field(default_factory=list)


def _visible(t: datetime | None, predicted_at: datetime) -> bool:
    return t is None or predicted_at <= t


class LabelBook:
    def __init__(self, events: list[EventRecord]):
        self.events = events
        self._sources: dict[str, Callable[[EventRecord, datetime | None], Sentiment | None]] = {
            "claude_factual": lambda e, t: self._claude(e, t, "factual"),
            "finbert_factual": lambda e, t: self._finbert(e, t, InformationLayer.FACTUAL.value),
            "agreed_factual": self._agreed,
            "claude_management": lambda e, t: self._claude(e, t, "management"),
            "finbert_management": lambda e, t: self._finbert(e, t, InformationLayer.MANAGEMENT.value),
            "media_narrative": self._media,
        }
        assert set(self._sources) == set(LABEL_SOURCES)

    # ------------------------------------------------------------------ loading
    @classmethod
    def from_session(cls, session: Session) -> "LabelBook":
        stmt_doc = {s.id: (s.document_id, s.layer) for s in session.scalars(select(EventStatement)).all()}
        claude: dict[int, list[ClaudeObs]] = {}
        for p in session.scalars(select(ClaudePrediction).where(ClaudePrediction.status == "OK")
                                 .order_by(ClaudePrediction.predicted_at, ClaudePrediction.id)).all():
            claude.setdefault(p.event_id, []).append(ClaudeObs(
                p.predicted_at, p.id, Sentiment(p.factual_sentiment) if p.factual_sentiment else None,
                tone_to_sentiment(p.management_tone)))
        finbert: dict[int, list[FinbertObs]] = {}
        for p in session.scalars(select(FinbertPrediction)).all():
            finbert.setdefault(p.event_id, []).append(FinbertObs(
                p.predicted_at, p.model_version_id, p.layer, p.label, stmt_doc[p.statement_id][0]))
        records = []
        for e in session.scalars(select(Event).order_by(Event.id)).all():
            records.append(EventRecord(
                event_id=e.id, title=e.title, event_type=e.event_type, country=e.country,
                event_time=e.event_time,
                known_at=min((ed.document.retrieved_at for ed in e.documents), default=e.created_at),
                layers_present=frozenset(st.layer for st in e.statements),
                claude=claude.get(e.id, []), finbert=finbert.get(e.id, []),
            ))
        return cls(records)

    # ------------------------------------------------------------------ labels
    def label(self, event: EventRecord, source: str, at: datetime | None = None) -> Sentiment | None:
        """Label from `source` using only predictions made at or before `at`
        (None = everything stored now, i.e. restated)."""
        return self._sources[source](event, at)

    def _claude(self, e: EventRecord, t: datetime | None, which: str) -> Sentiment | None:
        layer = InformationLayer.FACTUAL if which == "factual" else InformationLayer.MANAGEMENT
        if layer.value not in e.layers_present:
            return None  # no text in this layer: a label for it is not comparable or countable
        visible = [c for c in e.claude if _visible(t, c.predicted_at)]
        if not visible:
            return None
        latest = visible[-1]
        return latest.factual if which == "factual" else latest.management

    def _finbert_rows(self, e: EventRecord, t: datetime | None) -> list[FinbertObs]:
        visible = [f for f in e.finbert if _visible(t, f.predicted_at)]
        if not visible:
            return []
        mv = max(f.model_version_id for f in visible)  # latest model version available at t
        return [f for f in visible if f.model_version_id == mv]

    def _finbert(self, e: EventRecord, t: datetime | None, layer: str) -> Sentiment | None:
        return derive_event_label([f.label for f in self._finbert_rows(e, t) if f.layer == layer])

    def _agreed(self, e: EventRecord, t: datetime | None) -> Sentiment | None:
        c, f = self._claude(e, t, "factual"), self._finbert(e, t, InformationLayer.FACTUAL.value)
        return c if c is not None and c == f and c not in NON_DIRECTIONAL else None

    def _media(self, e: EventRecord, t: datetime | None) -> Sentiment | None:
        per_doc: dict[int, list[str]] = {}
        for f in self._finbert_rows(e, t):
            if f.layer == InformationLayer.MEDIA.value:
                per_doc.setdefault(f.document_id, []).append(f.label)
        doc_labels = [lbl for lbl in (derive_event_label(v) for v in per_doc.values())
                      if lbl in (Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE)]
        return narrative_distribution(doc_labels).plurality if doc_labels else None

    # ------------------------------------------------------------------ scopes
    def scopes(self) -> list[str]:
        return [GLOBAL, *sorted({e.country for e in self.events if e.country})]

    def in_scope(self, e: EventRecord, scope: str) -> bool:
        return scope == GLOBAL or e.country == scope
