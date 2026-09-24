"""Builds the minimal, source-blind, price-blind input that classifiers see.

* Source-blind: no publisher name, URL, author, popularity or view count. Known
  source names that appear inside statement text are masked.
* Price-blind / point-in-time: only statements from documents retrieved at or
  before `as_of` are included, and market_data is never read.
* Minimal: deduplicated statements, capped per layer, plus Python-computed facts.
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from mie.core.enums import InformationLayer
from mie.db.models import Event, Source

SOURCE_MASK = "[SOURCE]"


class BriefStatement(BaseModel):
    statement_id: int  # kept locally for traceability; stripped from the model payload
    text: str


class EventBrief(BaseModel):
    event_id: int
    event_type: str
    event_date: str                      # date only; the exact time adds nothing
    country: str | None
    entities: list[str]
    layers: dict[str, list[BriefStatement]]
    computed_facts: list[dict]
    omitted_statements: dict[str, int]   # counted, not silently dropped
    excluded_after_as_of: int
    excluded_not_permitted: int
    as_of: datetime

    def model_payload(self) -> dict:
        """Exactly what an external model receives. No ids, no sources, no as_of."""
        return {
            "event_type": self.event_type,
            "event_date": self.event_date,
            "country": self.country,
            "entities": self.entities,
            "computed_facts": self.computed_facts,
            **{f"{layer.lower()}_statements": [s.text for s in stmts] for layer, stmts in self.layers.items()},
        }

    def input_hash(self) -> str:
        canonical = json.dumps(self.model_payload(), sort_keys=True, ensure_ascii=False, separators=(",", ":"))
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def is_empty(self) -> bool:
        return not any(self.layers.values()) and not self.computed_facts


def mask_source_names(text: str, names: list[str]) -> str:
    for name in sorted(names, key=len, reverse=True):
        text = re.sub(re.escape(name), SOURCE_MASK, text, flags=re.IGNORECASE)
    return text


def build_event_brief(session: Session, event: Event, as_of: datetime, max_per_layer: int,
                      external_llm: bool) -> EventBrief:
    """external_llm=True drops statements from sources not cleared for external AI providers."""
    source_names = [n for n in session.scalars(select(Source.name)).all() if n]
    layers: dict[str, list[BriefStatement]] = {layer.value: [] for layer in InformationLayer}
    omitted = {layer.value: 0 for layer in InformationLayer}
    facts: list[dict] = []
    after_as_of = not_permitted = 0
    for st in event.statements:
        doc = st.document
        if doc.retrieved_at > as_of:
            after_as_of += 1
            continue
        if external_llm and not doc.source.allow_external_llm:
            not_permitted += 1
            continue
        if st.value is not None:
            # Published precision only; full-precision values stay in the DB.
            facts.append(dict(st.value.get("published", {})) | {"description": st.text})
            continue
        bucket = layers[st.layer]
        if len(bucket) >= max_per_layer:
            omitted[st.layer] += 1
            continue
        bucket.append(BriefStatement(statement_id=st.id, text=mask_source_names(st.text, source_names)))
    return EventBrief(
        event_id=event.id, event_type=event.event_type, event_date=event.event_time.date().isoformat(),
        country=event.country, entities=sorted(ee.entity.name for ee in event.entities),
        layers=layers, computed_facts=facts, omitted_statements=omitted,
        excluded_after_as_of=after_as_of, excluded_not_permitted=not_permitted, as_of=as_of,
    )
