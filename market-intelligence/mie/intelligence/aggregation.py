"""Event-level aggregation without weights.

Sentiment Breadth = (Positive − Negative) / Total classified unique events

"Classified" = POSITIVE, NEUTRAL, NEGATIVE or MIXED. UNCERTAIN and
INSUFFICIENT_CONTEXT are not directional judgements, so they are excluded from
the denominator. They are still counted and reported so they are never hidden.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterable, Mapping

from mie.core.enums import Sentiment

WINDOWS: dict[str, timedelta] = {
    "24H": timedelta(hours=24),
    "3D": timedelta(days=3),
    "7D": timedelta(days=7),
    "30D": timedelta(days=30),
}
CLASSIFIED = (Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE, Sentiment.MIXED)
UNCLASSIFIED = (Sentiment.UNCERTAIN, Sentiment.INSUFFICIENT_CONTEXT)


@dataclass(frozen=True)
class BreadthResult:
    positive: int
    neutral: int
    negative: int
    mixed: int
    uncertain: int          # UNCERTAIN + INSUFFICIENT_CONTEXT
    total_classified: int

    @property
    def breadth(self) -> float | None:
        if self.total_classified == 0:
            return None
        return (self.positive - self.negative) / self.total_classified

    @property
    def breadth_scaled(self) -> int | None:
        """−100…+100, rounded to an integer to avoid pseudo-precision."""
        b = self.breadth
        return None if b is None else round(b * 100)

    def shares(self) -> dict[str, float | None]:
        t = self.total_classified
        return {
            "positive": self.positive / t if t else None,
            "neutral": self.neutral / t if t else None,
            "negative": self.negative / t if t else None,
            "mixed": self.mixed / t if t else None,
        }

    def as_dict(self) -> dict:
        return {
            "breadth": self.breadth, "breadth_scaled": self.breadth_scaled,
            "positive": self.positive, "neutral": self.neutral, "negative": self.negative,
            "mixed": self.mixed, "uncertain": self.uncertain,
            "total_classified": self.total_classified, "shares": self.shares(),
        }


def breadth_from_counts(counts: Mapping[Sentiment | str, int]) -> BreadthResult:
    c = Counter({Sentiment(k): v for k, v in counts.items()})
    return BreadthResult(
        positive=c[Sentiment.POSITIVE], neutral=c[Sentiment.NEUTRAL], negative=c[Sentiment.NEGATIVE],
        mixed=c[Sentiment.MIXED], uncertain=sum(c[u] for u in UNCLASSIFIED),
        total_classified=sum(c[k] for k in CLASSIFIED),
    )


def breadth_from_labels(labels: Iterable[Sentiment | str | None]) -> BreadthResult:
    return breadth_from_counts(Counter(Sentiment(x) for x in labels if x is not None))


@dataclass(frozen=True)
class LabelledEvent:
    event_id: int
    event_time: datetime
    label: Sentiment | None


def windowed_breadth(events: Iterable[LabelledEvent], as_of: datetime,
                     windows: Mapping[str, timedelta] = WINDOWS) -> dict[str, BreadthResult]:
    """Rolling windows (as_of − w, as_of]. Events after as_of are ignored, so a
    historical as_of never sees the future. One row per unique event."""
    evs = list({e.event_id: e for e in events}.values())  # guard: one observation per event
    out = {}
    for name, w in windows.items():
        lo = as_of - w
        out[name] = breadth_from_labels(e.label for e in evs if lo < e.event_time <= as_of)
    return out
