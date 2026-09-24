"""Phase 2: Claude event typing, error policy, prefix stability, preview,
asset-level breadth, diagnostics."""
from dataclasses import replace
from datetime import datetime, timedelta, timezone

import anthropic
import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from mie.api import views
from mie.api.main import create_app
from mie.db.models import ClaudeEventTyping, ClaudePrediction, Event, Source
from mie.intelligence.aggregation import AssetImplicationObs, asset_breadth
from mie.intelligence.service import run_claude, run_claude_typing, run_comparisons, run_finbert
from mie.models.claude import ClaudeClassifier, EventTyper, api_error_policy
from mie.preview import claude_preview
from tests.conftest import FakeAnthropic, claude_json

FAR = datetime(2100, 1, 1, tzinfo=timezone.utc)


def _on(settings, **kw):
    return replace(settings, claude_enabled=True, **kw)


def _other_event(session):
    return session.scalars(select(Event).where(Event.event_type == "OTHER")).one()


# ----------------------------------------------------------------------------- typing
def test_typing_retypes_other_with_history(loaded, settings):
    ev = _other_event(loaded)
    fake = FakeAnthropic({"event_type": "REGULATION", "rationale": "supervisory statement"})
    r = run_claude_typing(loaded, _on(settings), EventTyper("m", client=fake))
    assert r.counts == {"retyped": 1}
    loaded.refresh(ev)
    assert ev.event_type == "REGULATION" and ev.extraction_method.endswith("+CLAUDE_TYPED")
    (h,) = ev.event_type_history
    assert h["from"] == "OTHER" and h["to"] == "REGULATION"
    row = loaded.scalars(select(ClaudeEventTyping)).one()
    assert row.applied and row.previous_event_type == "OTHER" and h["claude_event_typing_id"] == row.id
    # Only OTHER events are ever sent; structured events never are.
    assert len(fake.requests) == 1
    assert run_claude_typing(loaded, _on(settings), EventTyper("m", client=fake)).counts == {}


def test_typing_keeps_other_when_model_says_other(loaded, settings):
    fake = FakeAnthropic({"event_type": "OTHER", "rationale": "no fit"})
    r = run_claude_typing(loaded, _on(settings), EventTyper("m", client=fake))
    assert r.counts == {"kept_other": 1}
    assert _other_event(loaded).event_type_history == []
    assert not loaded.scalars(select(ClaudeEventTyping)).one().applied


def test_typing_payload_does_not_anchor_on_rule_label(loaded, settings):
    fake = FakeAnthropic({"event_type": "OTHER", "rationale": "x"})
    run_claude_typing(loaded, _on(settings), EventTyper("m", client=fake))
    msg = fake.requests[0]["messages"][0]["content"]
    assert '"event_type"' not in msg and "example.invalid" not in msg


def test_typing_can_be_disabled(loaded, settings):
    r = run_claude_typing(loaded, _on(settings, claude_type_other_events=False), EventTyper("m", client=FakeAnthropic()))
    assert not r.ran and "CLAUDE_TYPE_OTHER_EVENTS" in r.skipped_reason


# ----------------------------------------------------------------------------- API errors
def _status_error(cls, code):
    req = httpx.Request("POST", "https://api.anthropic.com/v1/messages")
    return cls("err", response=httpx.Response(code, request=req), body=None)


def test_error_policy():
    assert api_error_policy(_status_error(anthropic.RateLimitError, 429)) == ("stop", "rate_limited")
    assert api_error_policy(_status_error(anthropic.AuthenticationError, 401)) == ("stop", "auth_error")
    assert api_error_policy(_status_error(anthropic.BadRequestError, 400)) == ("continue", "bad_request")
    assert api_error_policy(_status_error(anthropic.InternalServerError, 500)) == ("continue", "api_status_500")
    assert api_error_policy(ValueError("x")) == ("continue", "api_error")


def test_rate_limit_stops_the_stage(loaded, settings):
    class Limited(FakeAnthropic):
        def _create(self, **kw):
            self.requests.append(kw)
            raise _status_error(anthropic.RateLimitError, 429)
    fake = Limited()
    r = run_claude(loaded, _on(settings), ClaudeClassifier("m", client=fake))
    assert r.counts["rate_limited"] == 1 and len(fake.requests) == 1
    assert loaded.query(ClaudePrediction).count() == 0


# ----------------------------------------------------------------------------- prompt structure
def test_system_prefix_is_identical_across_events(loaded, settings):
    fake = FakeAnthropic()
    run_claude(loaded, _on(settings), ClaudeClassifier("m", client=fake))
    systems = {r["system"][0]["text"] for r in fake.requests}
    assert len(fake.requests) == 3 and len(systems) == 1
    assert "US_RATES" in systems.pop()  # asset universe lives in the cacheable prefix
    assert all("Allowed asset keys" not in r["messages"][0]["content"] for r in fake.requests)


