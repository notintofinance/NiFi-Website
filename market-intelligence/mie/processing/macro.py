"""Structured macro facts computed in Python — never by a language model.

Raw observations and interpretation are kept separate: this module only derives
arithmetic facts; interpretation happens later in the Intelligence Engine.
"""
from __future__ import annotations

from dataclasses import dataclass


def shift_period(period: str, months: int) -> str:
    year, month = map(int, period.split("-"))
    idx = year * 12 + (month - 1) + months
    return f"{idx // 12}-{idx % 12 + 1:02d}"


def pct_change(new: float, old: float) -> float:
    return (new / old - 1.0) * 100.0


@dataclass(frozen=True)
class IndexFacts:
    series_id: str
    period: str
    level: float
    yoy_pct: float | None
    prior_period: str
    prior_yoy_pct: float | None

    @property
    def yoy_change_pp(self) -> float | None:
        if self.yoy_pct is None or self.prior_yoy_pct is None:
            return None
        return self.yoy_pct - self.prior_yoy_pct

    def as_dict(self) -> dict:
        return {
            "series_id": self.series_id, "period": self.period, "level": self.level,
            "yoy_pct": self.yoy_pct, "prior_period": self.prior_period,
            "prior_yoy_pct": self.prior_yoy_pct, "yoy_change_pp": self.yoy_change_pp,
            "method": "NSA index; YoY = level_t / level_(t-12) - 1",
            "published": self.published(),
        }

    def published(self) -> dict:
        """The same facts at the precision BLS publishes (index 3 dp, percentages 1 dp).
        This is what classifiers see; the full-precision values stay in the DB for audit."""
        r1 = lambda x: None if x is None else round(x, 1)  # noqa: E731
        return {"series_id": self.series_id, "period": self.period, "index_level": round(self.level, 3),
                "yoy_pct": r1(self.yoy_pct), "prior_period": self.prior_period,
                "prior_yoy_pct": r1(self.prior_yoy_pct),
                "yoy_change_pp": None if self.yoy_change_pp is None else r1(r1(self.yoy_pct) - r1(self.prior_yoy_pct))}


def index_facts(series_id: str, period: str, levels: dict[str, float]) -> IndexFacts:
    """levels: period -> index level for this series. Missing comparators yield None, not guesses."""
    level = levels[period]
    prior = shift_period(period, -1)

    def yoy(p: str) -> float | None:
        base = levels.get(shift_period(p, -12))
        return pct_change(levels[p], base) if (p in levels and base) else None

    return IndexFacts(series_id, period, level, yoy(period), prior, yoy(prior))


def describe_index_facts(f: IndexFacts, series_name: str) -> str:
    """Neutral factual sentence at published precision, so the stated change always
    equals the difference of the stated rates."""
    p = f.published()
    if p["yoy_pct"] is None:
        return f"{series_name}: index level {p['index_level']:.3f} in {f.period}; year-ago comparator unavailable."
    text = f"{series_name}: {p['yoy_pct']:.1f}% year over year in {f.period}"
    if p["prior_yoy_pct"] is not None:
        text += (f", versus {p['prior_yoy_pct']:.1f}% in {f.prior_period} "
                 f"(change {p['yoy_change_pp']:+.1f} percentage points)")
    return text + "."
