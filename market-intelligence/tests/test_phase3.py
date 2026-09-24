"""Phase 3: point-in-time labels, history, drivers, momentum, snapshots."""
from dataclasses import replace
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import select

from mie.api import views
from mie.api.main import create_app
from mie.core.enums import Sentiment as S
from mie.db.models import Event, SentimentSnapshot
from mie.intelligence.aggregation import breadth_from_counts
from mie.intelligence.history import breadth_at, drivers, momentum, reversal, series, take_snapshot
from mie.intelligence.labels import GLOBAL, LABEL_SOURCES, ClaudeObs, EventRecord, FinbertObs, LabelBook
from mie.intelligence.service import finbert_layer_labels, run_claude, run_finbert
from mie.models.claude import ClaudeClassifier
from tests.conftest import FakeAnthropic

T = datetime(2026, 9, 24, 12, tzinfo=timezone.utc)
H = timedelta(hours=1)
D = timedelta(days=1)


def rec(i, event_time, known_at=None, country="US", claude=(), finbert=(), layers=("FACTUAL",)):
    return EventRecord(i, f"event {i}", "MONETARY_POLICY", country, event_time, known_at or event_time,
                       frozenset(layers), list(claude), list(finbert))


def cl(at, factual, mgmt=None, pid=1):
    return ClaudeObs(at, pid, factual, mgmt)


def fb(at, label, layer="FACTUAL", doc=1, mv=1):
    return FinbertObs(at, mv, layer, label, doc)


# ----------------------------------------------------------------------------- point in time
def test_prediction_made_later_is_invisible_at_t():
    e = rec(1, T - 2 * H, claude=[cl(T - H, S.POSITIVE), cl(T + H, S.NEGATIVE, pid=2)])
    book = LabelBook([e])
    assert book.label(e, "claude_factual", T) == S.POSITIVE
    assert book.label(e, "claude_factual", None) == S.NEGATIVE          # restated = latest now
    assert book.label(e, "claude_factual", T - 90 * timedelta(minutes=1)) is None


def test_event_retrieved_after_t_is_excluded_point_in_time_only():
    e = rec(1, T - 2 * H, known_at=T + H, claude=[cl(T - H, S.POSITIVE)])
    book = LabelBook([e])
    pit, _ = breadth_at(book, "claude_factual", T, D, GLOBAL, "POINT_IN_TIME")
    restated, _ = breadth_at(book, "claude_factual", T, D, GLOBAL, "RESTATED")
    assert pit.total_classified == 0 and restated.total_classified == 1


def test_finbert_uses_latest_model_version_visible_at_t():
    e = rec(1, T - H, finbert=[fb(T - H, "POSITIVE", mv=1), fb(T + H, "NEGATIVE", mv=2)])
    book = LabelBook([e])
    assert book.label(e, "finbert_factual", T) == S.POSITIVE
    assert book.label(e, "finbert_factual", None) == S.NEGATIVE


def test_agreed_management_and_media_sources():
    e = rec(1, T - H, layers=("FACTUAL", "MEDIA"),
            claude=[cl(T - H, S.POSITIVE, S.NEGATIVE)],
            finbert=[fb(T - H, "POSITIVE"),
                     fb(T - H, "NEGATIVE", "MEDIA", doc=2), fb(T - H, "NEGATIVE", "MEDIA", doc=3),
                     fb(T - H, "POSITIVE", "MEDIA", doc=4)])
    book = LabelBook([e])
    assert book.label(e, "agreed_factual") == S.POSITIVE
    assert book.label(e, "claude_management") is None      # no MANAGEMENT statements on this event
    assert book.label(e, "media_narrative") == S.NEGATIVE  # plurality: 2 of 3 articles
    e2 = rec(2, T - H, claude=[cl(T - H, S.UNCERTAIN)], finbert=[fb(T - H, "NEUTRAL")])
    assert LabelBook([e2]).label(e2, "agreed_factual") is None


def test_every_label_source_is_registered():
    book = LabelBook([rec(1, T)])
    for src in LABEL_SOURCES:
        book.label(book.events[0], src, T)


# ----------------------------------------------------------------------------- aggregation
def test_scope_filter_and_drivers_order():
    evs = [rec(1, T - 3 * H, country="US", claude=[cl(T - 4 * H, S.POSITIVE)]),
           rec(2, T - 2 * H, country="ID", claude=[cl(T - 4 * H, S.NEGATIVE)]),
           rec(3, T - H, country="US", claude=[cl(T - 4 * H, S.POSITIVE)])]
    book = LabelBook(evs)
    us, contrib = breadth_at(book, "claude_factual", T, D, "US")
    assert us.total_classified == 2 and us.breadth == 1
    assert [c.event_id for c in drivers(contrib)["POSITIVE"]] == [3, 1]  # newest first
    assert breadth_at(book, "claude_factual", T, D, GLOBAL)[0].total_classified == 3
    assert book.scopes() == [GLOBAL, "ID", "US"]


