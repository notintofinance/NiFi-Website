"""Phase 5: SEC EDGAR, generic RSS, YouTube whitelist, registry options, dashboard fixes."""
from dataclasses import replace
from datetime import datetime, timezone

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from mie.core.config import FIXTURE_DIR
from mie.db.models import Event
from mie.ingestion.base import HttpFetcher
from mie.ingestion.registry import load_connectors
from mie.ingestion.runner import run_connector
from mie.ingestion.sec_edgar import _parse_acceptance
from mie.processing.entities import EntityMatcher
from mie.processing.event_extractor import EventExtractor
from mie.processing.rules import EventRules
from zoneinfo import ZoneInfo

NOW = datetime(2026, 9, 24, tzinfo=timezone.utc)


def _conn(settings, key, **options):
    c = {x.spec.key: x for x in load_connectors(settings, fixtures=True, include_disabled=True)}[key + "__fixture"]
    c.options = {**c.options, **options}
    return c


def _docs(c):
    return [d for p in c.load_fixtures(FIXTURE_DIR) for d in c.parse(p.model_copy(update={"fetched_at": NOW}))]


# ----------------------------------------------------------------------------- SEC
def test_sec_parse_filters_forms_and_lookback(settings):
    docs = _docs(_conn(settings, "sec_edgar"))
    assert [d.raw_metadata["form"] for d in docs] == ["8-K", "8-K", "10-Q"]  # Form 4, old 8-K and 2025 10-K dropped
    first = docs[0]
    assert first.headline.startswith("EXAMPLE HOLDINGS INC (EXMP) files Form 8-K: Item 2.02 Results of Operations")
    assert first.raw_metadata["categories"] == ["Form 8-K", "8-K Item 2.02", "8-K Item 9.01"]
    assert first.url == "https://www.sec.gov/Archives/edgar/data/9999999/000999999926000105/exmp-8k-a.htm"
    assert first.body == ""  # metadata only, no filing text


def test_sec_acceptance_time_is_eastern_with_dst():
    ny = ZoneInfo("America/New_York")
    assert _parse_acceptance("2026-09-18T16:31:05.000Z", ny) == datetime(2026, 9, 18, 20, 31, 5, tzinfo=timezone.utc)
    assert _parse_acceptance("2026-01-15T16:31:05.000Z", ny) == datetime(2026, 1, 15, 21, 31, 5, tzinfo=timezone.utc)
    assert _parse_acceptance(None, ny) is None and _parse_acceptance("garbage", ny) is None


def test_sec_item_codes_type_events(session, settings):
    c = _conn(settings, "sec_edgar")
    orig = c.load_fixtures
    c.load_fixtures = lambda d: [p.model_copy(update={"fetched_at": NOW}) for p in orig(d)]
    run_connector(session, c, None, FIXTURE_DIR)
    EventExtractor(session, settings).process_pending()
    types = sorted(e.event_type for e in session.scalars(select(Event)).all())
    assert types == ["EARNINGS", "EARNINGS", "MANAGEMENT_CHANGE"]
    reasons = {e.extraction_method for e in session.scalars(select(Event)).all()}
    assert any("source_category:8-K Item 2.02" in r for r in reasons)


def test_sec_requires_contact_user_agent(settings):
    c = _conn(settings, "sec_edgar")
    http = HttpFetcher(httpx.Client(headers={"User-Agent": "no-contact"},
                                    transport=httpx.MockTransport(lambda r: httpx.Response(200))), max_attempts=1)
    with pytest.raises(ValueError, match="contact e-mail"):
        c.fetch(http)
    placeholder = HttpFetcher(httpx.Client(headers={"User-Agent": "X (contact: you@example.com)"},
                                           transport=httpx.MockTransport(lambda r: httpx.Response(200))), max_attempts=1)
    with pytest.raises(ValueError, match="contact e-mail"):
        c.fetch(placeholder)


