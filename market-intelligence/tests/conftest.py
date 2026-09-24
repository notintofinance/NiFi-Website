from __future__ import annotations

import json
from dataclasses import replace
from types import SimpleNamespace

import pytest

from mie.core.config import FIXTURE_DIR, Settings
from mie.db.session import init_db, make_engine, make_session_factory
from mie.ingestion.registry import load_connectors
from mie.ingestion.runner import run_connector
from mie.models.finbert import FinbertClassifier
from mie.processing.event_extractor import EventExtractor


@pytest.fixture
def settings() -> Settings:
    return replace(Settings(), database_url="sqlite:///:memory:", claude_enabled=False)


@pytest.fixture
def engine():
    eng = make_engine("sqlite:///:memory:")
    init_db(eng)
    return eng


@pytest.fixture
def session(engine):
    with make_session_factory(engine)() as s:
        yield s


@pytest.fixture
def loaded(session, settings):
    """Session with fixtures ingested and events extracted."""
    for c in load_connectors(settings, fixtures=True):
        run_connector(session, c, None, FIXTURE_DIR)
    EventExtractor(session, settings).process_pending()
    session.commit()
    return session


# ----------------------------------------------------------------------------- fakes
KEYWORD_LABELS = {"increased": "NEGATIVE", "higher than last year": "NEGATIVE", "softened": "NEGATIVE",
                  "well capitalized": "POSITIVE", "closer to": "POSITIVE"}


def fake_pipeline_factory(task, model, revision, top_k):
    """Deterministic stand-in for the transformers pipeline (no model download)."""
    def run(texts, truncation=True):
        out = []
        for t in texts:
            label = next((v for k, v in KEYWORD_LABELS.items() if k in t.lower()), "NEUTRAL")
            out.append([{"label": lbl.lower(), "score": 0.8 if lbl == label else 0.1}
                        for lbl in ("POSITIVE", "NEGATIVE", "NEUTRAL")])
        return out
    run.model = SimpleNamespace(config=SimpleNamespace(_commit_hash="testcommit"))
    return run


@pytest.fixture
def fake_finbert():
    return FinbertClassifier("ProsusAI/finbert", "main", pipeline_factory=fake_pipeline_factory)


def claude_json(**overrides) -> dict:
    body = {
        "factual_sentiment": "POSITIVE", "management_tone": "MIXED_NEGATIVE", "impact_horizon": "SHORT_TERM",
        "key_positive_factors": ["inflation closer to objective"], "key_negative_factors": ["employment risks"],
        "asset_implications": [{"asset": "US_RATES", "direction": "POSITIVE", "horizon": "SHORT_TERM",
                                "rationale": "lower policy rate"}],
        "reasoning_summary": "test",
    }
    body.update(overrides)
    return body


class FakeAnthropic:
    """Records requests; returns canned responses. Never touches the network."""

    def __init__(self, body: dict | str | None = None, stop_reason: str = "end_turn"):
        self.requests: list[dict] = []
        self.body = body if body is not None else claude_json()
        self.stop_reason = stop_reason
        self.messages = SimpleNamespace(create=self._create)

    def _create(self, **kwargs):
        self.requests.append(kwargs)
        text = self.body if isinstance(self.body, str) else json.dumps(self.body)
        return SimpleNamespace(
            model="claude-test", stop_reason=self.stop_reason, stop_details=None,
            content=[SimpleNamespace(type="text", text=text)],
            usage=SimpleNamespace(input_tokens=123, output_tokens=45),
        )
