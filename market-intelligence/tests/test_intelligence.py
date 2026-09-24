from datetime import datetime, timedelta, timezone

import pytest

from mie.core.enums import AgreementStatus as A, Sentiment as S
from mie.intelligence.aggregation import LabelledEvent, breadth_from_counts, windowed_breadth
from mie.intelligence.comparison import compare, tone_to_sentiment
from mie.intelligence.narrative import divergence_flags, narrative_distribution


def test_breadth_example_from_spec():
    b = breadth_from_counts({"POSITIVE": 9, "NEUTRAL": 3, "NEGATIVE": 4})
    assert b.total_classified == 16
    assert b.breadth == pytest.approx(0.3125)
    assert b.breadth_scaled == 31
    assert b.shares()["positive"] == pytest.approx(0.5625)


def test_breadth_excludes_uncertain_from_denominator_but_reports_it():
    b = breadth_from_counts({"POSITIVE": 2, "NEGATIVE": 1, "MIXED": 1, "UNCERTAIN": 3, "INSUFFICIENT_CONTEXT": 1})
    assert b.total_classified == 4 and b.uncertain == 4
    assert b.breadth == pytest.approx(0.25)


def test_breadth_empty_is_none_not_zero():
    b = breadth_from_counts({})
    assert b.breadth is None and b.breadth_scaled is None


NOW = datetime(2026, 9, 24, 12, tzinfo=timezone.utc)


def test_windows_and_point_in_time():
    evs = [
        LabelledEvent(1, NOW - timedelta(hours=2), S.POSITIVE),
        LabelledEvent(2, NOW - timedelta(days=2), S.NEGATIVE),
        LabelledEvent(3, NOW - timedelta(days=6), S.NEGATIVE),
        LabelledEvent(4, NOW - timedelta(days=20), S.NEUTRAL),
        LabelledEvent(5, NOW + timedelta(hours=1), S.POSITIVE),   # future: must be ignored
        LabelledEvent(6, NOW - timedelta(hours=1), None),          # unclassified
    ]
    w = windowed_breadth(evs, NOW)
    assert w["24H"].breadth_scaled == 100 and w["24H"].total_classified == 1
    assert w["3D"].breadth == 0
    assert w["7D"].breadth == pytest.approx(-1 / 3)
    assert w["30D"].total_classified == 4


def test_duplicate_event_rows_count_once():
    evs = [LabelledEvent(1, NOW, S.POSITIVE)] * 5
    assert windowed_breadth(evs, NOW)["24H"].total_classified == 1


@pytest.mark.parametrize("claude,finbert,status,review", [
    (S.POSITIVE, S.POSITIVE, A.AGREE, False),
    (S.POSITIVE, S.NEGATIVE, A.DISAGREE, True),
    (S.POSITIVE, S.NEUTRAL, A.DISAGREE, False),
    (S.MIXED, S.MIXED, A.AGREE, False),
    (S.POSITIVE, None, A.CLAUDE_ONLY, False),
    (None, S.NEGATIVE, A.FINBERT_ONLY, False),
    (S.UNCERTAIN, S.POSITIVE, A.UNCERTAIN, False),
    (S.INSUFFICIENT_CONTEXT, S.POSITIVE, A.UNCERTAIN, False),
    (None, None, A.NOT_CLASSIFIED, False),
])
def test_compare(claude, finbert, status, review):
    c = compare(claude, finbert)
    assert c.status == status and c.review_required == review


def test_tone_mapping():
    assert tone_to_sentiment("MIXED_POSITIVE") == S.MIXED
    assert tone_to_sentiment("NOT_APPLICABLE") is None


def test_narrative_distribution_from_spec():
    d = narrative_distribution(["POSITIVE"] * 7 + ["NEUTRAL"] * 2 + ["NEGATIVE"])
    assert d.n == 10 and d.shares() == {"positive": 0.7, "neutral": 0.2, "negative": 0.1}
    assert d.plurality == S.POSITIVE


def test_dispersion_bounds():
    assert narrative_distribution(["POSITIVE"] * 4).dispersion == pytest.approx(0.0)
    assert narrative_distribution(["POSITIVE", "NEUTRAL", "NEGATIVE"]).dispersion == pytest.approx(1.0)
    assert narrative_distribution(["POSITIVE"]).dispersion is None


def test_plurality_tie_is_none():
    assert narrative_distribution(["POSITIVE", "NEGATIVE"]).plurality is None


def test_fundamental_narrative_divergence():
    media = narrative_distribution(["NEGATIVE"] * 3 + ["POSITIVE"])
    assert divergence_flags(S.POSITIVE, S.POSITIVE, media) == [
        "FUNDAMENTAL_NARRATIVE_DIVERGENCE", "MANAGEMENT_NARRATIVE_DIVERGENCE"]
    assert divergence_flags(S.POSITIVE, S.NEGATIVE, None) == ["FACT_MANAGEMENT_DIVERGENCE"]
    assert divergence_flags(S.POSITIVE, S.POSITIVE, narrative_distribution(["POSITIVE"])) == []
