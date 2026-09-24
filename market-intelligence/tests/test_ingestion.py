from datetime import datetime, timezone

import httpx
import pytest

from mie.core.config import FIXTURE_DIR
from mie.core.schemas import RawPayload
from mie.db.models import Document, IngestionRun
from mie.ingestion.base import FetchError, HttpFetcher, ParseError
from mie.ingestion.registry import load_connectors
from mie.ingestion.runner import run_connector


def _connectors(settings):
    return {c.spec.key.removesuffix("__fixture"): c for c in load_connectors(settings, fixtures=True)}


def test_fed_rss_parse(settings):
    c = _connectors(settings)["fed_press_releases"]
    docs = [d for p in c.load_fixtures(FIXTURE_DIR) for d in c.parse(p)]
    assert len(docs) == 6
    first = docs[0]
    assert first.published_at == datetime(2026, 9, 16, 18, 0, tzinfo=timezone.utc)
    assert first.raw_metadata["categories"] == ["Monetary Policy"]
    assert "<p>" not in first.body and first.body.startswith("The Federal Open Market Committee")
    missing = [d for d in docs if d.published_at is None]
    assert len(missing) == 1 and missing[0].timestamp_quality.value == "MISSING_PUBLISHED_AT"
    assert missing[0].knowledge_time == missing[0].retrieved_at


def test_bls_parse_skips_annual_and_unavailable(settings):
    c = _connectors(settings)["bls_cpi"]
    docs = [d for p in c.load_fixtures(FIXTURE_DIR) for d in c.parse(p)]
    assert len(docs) == 40  # 20 months x 2 series; M13 and "-" skipped
    periods = {d.raw_metadata["observation"]["period"] for d in docs}
    assert "2025-13" not in periods and "2024-12" not in periods
    latest = [d for d in docs if d.raw_metadata["observation"]["is_latest"]]
    assert {d.external_id for d in latest} == {"CUUR0000SA0:2026-08", "CUUR0000SA0L1E:2026-08"}
    assert all(d.published_at is None for d in docs)  # API carries no release time


def test_bls_error_status_raises_parse_error(settings):
    c = _connectors(settings)["bls_cpi"]
    bad = RawPayload(source_key="x", content=b'{"status":"REQUEST_NOT_PROCESSED","message":["limit"]}',
                     fetched_at=datetime.now(timezone.utc))
    with pytest.raises(ParseError):
        c.parse(bad)


def _fetcher(handler, attempts=3):
    return HttpFetcher(httpx.Client(transport=httpx.MockTransport(handler)), max_attempts=attempts,
                       base_delay_s=0, sleep=lambda s: None)


def test_retry_then_success():
    calls = {"n": 0}

    def handler(request):
        calls["n"] += 1
        return httpx.Response(503) if calls["n"] < 3 else httpx.Response(200, text="ok")

    f = _fetcher(handler)
    assert f.request("GET", "https://x.invalid/").text == "ok"
    assert f.last_attempts == 3


def test_non_retryable_status_fails_fast():
    calls = {"n": 0}

    def handler(request):
        calls["n"] += 1
        return httpx.Response(404)

    with pytest.raises(FetchError):
        _fetcher(handler).request("GET", "https://x.invalid/")
    assert calls["n"] == 1


def test_failing_source_does_not_stop_others(session, settings):
    conns = _connectors(settings)
    f = _fetcher(lambda r: (_ for _ in ()).throw(httpx.ConnectError("down")))
    failed = run_connector(session, conns["fed_press_releases"], f)          # live fetch, network down
    ok = run_connector(session, conns["bls_cpi"], None, FIXTURE_DIR)
    assert failed.status == "FAILED" and failed.error_type == "ConnectError" and failed.attempts == 3
    assert ok.status == "SUCCESS" and ok.inserted == 40
    assert session.query(IngestionRun).count() == 2


def test_reingest_counts_duplicates_and_tracks_revisions(session, settings):
    c = _connectors(settings)["fed_press_releases"]
    run_connector(session, c, None, FIXTURE_DIR)
    again = run_connector(session, c, None, FIXTURE_DIR)
    assert again.inserted == 0 and again.duplicates == 6

    original_parse = c.parse

    def revised(payload):
        docs = original_parse(payload)
        docs[0] = docs[0].model_copy(update={"headline": docs[0].headline + " (corrected)"})
        return docs

    c.parse = revised
    run_connector(session, c, None, FIXTURE_DIR)
    doc = session.query(Document).filter(Document.headline.like("%(corrected)")).one()
    assert doc.content_revisions == 1
    assert doc.raw_metadata["previous_versions"][0]["headline"].endswith("FOMC statement")
