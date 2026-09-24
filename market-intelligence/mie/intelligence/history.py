"""Breadth over time, drivers, momentum and snapshots.

Two modes answer different questions and are never mixed:

* POINT_IN_TIME: what the system knew at t. An event counts only if it was
  already retrieved (known_at <= t), and only predictions made at or before t
  are used. This is the only mode valid for backtests or signal evaluation.
* RESTATED: today's labels applied to past windows. Useful for reading history
  with the best current labels, but it contains hindsight.

The gap between the two is shown rather than hidden.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Literal

from sqlalchemy.orm import Session

from mie.core.enums import Sentiment
from mie.db.models import SentimentSnapshot
from mie.intelligence.aggregation import WINDOWS, BreadthResult, breadth_from_labels
from mie.intelligence.labels import LABEL_SOURCES, EventRecord, LabelBook

Mode = Literal["POINT_IN_TIME", "RESTATED"]
METHODOLOGY_VERSION = "breadth-v1"  # bump when the definition of breadth or labels changes

# Pairs compared for momentum: (short, long).
MOMENTUM_PAIRS = (("24H", "7D"), ("7D", "30D"))


@dataclass(frozen=True)
class Contributor:
    event_id: int
    title: str
    event_type: str
    event_time: datetime
    label: Sentiment


def _window_events(book: LabelBook, t: datetime, window: timedelta, scope: str,
                   mode: Mode) -> list[EventRecord]:
    lo = t - window
    return [e for e in book.events
            if book.in_scope(e, scope) and lo < e.event_time <= t
            and (mode == "RESTATED" or e.known_at <= t)]


def breadth_at(book: LabelBook, source: str, t: datetime, window: timedelta, scope: str,
               mode: Mode = "POINT_IN_TIME") -> tuple[BreadthResult, list[Contributor]]:
    at = t if mode == "POINT_IN_TIME" else None
    contributors = []
    labels = []
    for e in _window_events(book, t, window, scope, mode):
        lbl = book.label(e, source, at)
        labels.append(lbl)
        if lbl is not None:
            contributors.append(Contributor(e.event_id, e.title, e.event_type, e.event_time, lbl))
    return breadth_from_labels(labels), sorted(contributors, key=lambda c: (c.event_time, c.event_id), reverse=True)


def asset_breadth_at(book: LabelBook, asset: str, t: datetime, window: timedelta, scope: str = "GLOBAL",
                     mode: Mode = "POINT_IN_TIME") -> BreadthResult:
    """Breadth for one asset over events whose interpretation (visible at t) states a
    direction for it. Events silent on the asset are not counted."""
    at = t if mode == "POINT_IN_TIME" else None
    return breadth_from_labels(book.asset_direction(e, asset, at)
                               for e in _window_events(book, t, window, scope, mode))


def week_on_week(current: BreadthResult, previous: BreadthResult) -> dict:
    """Change of a window's breadth versus the same window one week earlier (both
    point-in-time). Direction is the sign of the change; no threshold."""
    if current.breadth_scaled is None or previous.breadth_scaled is None:
        return {"delta": None, "direction": None, "previous": previous.breadth_scaled}
    d = current.breadth_scaled - previous.breadth_scaled
    return {"delta": d, "direction": "UP" if d > 0 else "DOWN" if d < 0 else "FLAT",
            "previous": previous.breadth_scaled}


def drivers(contributors: list[Contributor]) -> dict[str, list[Contributor]]:
    """Events behind a breadth value, grouped by label, newest first. There is no
    importance ranking: ordering by anything but time would need invented weights."""
    out: dict[str, list[Contributor]] = {}
    for c in contributors:
        out.setdefault(c.label.value, []).append(c)
    return out


def series(book: LabelBook, source: str, window: timedelta, end: datetime, days: int, scope: str,
           mode: Mode) -> list[tuple[datetime, BreadthResult]]:
    """Daily points ending at `end`, oldest first."""
    points = [end - timedelta(days=d) for d in range(days - 1, -1, -1)]
    return [(t, breadth_at(book, source, t, window, scope, mode)[0]) for t in points]


def _sign(x: float | None) -> int | None:
    if x is None:
        return None
    return (x > 0) - (x < 0)


def reversal(short: BreadthResult, long: BreadthResult) -> bool:
    """Parameter-free: both defined and of strictly opposite sign. Zero is not a
    reversal. Sample sizes are reported with every flag; read small n with care."""
    a, b = _sign(short.breadth), _sign(long.breadth)
    return a is not None and b is not None and a * b < 0


def momentum(book: LabelBook, source: str, t: datetime, scope: str) -> dict:
    values = {w: breadth_at(book, source, t, d, scope)[0] for w, d in WINDOWS.items()}
    return {
        "windows": {w: b.as_dict() for w, b in values.items()},
        "reversals": [{"short": s, "long": lg, "short_breadth": values[s].breadth_scaled,
                       "long_breadth": values[lg].breadth_scaled, "short_n": values[s].total_classified,
                       "long_n": values[lg].total_classified}
                      for s, lg in MOMENTUM_PAIRS if reversal(values[s], values[lg])],
    }


def reversals_all(book: LabelBook, t: datetime, sources: tuple[str, ...] = ("claude_factual", "finbert_factual",
                                                                              "agreed_factual")) -> list[dict]:
    out = []
    for scope in book.scopes():
        for src in sources:
            for r in momentum(book, src, t, scope)["reversals"]:
                out.append({"scope": scope, "label_source": src, **r})
    return out


def take_snapshot(session: Session, book: LabelBook, as_of: datetime) -> int:
    """Append-only record of the point-in-time values shown at as_of, for every
    scope x label source x window. Returns rows written."""
    n = 0
    for scope in book.scopes():
        for src in LABEL_SOURCES:
            for w, d in WINDOWS.items():
                b, _ = breadth_at(book, src, as_of, d, scope, "POINT_IN_TIME")
                session.add(SentimentSnapshot(
                    as_of=as_of, scope=scope, label_source=src, window=w, methodology_version=METHODOLOGY_VERSION,
                    positive=b.positive, neutral=b.neutral, negative=b.negative, mixed=b.mixed,
                    uncertain=b.uncertain, total_classified=b.total_classified, breadth=b.breadth))
                n += 1
    session.flush()
    return n
