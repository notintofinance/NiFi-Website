from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from mie.core.enums import FinbertLabel, Sentiment
from mie.db.models import ClaudePrediction, Event, EventImpact, EventStatement, FinbertPrediction, Source
from mie.intelligence.service import finbert_layer_labels, run_claude, run_finbert
from mie.models.briefing import build_event_brief, mask_source_names
from mie.models.claude import ClaudeClassifier
from mie.models.finbert import FinbertClassifier, derive_event_label
from tests.conftest import FakeAnthropic, claude_json

NOW = datetime(2100, 1, 1, tzinfo=timezone.utc)  # after any fixture retrieval


# ----------------------------------------------------------------------------- FinBERT
def test_derive_event_label():
    P, N, U = FinbertLabel.POSITIVE, FinbertLabel.NEGATIVE, FinbertLabel.NEUTRAL
    assert derive_event_label([P, U]) == Sentiment.POSITIVE
    assert derive_event_label([N, U, U]) == Sentiment.NEGATIVE
    assert derive_event_label([P, N]) == Sentiment.MIXED
    assert derive_event_label([U]) == Sentiment.NEUTRAL
    assert derive_event_label([]) is None


def test_finbert_labels_and_versioning(loaded, fake_finbert):
    report = run_finbert(loaded, fake_finbert)
    assert report.ran and report.counts["predicted"] > 0
    preds = loaded.scalars(select(FinbertPrediction)).all()
    assert all(set(p.probabilities) == {"POSITIVE", "NEGATIVE", "NEUTRAL"} for p in preds)
    assert fake_finbert.version == "ProsusAI/finbert@testcommit"
    # Computed macro facts are never sent to FinBERT.
    computed_ids = {s.id for s in loaded.scalars(select(EventStatement).where(EventStatement.value.is_not(None)))}
    assert computed_ids and not computed_ids & {p.statement_id for p in preds}
    # Re-running is idempotent (append-only, no duplicates).
    assert run_finbert(loaded, fake_finbert).counts["predicted"] == 0


def test_finbert_skips_non_english(loaded, fake_finbert):
    st = loaded.scalars(select(EventStatement).where(EventStatement.value.is_(None))).first()
    st.language = "id"
    report = run_finbert(loaded, fake_finbert)
    assert report.counts["not_applicable_language"] == 1
    assert not loaded.scalar(select(FinbertPrediction).where(FinbertPrediction.statement_id == st.id))


def test_finbert_unavailable_is_a_skip_not_a_crash(loaded):
    def broken(*a, **k):
        raise OSError("no network to huggingface.co")
    report = run_finbert(loaded, FinbertClassifier(pipeline_factory=broken))
    assert not report.ran and "could not load" in report.skipped_reason


def test_fomc_finbert_mixed(loaded, fake_finbert):
    run_finbert(loaded, fake_finbert)
    fomc = next(e for e in loaded.query(Event).all() if e.title.endswith("FOMC statement"))
    labels = finbert_layer_labels(loaded, fomc.id)
    assert labels["FACTUAL"] == Sentiment.POSITIVE      # "closer to" positive, rest neutral
    assert labels["MANAGEMENT"] == Sentiment.NEGATIVE   # "risks ... have increased"


# ----------------------------------------------------------------------------- briefing
def test_brief_is_source_blind(loaded, settings):
    ev = next(e for e in loaded.query(Event).all() if e.title.endswith("FOMC statement"))
    brief = build_event_brief(loaded, ev, NOW, 8, external_llm=True)
    msg = ClaudeClassifier("m", client=FakeAnthropic()).build_user_message(brief)
    for src in loaded.scalars(select(Source)).all():
        assert src.name not in msg and src.key not in msg
    assert "http" not in msg and "example.invalid" not in msg
    assert set(brief.model_payload()) == {"event_type", "event_date", "country", "entities", "computed_facts",
                                          "factual_statements", "management_statements", "media_statements"}


def test_mask_source_names():
    assert mask_source_names("Reuters reported that REUTERS said", ["Reuters"]) == "[SOURCE] reported that [SOURCE] said"


