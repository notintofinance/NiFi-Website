"""Phase 4: dashboard pieces: charts, heatmap, week-on-week, CSV export."""
import csv
import io
from dataclasses import replace
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from mie.api import charts, views
from mie.api.main import create_app
from mie.core.enums import Sentiment as S
from mie.intelligence.aggregation import breadth_from_counts
from mie.intelligence.history import asset_breadth_at, week_on_week
from mie.intelligence.labels import ClaudeObs, EventRecord, LabelBook
from mie.models.claude import ClaudeClassifier, EventTyper
from tests.conftest import FakeAnthropic

T = datetime(2026, 9, 24, 12, tzinfo=timezone.utc)
D = timedelta(days=1)


def _row(day, pit, restated, n=1):
    def b(v):
        return {"breadth_scaled": v, "total_classified": 0 if v is None else n, "positive": n if v and v > 0 else 0,
                "neutral": 0, "mixed": 0, "negative": n if v and v < 0 else 0}
    return {"t": f"2026-09-{day:02d}T12:00:00+00:00", "point_in_time": b(pit), "restated": b(restated)}


# ----------------------------------------------------------------------------- charts
def test_line_chart_breaks_on_missing_values_and_marks_isolated_points():
    rows = [_row(1, 50, 50), _row(2, 40, 40), _row(3, None, 30), _row(4, -20, 30), _row(5, None, 30)]
    svg = charts.breadth_line_chart(rows)
    assert svg.count('class="s-pit"') == 1           # one path: days 1-2
    assert svg.count('class="s-pit dot"') == 1       # isolated day 4 is a marker, not a line
    assert svg.count('class="s-restated"') == 1      # restated is continuous
    assert svg.count('class="hit"') == 5 and "Point-in-time" in svg and "Restated" in svg


def test_charts_are_separate_single_axis_svgs():
    rows = [_row(d, 10 * d, 10 * d, n=d) for d in range(1, 6)]
    line, comp = charts.breadth_line_chart(rows), charts.composition_chart(rows)
    assert line.startswith("<svg") and comp.startswith("<svg") and line != comp
    assert ">+100<" in line and ">-100<" in line and ">5<" in comp  # breadth axis vs count axis


def test_chart_tooltips_are_escaped():
    row = _row(1, 10, 10)
    row["t"] = '2026-09-01"><script>x</script>'
    assert "<script>" not in charts.breadth_line_chart([row])


def test_empty_chart():
    assert charts.breadth_line_chart([]) == "" and charts.composition_chart([]) == ""


# ----------------------------------------------------------------------------- heatmap + wow
def test_heat_bins():
    assert [views.heat_bin(v) for v in (None, 0, 1, 33, 34, 66, 67, 100, -10, -50, -100)] == \
        ["na", "z", "p1", "p1", "p2", "p2", "p3", "p3", "n1", "n2", "n3"]


def test_week_on_week():
    up = week_on_week(breadth_from_counts({"POSITIVE": 1}), breadth_from_counts({"NEGATIVE": 1}))
    assert up == {"delta": 200, "direction": "UP", "previous": -100}
    assert week_on_week(breadth_from_counts({"POSITIVE": 1}), breadth_from_counts({}))["direction"] is None
    assert week_on_week(breadth_from_counts({"NEUTRAL": 1}), breadth_from_counts({"NEUTRAL": 2}))["direction"] == "FLAT"


def test_asset_breadth_is_point_in_time():
    e = EventRecord(1, "e", "INFLATION", "US", T - D, T - D, frozenset({"FACTUAL"}), [
        ClaudeObs(T - D, 1, S.POSITIVE, None, (("USD", "NEGATIVE"),)),
        ClaudeObs(T + D, 2, S.POSITIVE, None, (("USD", "POSITIVE"),)),
        ClaudeObs(T + 2 * D, 3, S.POSITIVE, None, ())])
    book = LabelBook([e])
    assert asset_breadth_at(book, "USD", T, 7 * D).breadth == -1           # only prediction 1 existed
    assert asset_breadth_at(book, "USD", T + D + timedelta(hours=1), 7 * D).breadth == 1
    assert asset_breadth_at(book, "USD", T + 3 * D, 7 * D).total_classified == 0  # latest is silent on USD
    assert book.assets() == []  # latest interpretation names no asset -> no heatmap row


# ----------------------------------------------------------------------------- CSV
def test_csv_neutralises_formulas():
    rows = [{"id": 1, "title": "=HYPERLINK(\"http://x\")", "entities": ["@evil", "ok"], "review_required": False}]
    out = list(csv.reader(io.StringIO(views.events_csv(rows, "http://h"))))
    assert out[0] == views.CSV_COLUMNS
    rec = dict(zip(out[0], out[1]))
    assert rec["title"].startswith("'=") and rec["entities"] == "'@evil; ok" and rec["detail_url"] == "http://h/events/1"


# ----------------------------------------------------------------------------- pages
def test_dashboard_pages(engine, settings, fake_finbert):
    from mie.db.session import make_session_factory
    from mie.pipeline import run_pipeline
    run_pipeline(make_session_factory(engine), replace(settings, claude_enabled=True), fixtures=True,
                 finbert=fake_finbert, claude=ClaudeClassifier("m", client=FakeAnthropic()),
                 typer=EventTyper("m", client=FakeAnthropic({"event_type": "OTHER", "rationale": "x"})))
    client = TestClient(create_app(engine))
    home = client.get("/").text
    assert "Breadth by scope" in home and "Asset heatmap" in home and 'class="h h-' in home
    assert "Narrative divergences" in home and "Positive and negative events" in home
    hist = client.get("/history?window=30D&days=10").text
    assert hist.count('<svg class="chart"') == 2 and "Table view" in hist
    r = client.get("/events.csv?event_type=MONETARY_POLICY")
    assert r.status_code == 200 and "SYNTHETIC" in r.headers["content-disposition"]
    rows = list(csv.DictReader(io.StringIO(r.text)))
    assert rows and all(x["event_type"] == "MONETARY_POLICY" and x["is_fixture"] == "True" for x in rows)
    assert "Export CSV" in client.get("/events").text
