"""Dictionary-based entity matching. Deterministic and explainable: every match
records the alias that triggered it."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml
from sqlalchemy import select
from sqlalchemy.orm import Session

from mie.core.config import CONFIG_DIR
from mie.db.models import Entity


@dataclass(frozen=True)
class EntityDef:
    key: str
    name: str
    entity_type: str
    country: str | None
    aliases: tuple[str, ...]
    case_sensitive_aliases: tuple[str, ...] = ()
    tickers: tuple[str, ...] = ()
    asset_classes: tuple[str, ...] = ()


@dataclass(frozen=True)
class EntityMatch:
    key: str
    alias: str


@dataclass
class EntityMatcher:
    entities: list[EntityDef]
    _patterns: list[tuple[str, str, re.Pattern]] = field(default_factory=list, init=False)

    def __post_init__(self) -> None:
        for e in self.entities:
            for alias in (*e.aliases, *e.tickers):
                self._patterns.append((e.key, alias, _compile(alias, case_sensitive=alias in e.tickers)))
            for alias in e.case_sensitive_aliases:
                self._patterns.append((e.key, alias, _compile(alias, case_sensitive=True)))

    @classmethod
    def from_yaml(cls, path: Path | None = None) -> "EntityMatcher":
        raw = yaml.safe_load((path or CONFIG_DIR / "entities.yaml").read_text())
        defs = [EntityDef(
            key=e["key"], name=e["name"], entity_type=e["entity_type"], country=e.get("country"),
            aliases=tuple(e.get("aliases", [])),
            case_sensitive_aliases=tuple(e.get("case_sensitive_aliases", [])),
            tickers=tuple(e.get("tickers", [])), asset_classes=tuple(e.get("asset_classes", [])),
        ) for e in raw["entities"]]
        return cls(defs)

    def match(self, text: str) -> list[EntityMatch]:
        found: dict[str, EntityMatch] = {}
        for key, alias, pattern in self._patterns:
            if key not in found and pattern.search(text):
                found[key] = EntityMatch(key, alias)
        return sorted(found.values(), key=lambda m: m.key)

    def sync_to_db(self, session: Session) -> dict[str, Entity]:
        rows: dict[str, Entity] = {}
        for e in self.entities:
            row = session.scalar(select(Entity).where(Entity.key == e.key)) or Entity(key=e.key)
            row.name, row.entity_type, row.country = e.name, e.entity_type, e.country
            row.tickers, row.asset_classes = list(e.tickers), list(e.asset_classes)
            session.add(row)
            rows[e.key] = row
        session.flush()
        return rows


def _compile(alias: str, case_sensitive: bool) -> re.Pattern:
    # Word boundaries that also work for aliases ending in punctuation ("U.S.").
    return re.compile(r"(?<![\w-])" + re.escape(alias) + r"(?![\w-])", 0 if case_sensitive else re.IGNORECASE)
