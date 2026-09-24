"""Media narrative distribution and fact/management/media divergence.

Media volume is never used as a multiplier. A narrative is an observed
distribution with its sample size.
"""
from __future__ import annotations

import math
from collections import Counter
from dataclasses import dataclass
from typing import Iterable

from mie.core.enums import Sentiment

DIRECTIONS = (Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE)


@dataclass(frozen=True)
class NarrativeDistribution:
    n: int
    positive: int
    neutral: int
    negative: int

    def shares(self) -> dict[str, float | None]:
        return {k: (getattr(self, k) / self.n if self.n else None) for k in ("positive", "neutral", "negative")}

    @property
    def dispersion(self) -> float | None:
        """Shannon entropy of the three-way distribution divided by log(3): 0 when
        every outlet agrees, 1 at an even split. Parameter-free. Undefined when n < 2."""
        if self.n < 2:
            return None
        h = -sum((c / self.n) * math.log(c / self.n) for c in (self.positive, self.neutral, self.negative) if c)
        return h / math.log(3)

    @property
    def plurality(self) -> Sentiment | None:
        """Strict plurality only; ties return None rather than an arbitrary pick."""
        counts = {Sentiment.POSITIVE: self.positive, Sentiment.NEUTRAL: self.neutral,
                  Sentiment.NEGATIVE: self.negative}
        top = max(counts.values(), default=0)
        winners = [k for k, v in counts.items() if v == top]
        return winners[0] if top > 0 and len(winners) == 1 else None


def narrative_distribution(document_labels: Iterable[Sentiment | str]) -> NarrativeDistribution:
    """One label per media document (not per sentence)."""
    c = Counter(Sentiment(x) for x in document_labels)
    return NarrativeDistribution(
        n=sum(c[d] for d in DIRECTIONS),
        positive=c[Sentiment.POSITIVE], neutral=c[Sentiment.NEUTRAL], negative=c[Sentiment.NEGATIVE],
    )


def _opposite(a: Sentiment | None, b: Sentiment | None) -> bool:
    return {a, b} == {Sentiment.POSITIVE, Sentiment.NEGATIVE}


def divergence_flags(factual: Sentiment | None, management: Sentiment | None,
                     media: NarrativeDistribution | None) -> list[str]:
    flags = []
    if media is not None and _opposite(factual, media.plurality):
        flags.append("FUNDAMENTAL_NARRATIVE_DIVERGENCE")
    if _opposite(factual, management):
        flags.append("FACT_MANAGEMENT_DIVERGENCE")
    if media is not None and _opposite(management, media.plurality):
        flags.append("MANAGEMENT_NARRATIVE_DIVERGENCE")
    return flags