def test_brief_is_point_in_time(loaded):
    ev = next(e for e in loaded.query(Event).all() if e.title.endswith("FOMC statement"))
    retrieved = min(ed.document.retrieved_at for ed in ev.documents)
    brief = build_event_brief(loaded, ev, retrieved - timedelta(seconds=1), 8, external_llm=True)
    assert brief.is_empty() and brief.excluded_after_as_of == len(ev.statements)


def test_brief_respects_external_llm_permission(loaded):
    for src in loaded.scalars(select(Source)).all():
        src.allow_external_llm = False
    ev = loaded.query(Event).filter(Event.event_key == "US_CPI:2026-08").one()
    brief = build_event_brief(loaded, ev, NOW, 8, external_llm=True)
    assert brief.is_empty() and brief.excluded_not_permitted == 2


def test_brief_caps_and_counts_omitted(loaded):
    ev = next(e for e in loaded.query(Event).all() if e.title.endswith("FOMC statement"))
    brief = build_event_brief(loaded, ev, NOW, 1, external_llm=True)
    assert len(brief.layers["FACTUAL"]) == 1 and brief.omitted_statements["FACTUAL"] == 2


# ----------------------------------------------------------------------------- Claude
def _enabled(settings):
    from dataclasses import replace
    return replace(settings, claude_enabled=True)


def test_claude_disabled_by_default(loaded, settings):
    r = run_claude(loaded, settings)
    assert not r.ran and r.skipped_reason == "CLAUDE_ENABLED is false"


def test_claude_ok_stores_versioned_prediction_and_impacts(loaded, settings):
    fake = FakeAnthropic()
    r = run_claude(loaded, _enabled(settings), ClaudeClassifier("claude-opus-5", client=fake))
    assert r.counts["ok"] == 3  # 2 MONETARY_POLICY + 1 INFLATION; REGULATION/OTHER not in scope
    pred = loaded.scalars(select(ClaudePrediction)).first()
    assert pred.prompt_version and pred.served_model == "claude-test" and pred.input_tokens == 123
    assert loaded.query(EventImpact).count() == 3
    req = fake.requests[0]
    assert req["output_config"]["format"]["type"] == "json_schema"
    assert "temperature" not in req  # sampling params are rejected on current models
    # Unchanged input is not re-sent.
    again = run_claude(loaded, _enabled(settings), ClaudeClassifier("claude-opus-5", client=fake))
    assert again.counts == {"unchanged": 3, "out_of_scope_type": 3} and len(fake.requests) == 3


def test_claude_never_sees_finbert(loaded, settings, fake_finbert):
    run_finbert(loaded, fake_finbert)
    fake = FakeAnthropic()
    run_claude(loaded, _enabled(settings), ClaudeClassifier("m", client=fake))
    for req in fake.requests:
        msg = req["messages"][0]["content"]
        assert "finbert" not in msg.lower() and "probabilit" not in msg.lower()


def test_claude_refusal_and_invalid_are_recorded(loaded, settings):
    run_claude(loaded, _enabled(settings), ClaudeClassifier("m1", client=FakeAnthropic(stop_reason="refusal")))
    run_claude(loaded, _enabled(settings), ClaudeClassifier("m2", client=FakeAnthropic(body="not json")))
    bad_asset = claude_json(asset_implications=[{"asset": "BITCOIN", "direction": "POSITIVE",
                                                 "horizon": "SHORT_TERM", "rationale": "x"}])
    run_claude(loaded, _enabled(settings), ClaudeClassifier("m3", client=FakeAnthropic(body=bad_asset)))
    statuses = {(p.status) for p in loaded.scalars(select(ClaudePrediction)).all()}
    assert statuses == {"REFUSED", "INVALID"}
    assert loaded.query(EventImpact).count() == 0


def test_claude_rejects_numeric_scores(loaded, settings):
    body = claude_json(factual_sentiment="0.74")
    run_claude(loaded, _enabled(settings), ClaudeClassifier("m", client=FakeAnthropic(body=body)))
    assert {p.status for p in loaded.scalars(select(ClaudePrediction)).all()} == {"INVALID"}


def test_claude_api_error_is_not_stored(loaded, settings):
    class Boom(FakeAnthropic):
        def _create(self, **kw):
            raise ConnectionError("network down")
    r = run_claude(loaded, _enabled(settings), ClaudeClassifier("m", client=Boom()))
    assert r.counts["api_error"] == 3 and loaded.query(ClaudePrediction).count() == 0