def test_sec_watchlist_names_match_entities():
    m = EntityMatcher.from_yaml()
    for name, key in [("Apple Inc.", "AAPL"), ("MICROSOFT CORP", "MSFT"), ("NVIDIA CORP", "NVDA"),
                      ("JPMORGAN CHASE & CO", "JPM"), ("EXXON MOBIL CORP", "XOM")]:
        assert key in {x.key for x in m.match(f"{name} files Form 8-K")}, name


def test_rule_order_is_filing_item_order():
    rules = EventRules.from_yaml()
    assert rules.classify("sec_edgar", ["Form 8-K", "8-K Item 7.01", "8-K Item 5.02"], "x")[0].value == "MANAGEMENT_CHANGE"
    assert rules.classify("sec_edgar", ["Form 8-K", "8-K Item 8.01"], "x")[0].value == "OTHER"
    assert rules.classify("fed_press_releases", ["Orders on Banking Applications"], "x")[0].value == "REGULATION"


# ----------------------------------------------------------------------------- YouTube + RSS
def test_youtube_whitelist_enforced_on_parse(settings):
    c = _conn(settings, "youtube_official", channels=[{"channel_id": "UCsyntheticChannel0000001"}])
    docs = _docs(c)
    assert [d.external_id for d in docs] == ["youtube:SYNTHVID001"]
    d = docs[0]
    assert d.document_type.value == "VIDEO_METADATA" and d.raw_metadata["transcript"] == "not_ingested"
    assert d.body.startswith("The Governor explains") and d.author == "Example Central Bank"


def test_youtube_is_not_sent_to_external_llm_by_default(settings):
    c = {x.spec.key: x for x in load_connectors(settings, include_disabled=True)}["youtube_official"]
    assert c.spec.allow_external_llm is False and c.options["channels"] == []


def test_generic_rss_requires_url(settings):
    c = {x.spec.key: x for x in load_connectors(settings, include_disabled=True)}["ecb_press"]
    assert c.url.startswith("https://www.ecb.europa.eu/")
    c.options = {}
    with pytest.raises(ValueError, match="options.url"):
        _ = c.url


def test_registry_respects_enabled_and_only(settings):
    enabled = {c.spec.key for c in load_connectors(settings)}
    assert enabled == {"fed_press_releases", "bls_cpi"}  # unverified sources stay off
    assert {c.spec.key for c in load_connectors(settings, include_disabled=True, only={"ecb_press"})} == {"ecb_press"}
    # demo (fixture) mode never includes connectors without synthetic payloads (ECB)
    assert "ecb_press__fixture" not in {c.spec.key for c in load_connectors(settings, fixtures=True, include_disabled=True)}


# ----------------------------------------------------------------------------- dashboard fixes
def test_strip_shows_both_models_and_drivers_fall_back_to_finbert(engine, settings, fake_finbert):
    from mie.db.session import make_session_factory
    from mie.pipeline import run_pipeline
    run_pipeline(make_session_factory(engine), settings, fixtures=True, finbert=fake_finbert)  # Claude off
    client = TestClient(create_app_(engine))
    home = client.get("/").text
    assert "Claude has not run yet" in home
    assert home.count("Claude: factual layer") >= 1 and home.count("FinBERT: factual layer") >= 1
    assert "Labels from <strong>FinBERT: factual layer" in home
    assert "Labels from <strong>Claude: factual layer" in client.get("/?drivers_source=claude_factual").text


def create_app_(engine):
    from mie.api.main import create_app
    return create_app(engine)


def test_event_detail_shows_source_categories(engine, settings, fake_finbert):
    from mie.db.session import make_session_factory
    from mie.pipeline import run_pipeline
    run_pipeline(make_session_factory(engine), settings, fixtures=True, finbert=fake_finbert)
    client = TestClient(create_app_(engine))
    fomc = next(e for e in client.get("/api/events").json() if e["title"].endswith("FOMC statement"))
    assert "Source categories: Monetary Policy" in client.get(f"/events/{fomc['id']}").text