def test_reversal_definition():
    pos, neg, zero = (breadth_from_counts(c) for c in ({"POSITIVE": 1}, {"NEGATIVE": 2}, {"NEUTRAL": 1}))
    empty = breadth_from_counts({})
    assert reversal(pos, neg) and reversal(neg, pos)
    assert not reversal(pos, zero) and not reversal(pos, empty) and not reversal(pos, pos)


def test_momentum_flags_reversal():
    evs = [rec(1, T - 2 * H, claude=[cl(T - 2 * H, S.NEGATIVE)]),
           rec(2, T - 3 * D, claude=[cl(T - 3 * D, S.POSITIVE)]),
           rec(3, T - 4 * D, claude=[cl(T - 4 * D, S.POSITIVE)])]
    m = momentum(LabelBook(evs), "claude_factual", T, GLOBAL)
    assert m["windows"]["24H"]["breadth_scaled"] == -100 and m["windows"]["7D"]["breadth_scaled"] == 33
    assert [(r["short"], r["long"]) for r in m["reversals"]] == [("24H", "7D")]


def test_series_is_daily_oldest_first():
    book = LabelBook([rec(1, T - H, claude=[cl(T - H, S.POSITIVE)])])
    pts = series(book, "claude_factual", D, T, 5, GLOBAL, "POINT_IN_TIME")
    assert [p[0] for p in pts] == [T - 4 * D, T - 3 * D, T - 2 * D, T - D, T]
    assert pts[-1][1].breadth == 1 and pts[0][1].breadth is None


# ----------------------------------------------------------------------------- consistency with the DB
def test_labelbook_matches_service_views(loaded, settings, fake_finbert):
    run_finbert(loaded, fake_finbert)
    run_claude(loaded, replace(settings, claude_enabled=True), ClaudeClassifier("m", client=FakeAnthropic()))
    book = LabelBook.from_session(loaded)
    for e in book.events:
        row = views.event_row(loaded, loaded.get(Event, e.event_id))
        assert book.label(e, "claude_factual") == (S(row["claude_label"]) if row["claude_label"] else None)
        assert book.label(e, "finbert_factual") == finbert_layer_labels(loaded, e.event_id)["FACTUAL"]


def test_snapshot_is_append_only(loaded):
    book = LabelBook.from_session(loaded)
    n = take_snapshot(loaded, book, T)
    assert n == len(book.scopes()) * len(LABEL_SOURCES) * 4
    take_snapshot(loaded, book, T + D)
    assert loaded.query(SentimentSnapshot).count() == 2 * n


def test_history_view_marks_restatement(loaded, settings):
    run_claude(loaded, replace(settings, claude_enabled=True), ClaudeClassifier("m", client=FakeAnthropic()))
    end = datetime.now(timezone.utc) + D
    h = views.history_view(loaded, "claude_factual", "30D", GLOBAL, days=3, end=end)
    first, last = h["rows"][0], h["rows"][-1]
    # Two days ago nothing was retrieved or labelled yet; today's labels restate that day.
    assert first["point_in_time"]["total_classified"] == 0 and first["restated"]["total_classified"] > 0
    assert first["differs"] and not last["differs"]


def test_phase3_api_and_pages(engine, settings, fake_finbert):
    from mie.db.session import make_session_factory
    from mie.pipeline import run_pipeline
    factory = make_session_factory(engine)
    reports = run_pipeline(factory, replace(settings, claude_enabled=True), fixtures=True, finbert=fake_finbert,
                           claude=ClaudeClassifier("m", client=FakeAnthropic()),
                           typer=__import__("mie.models.claude", fromlist=["EventTyper"]).EventTyper(
                               "m", client=FakeAnthropic({"event_type": "OTHER", "rationale": "x"})))
    assert {r.stage for r in reports} >= {"snapshot"}
    client = TestClient(create_app(engine))
    h = client.get("/api/history", params={"label_source": "claude_factual", "window": "30D", "days": 5}).json()
    assert len(h["rows"]) == 5 and h["snapshots"]
    assert client.get("/api/history", params={"label_source": "bogus"}).status_code == 422
    d = client.get("/api/drivers", params={"window": "30D"}).json()
    assert "POSITIVE" in d["drivers"]
    assert "reversals" in client.get("/api/momentum").json()
    assert client.get("/api/breadth", params={"scope": "US", "mode": "RESTATED"}).json()["scope"] == "US"
    for path in ("/history", "/history?label_source=media_narrative&window=24H", "/?scope=US", "/"):
        r = client.get(path)
        assert r.status_code == 200, path
    assert "Point-in-time" in client.get("/history").text
    assert "Momentum and reversals" in client.get("/").text


def test_layer_without_text_gets_no_label_anywhere(loaded, settings):
    run_claude(loaded, replace(settings, claude_enabled=True), ClaudeClassifier("m", client=FakeAnthropic()))
    minutes = loaded.scalars(select(Event).where(Event.title.like("%Minutes%"))).one()
    assert {st.layer for st in minutes.statements} == {"MANAGEMENT"}
    rec_ = next(e for e in LabelBook.from_session(loaded).events if e.event_id == minutes.id)
    book = LabelBook.from_session(loaded)
    assert book.label(rec_, "claude_factual") is None
    assert views.event_row(loaded, minutes)["claude_label"] is None
