"""Deterministic event typing and statement layering from config/event_rules.yaml."""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import yaml

from mie.core.config import CONFIG_DIR
from mie.core.enums import DocumentType, EventType, InformationLayer, SourceType

MEDIA_SOURCE_TYPES = {SourceType.LICENSED_NEWS.value, SourceType.PUBLIC_MEDIA.value}
MANAGEMENT_DOC_TYPES = {DocumentType.TRANSCRIPT.value, DocumentType.INTERVIEW.value}


def base_source_key(key: str) -> str:
    """Fixture sources share rules with their live counterpart."""
    return key.removesuffix("__fixture")


@dataclass
class EventRules:
    release_groups: dict[str, dict]
    source_categories: dict[str, dict[str, str]]
    keyword_rules: list[tuple[EventType, list[re.Pattern], list[str]]]
    commentary_cues: list[re.Pattern]

    @classmethod
    def from_yaml(cls, path: Path | None = None) -> "EventRules":
        raw = yaml.safe_load((path or CONFIG_DIR / "event_rules.yaml").read_text())
        kw = []
        for r in raw.get("keyword_rules", []):
            phrases = r["any"]
            kw.append((EventType(r["event_type"]), [_phrase(p) for p in phrases], phrases))
        return cls(
            release_groups=raw.get("release_groups", {}),
            source_categories=raw.get("source_categories", {}),
            keyword_rules=kw,
            commentary_cues=[_phrase(c) for c in raw.get("commentary_cues", [])],
        )

    def classify(self, source_key: str, categories: list[str], text: str) -> tuple[EventType, str]:
        """Returns (event_type, reason) — the reason is stored for auditability."""
        mapping = self.source_categories.get(base_source_key(source_key), {})
        for cat in categories:
            if cat in mapping:
                return EventType(mapping[cat]), f"source_category:{cat}"
        for event_type, patterns, phrases in self.keyword_rules:
            for pattern, phrase in zip(patterns, phrases):
                if pattern.search(text):
                    return event_type, f"keyword:{phrase}"
        return EventType.OTHER, "no_rule_matched"

    def layer_for(self, source_type: str, document_type: str, sentence: str) -> InformationLayer:
        if source_type in MEDIA_SOURCE_TYPES or document_type == DocumentType.NEWS_ARTICLE.value:
            return InformationLayer.MEDIA
        if document_type in MANAGEMENT_DOC_TYPES:
            return InformationLayer.MANAGEMENT
        if any(p.search(sentence) for p in self.commentary_cues):
            return InformationLayer.MANAGEMENT
        return InformationLayer.FACTUAL


def _phrase(p: str) -> re.Pattern:
    # Acronyms (all caps) match case-sensitively to avoid false hits.
    flags = 0 if (p.isupper() and len(p) <= 6) else re.IGNORECASE
    return re.compile(r"(?<![\w-])" + re.escape(p) + r"(?![\w-])", flags)
