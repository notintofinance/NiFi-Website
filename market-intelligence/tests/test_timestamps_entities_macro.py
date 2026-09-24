from datetime import datetime, timezone

import pytest

from mie.core.schemas import NormalizedDocument
from mie.db.models import Document
from mie.processing.entities import EntityMatcher
from mie.processing.macro import index_facts, shift_period


def test_naive_datetime_rejected():
    with pytest.raises(ValueError):
        NormalizedDocument(external_id="x", source_key="s", document_type="PRESS_RELEASE", headline="h",
                           retrieved_at=datetime(2026, 1, 1))


def test_non_utc_normalised():
    from datetime import timedelta
    wib = timezone(timedelta(hours=7))
    d = NormalizedDocument(external_id="x", source_key="s", document_type="PRESS_RELEASE", headline="h",
                           published_at=datetime(2026, 1, 1, 7, tzinfo=wib), retrieved_at=datetime.now(timezone.utc))
    assert d.published_at == datetime(2026, 1, 1, 0, tzinfo=timezone.utc)


def test_db_roundtrip_is_timezone_aware(loaded):
    doc = loaded.query(Document).first()
    assert doc.retrieved_at.tzinfo is not None


def test_entity_matching():
    m = EntityMatcher.from_yaml()
    keys = lambda t: {x.key for x in m.match(t)}
    assert keys("The FOMC held rates") == {"FED"}
    assert keys("Investors are fed up with volatility") == set()  # case-sensitive short alias
    assert keys("BBCA reported net profit; Bank Central Asia") == {"BBCA"}
    assert keys("Bank Indonesia kept the BI-Rate unchanged") == {"BI"}
    assert keys("consumer price index rose") == {"US_CPI"}


def test_shift_period_across_years():
    assert shift_period("2026-01", -1) == "2025-12"
    assert shift_period("2026-08", -12) == "2025-08"


def test_index_facts():
    levels = {"2025-07": 100.0, "2025-08": 100.0, "2026-07": 103.0, "2026-08": 102.5}
    f = index_facts("S", "2026-08", levels)
    assert f.yoy_pct == pytest.approx(2.5)
    assert f.prior_yoy_pct == pytest.approx(3.0)
    assert f.yoy_change_pp == pytest.approx(-0.5)


def test_index_facts_missing_comparator_is_none():
    f = index_facts("S", "2026-08", {"2026-08": 102.5})
    assert f.yoy_pct is None and f.yoy_change_pp is None