def test_brief_facts_use_published_precision(loaded, settings):
    fake = FakeAnthropic()
    ev = loaded.scalars(select(Event).where(Event.event_key == "US_CPI:2026-08")).one()
    run_claude(loaded, _on(settings), ClaudeClassifier("m", client=fake), event_ids=[ev.id])
    import json
    facts = json.loads(fake.requests[0]["messages"][0]["content"])["computed_facts"]
    for f in facts:
        assert f["yoy_pct"] == round(f["yoy_pct"], 1) and "method" not in f


# ----------------------------------------------------------------------------- preview
def test_preview_makes_no_call_and_matches_run(loaded, settings):
    class Explodes:
        def __getattr__(self, name):
            raise AssertionError("preview must not touch the API client")
    p = claude_preview(loaded, settings, clf=ClaudeClassifier("m", client=Explodes()), as_of=FAR)
    statuses = {e["event_id"]: e["status"] for e in p["events"]}
    assert p["would_send"] == 3 and list(statuses.values()).count("OUT_OF_SCOPE_TYPE") == 3
    for src in loaded.scalars(select(Source)).all():
        assert all(src.name not in e.get("user_message", "") for e in p["events"])
    # After a real run, the preview reports those events as UNCHANGED.
    run_claude(loaded, _on(settings), ClaudeClassifier("m", client=FakeAnthropic()), as_of=FAR)
    p2 = claude_preview(loaded, settings, clf=ClaudeClassifier("m", client=Explodes()), as_of=FAR)
    assert p2["would_send"] == 0 and sum(e["status"] == "UNCHANGED" for e in p2["events"]) == 3


# ----------------------------------------------------------------------------- asset breadth
NOW = datetime(2026, 9, 24, 12, tzinfo=timezone.utc)


def test_asset_breadth_absence_is_not_neutral():
    obs = [AssetImplicationObs(1, NOW, "US_RATES", "POSITIVE"),
           AssetImplicationObs(2, NOW, "US_RATES", "NEGATIVE"),
           AssetImplicationObs(2, NOW, "USD", "NEGATIVE"),
           AssetImplicationObs(3, NOW - timedelta(days=10), "USD", "UNCERTAIN")]
    out = asset_breadth(obs, NOW)
    assert set(out) == {"US_RATES", "USD"}
    assert out["US_RATES"]["24H"].breadth == 0 and out["US_RATES"]["24H"].total_classified == 2
    usd = out["USD"]["30D"]
    assert usd.total_classified == 1 and usd.uncertain == 1 and usd.breadth == -1  # event 1 not counted for USD


def test_asset_table_uses_latest_prediction_only(loaded, settings):
    run_claude(loaded, _on(settings), ClaudeClassifier("m1", client=FakeAnthropic()))
    newer = claude_json(asset_implications=[{"asset": "USD", "direction": "NEGATIVE",
                                             "horizon": "SHORT_TERM", "rationale": "x"}])
    run_claude(loaded, _on(settings), ClaudeClassifier("m2", client=FakeAnthropic(newer)))
    table = views.asset_table(loaded)
    assets = {a["asset"] for a in table["assets"]}
    assert assets == {"USD"}  # the superseded US_RATES implications are not counted


# ----------------------------------------------------------------------------- diagnostics + UI
def test_diagnostics_and_pages(engine, settings, fake_finbert):
    from mie.db.session import make_session_factory
    from mie.pipeline import run_pipeline
    factory = make_session_factory(engine)
    run_pipeline(factory, _on(settings), fixtures=True, finbert=fake_finbert,
                 claude=ClaudeClassifier("m", client=FakeAnthropic(claude_json(factual_sentiment="NEGATIVE"))),
                 typer=EventTyper("m", client=FakeAnthropic({"event_type": "REGULATION", "rationale": "r"})))
    with factory() as s:
        d = views.model_diagnostics(s)
        interp = d["claude_interpretation"][0]
        assert interp["status"]["OK"] >= 3 and interp["input_tokens"] > 0
        assert d["claude_typing"][0]["status"] == {"OK": 1} and len(d["retyped_events"]) == 1
        allrow = d["agreement"]["FACTUAL"][0]
        assert allrow["event_type"] == "ALL" and allrow["agreement_rate"] is not None
        assert d["review_queue"]  # FOMC: Claude NEGATIVE vs FinBERT POSITIVE
    client = TestClient(create_app(engine))
    for path in ("/models", "/api/models", "/api/assets", "/"):
        assert client.get(path).status_code == 200, path
    assert "Asset implications" in client.get("/").text
    assert "Agreement by event type" in client.get("/models").text


def test_management_label_ignored_when_event_has_no_management_text(loaded, settings):
    from mie.db.models import ModelComparison
    run_claude(loaded, _on(settings), ClaudeClassifier("m", client=FakeAnthropic()))  # tone MIXED_NEGATIVE
    run_comparisons(loaded)
    cpi = loaded.scalars(select(Event).where(Event.event_key == "US_CPI:2026-08")).one()
    mgmt = loaded.scalars(select(ModelComparison).where(ModelComparison.event_id == cpi.id,
                                                        ModelComparison.layer == "MANAGEMENT")).one()
    assert mgmt.claude_label is None and mgmt.status == "NOT_CLASSIFIED"
