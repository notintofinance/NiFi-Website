from dataclasses import replace

from fastapi.testclient import TestClient

from mie.api.main import create_app
from mie.db.models import ModelComparison
from mie.db.session import make_session_factory
from mie.intelligence.service import run_comparisons
from mie.models.claude import ClaudeClassifier
from mie.pipeline import run_pipeline
from tests.conftest import FakeAnthropic, claude_json


def test_end_to_end_with_blind_models(engine, settings, fake_finbert):
    factory = make_session_factory(engine)
    s = replace(settings, claude_enabled=True)
    reports = run_pipeline(factory, s, fixtures=True, finbert=fake_finbert,
                           claude=ClaudeClassifier("claude-opus-5", client=FakeAnthropic()))
    by = {r.stage: r for r in reports}
    assert by["finbert"].ran and by["claude"].ran and by["comparison"].ran
    with factory() as session:
        statuses = {(c.layer, c.status) for c in session.query(ModelComparison).all()}
        # FOMC: Claude POSITIVE vs FinBERT POSITIVE (factual); CPI: structured -> Claude only.
        assert ("FACTUAL", "AGREE") in statuses and ("FACTUAL", "CLAUDE_ONLY") in statuses
        # Management: Claude MIXED_NEGATIVE->MIXED vs FinBERT NEGATIVE -> DISAGREE (not opposite).
        assert ("MANAGEMENT", "DISAGREE") in statuses
        n = session.query(ModelComparison).count()
        run_comparisons(session)
        assert session.query(ModelComparison).count() == n  # unchanged inputs add no rows

    client = TestClient(create_app(engine))
    events = client.get("/api/events").json()
    assert len(events) == 6 and all(e["is_fixture"] for e in events)
    breadth = client.get("/api/breadth", params={"as_of": "2026-09-24T23:59:00+00:00"}).json()
    assert set(breadth["by_label_source"]) == {"claude", "finbert", "agreed"}
    assert breadth["by_label_source"]["claude"]["30D"]["total_classified"] >= 1
    fomc = next(e for e in events if e["title"].endswith("FOMC statement"))
    detail = client.get(f"/api/events/{fomc['id']}").json()
    assert detail["document_count"] == 2 and detail["impacts"][0]["asset"] == "US_RATES"
    assert client.get("/api/events/9999").status_code == 404
    for path in ("/", "/events", f"/events/{fomc['id']}", "/sources", "/events?event_type=INFLATION"):
        r = client.get(path)
        assert r.status_code == 200, path
        assert "SYNTHETIC DATA PRESENT" in r.text
    assert "US CPI release" in client.get("/events?event_type=INFLATION").text


def test_opposite_polarity_flags_review(engine, settings, fake_finbert):
    factory = make_session_factory(engine)
    s = replace(settings, claude_enabled=True)
    run_pipeline(factory, s, fixtures=True, finbert=fake_finbert,
                 claude=ClaudeClassifier("m", client=FakeAnthropic(claude_json(factual_sentiment="NEGATIVE"))))
    with factory() as session:
        flagged = session.query(ModelComparison).filter(ModelComparison.review_required.is_(True)).all()
        assert flagged and all(c.status == "DISAGREE" for c in flagged)
