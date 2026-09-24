"""Turns PENDING documents into unique events with layered statements.

Documents are processed in knowledge-time order (then id) so results are
deterministic and never use information from the future.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from mie.core.config import Settings
from mie.core.enums import InformationLayer
from mie.db.models import (
    Document,
    DocumentEntity,
    Event,
    EventDocument,
    EventEntity,
    EventStatement,
    MacroObservation,
)
from mie.processing import macro
from mie.processing.cleaner import split_sentences
from mie.processing.dedup import CandidateEvent, LexicalCosine, SimilarityBackend, decide
from mie.processing.entities import EntityMatcher
from mie.processing.rules import EventRules

log = logging.getLogger(__name__)
EXTRACTION_VERSION = "RULES_V1"


@dataclass
class ExtractionStats:
    documents: int = 0
    new_events: int = 0
    attached_to_existing: int = 0
    history_only: int = 0
    event_ids: set[int] = field(default_factory=set)


class EventExtractor:
    def __init__(self, session: Session, settings: Settings, matcher: EntityMatcher | None = None,
                 rules: EventRules | None = None, backend: SimilarityBackend | None = None):
        self.s = session
        self.settings = settings
        self.matcher = matcher or EntityMatcher.from_yaml()
        self.rules = rules or EventRules.from_yaml()
        self.backend = backend or LexicalCosine()
        self.entity_rows = self.matcher.sync_to_db(session)
        self.window = timedelta(hours=settings.dedup_window_hours)

    # ------------------------------------------------------------------ public
    def process_pending(self) -> ExtractionStats:
        stats = ExtractionStats()
        docs = self.s.scalars(select(Document).where(Document.processing_status == "PENDING")).all()
        for doc in sorted(docs, key=lambda d: (d.knowledge_time, d.id)):
            stats.documents += 1
            entity_keys = self._link_entities(doc)
            if "observation" in doc.raw_metadata:
                self._process_observation(doc, entity_keys, stats)
            else:
                self._process_text(doc, entity_keys, stats)
        self.s.flush()
        return stats

    # ------------------------------------------------------------------ entities
    def _link_entities(self, doc: Document) -> frozenset[str]:
        matches = self.matcher.match(f"{doc.headline}\n{doc.body}")
        for m in matches:
            self.s.add(DocumentEntity(document_id=doc.id, entity_id=self.entity_rows[m.key].id,
                                      matched_alias=m.alias))
        return frozenset(m.key for m in matches)

    # ------------------------------------------------------------------ structured
    def _process_observation(self, doc: Document, entity_keys: frozenset[str], stats: ExtractionStats) -> None:
        obs = doc.raw_metadata["observation"]
        if not obs.get("is_latest"):
            doc.processing_status = "HISTORY_ONLY"  # stored for derivations; not a new release
            stats.history_only += 1
            return
        group = obs["release_group"]
        cfg = self.rules.release_groups[group]
        event_key = f"{group}:{obs['period']}"  # source-independent natural key
        event = self.s.scalar(select(Event).where(Event.event_key == event_key))
        if event is None:
            event = Event(
                event_key=event_key, event_type=cfg["event_type"], title=f"{cfg['title']} — {obs['period']}",
                event_time=doc.knowledge_time, event_time_quality=doc.timestamp_quality,
                country=cfg.get("country"), asset_classes=list(cfg.get("asset_classes", [])),
                extraction_method=f"STRUCTURED_{EXTRACTION_VERSION}", dedup_method="NATURAL_KEY",
            )
            self.s.add(event)
            self.s.flush()
            stats.new_events += 1
        else:
            stats.attached_to_existing += 1
        levels = self._series_levels(doc.source_id, obs["series_id"])
        facts = macro.index_facts(obs["series_id"], obs["period"], levels)
        self.s.add(EventDocument(event=event, document=doc, similarity=None, attached_by="NATURAL_KEY"))
        self._add_statement(event, doc, InformationLayer.FACTUAL,
                            macro.describe_index_facts(facts, obs["series_name"]), value=facts.as_dict())
        self._link_event_entities(event, entity_keys)
        event.updated_at = datetime.now(timezone.utc)
        doc.processing_status = "EVENTED"
        stats.event_ids.add(event.id)

    def _series_levels(self, source_id: int, series_id: str) -> dict[str, float]:
        rows = self.s.scalars(select(MacroObservation).where(
            MacroObservation.source_id == source_id, MacroObservation.series_id == series_id)).all()
        return {r.period: r.value for r in rows}

    # ------------------------------------------------------------------ text
    def _process_text(self, doc: Document, entity_keys: frozenset[str], stats: ExtractionStats) -> None:
        text = f"{doc.headline}. {doc.body}".strip()
        event_type, reason = self.rules.classify(doc.source.key, doc.raw_metadata.get("categories", []), text)
        when = doc.knowledge_time
        decision = decide(text, event_type.value, entity_keys, when, self._candidates(when),
                          self.backend, self.settings.dedup_similarity_threshold, self.window)
        if decision.event_id is None:
            event = Event(
                event_key=None, event_type=event_type.value, title=doc.headline, event_time=when,
                event_time_quality=doc.timestamp_quality, country=doc.source.country,
                asset_classes=sorted({a for k in entity_keys for a in self.entity_rows[k].asset_classes}),
                extraction_method=f"TEXT_{EXTRACTION_VERSION}[{reason}]", dedup_method=self.backend.name,
            )
            self.s.add(event)
            self.s.flush()
            stats.new_events += 1
            attached_by = "NEW_EVENT"
        else:
            event = self.s.get(Event, decision.event_id)
            event.asset_classes = sorted(set(event.asset_classes) |
                                         {a for k in entity_keys for a in self.entity_rows[k].asset_classes})
            stats.attached_to_existing += 1
            attached_by = decision.method
        self.s.add(EventDocument(event=event, document=doc,
                                 similarity=decision.similarity, attached_by=attached_by))
        sentences = split_sentences(doc.body) or [doc.headline]
        for sentence in sentences:
            layer = self.rules.layer_for(doc.source.source_type, doc.document_type, sentence)
            self._add_statement(event, doc, layer, sentence)
        self._link_event_entities(event, entity_keys)
        event.updated_at = datetime.now(timezone.utc)
        doc.processing_status = "EVENTED"
        stats.event_ids.add(event.id)

    def _candidates(self, when: datetime) -> list[CandidateEvent]:
        lo, hi = when - self.window, when + self.window
        events = self.s.scalars(select(Event).where(
            Event.event_key.is_(None), Event.event_time >= lo, Event.event_time <= hi)).all()
        out = []
        for e in events:
            texts = tuple(f"{ed.document.headline}. {ed.document.body}".strip() for ed in e.documents)
            keys = frozenset(ee.entity.key for ee in e.entities)
            out.append(CandidateEvent(e.id, e.event_type, e.event_time, keys, texts))
        return out

    # ------------------------------------------------------------------ helpers
    def _add_statement(self, event: Event, doc: Document, layer: InformationLayer, text: str,
                       value: dict | None = None) -> None:
        # Identical statement text within an event is stored once (duplicate articles).
        existing = {(st.layer, st.text) for st in event.statements}
        if (layer.value, text) in existing:
            return
        st = EventStatement(event_id=event.id, document_id=doc.id, layer=layer.value, text=text,
                            value=value, language=doc.language, position=len(event.statements))
        self.s.add(st)
        event.statements.append(st)

    def _link_event_entities(self, event: Event, keys: frozenset[str]) -> None:
        have = {ee.entity_id for ee in event.entities}
        for k in sorted(keys):
            row = self.entity_rows[k]
            if row.id not in have:
                ee = EventEntity(event_id=event.id, entity_id=row.id)
                ee.entity = row
                self.s.add(ee)
                event.entities.append(ee)
