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


def test_published_precision_is_internally_consistent():
    from mie.processing.macro import describe_index_facts
    # 2.46% vs 2.74%: unrounded change -0.28 would print -0.3, contradicting 2.5 vs 2.7.
    levels = {"2025-07": 100.0, "2025-08": 100.0, "2026-07": 102.74, "2026-08": 102.46}
    f = index_facts("S", "2026-08", levels)
    p = f.published()
    assert (p["yoy_pct"], p["prior_yoy_pct"], p["yoy_change_pp"]) == (2.5, 2.7, -0.2)
    assert "2.5% year over year" in describe_index_facts(f, "X") and "-0.2 percentage points" in describe_index_facts(f, "X")


def test_env_file_loader(tmp_path, monkeypatch):
    import os
    from mie.core.config import load_env_file
    f = tmp_path / ".env"
    f.write_text('# comment\nexport CLAUDE_ENABLED=true\nANTHROPIC_API_KEY=\nMIE_T_QUOTED="a b # not a comment"\n'
                 'MIE_T_INLINE=value # comment\nMIE_T_SHELL=from-file\n')
    for k in ("CLAUDE_ENABLED", "ANTHROPIC_API_KEY", "MIE_T_QUOTED", "MIE_T_INLINE"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("MIE_T_SHELL", "from-shell")
    loaded = load_env_file(f)
    assert os.environ["CLAUDE_ENABLED"] == "true"
    assert "ANTHROPIC_API_KEY" not in os.environ          # empty template value never set
    assert os.environ["MIE_T_QUOTED"] == "a b # not a comment"
    assert os.environ["MIE_T_INLINE"] == "value"
    assert os.environ["MIE_T_SHELL"] == "from-shell"       # shell wins
    assert set(loaded) == {"CLAUDE_ENABLED", "MIE_T_QUOTED", "MIE_T_INLINE"}
    for k in loaded:
        monkeypatch.delenv(k)
