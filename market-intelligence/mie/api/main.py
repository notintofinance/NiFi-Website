"""FastAPI app: JSON API + server-rendered dashboard. Read-only."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, Response
from markupsafe import Markup
from fastapi.templating import Jinja2Templates
from sqlalchemy.engine import Engine

from mie.api import charts, views
from mie.core.enums import AgreementStatus, EventType, Sentiment, SourceType
from mie.db.session import make_session_factory

TEMPLATES = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))


def _date(value: str | None, end: bool = False) -> datetime | None:
    if not value:
        return None
    d = datetime.fromisoformat(value)
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    if end and len(value) == 10:  # date-only upper bound is inclusive of the whole day
        d = d.replace(hour=23, minute=59, second=59)
    return d


def _check(label_source: str, window: str) -> None:
    if label_source not in views.LABEL_SOURCES:
        raise HTTPException(422, f"label_source must be one of {sorted(views.LABEL_SOURCES)}")
    if window not in views.WINDOWS:
        raise HTTPException(422, f"window must be one of {list(views.WINDOWS)}")


def create_app(engine: Engine) -> FastAPI:
    app = FastAPI(title="Market Intelligence & Sentiment Engine", version="0.1.0")
    factory = make_session_factory(engine)

    def filters(country, asset_class, ticker, event_type, source_type, sentiment, agreement, date_from, date_to):
        return views.EventFilters(
            country=country or None, asset_class=asset_class or None, ticker=ticker or None,
            event_type=event_type or None, source_type=source_type or None, sentiment=sentiment or None,
            agreement=agreement or None, date_from=_date(date_from), date_to=_date(date_to, end=True))

    # ------------------------------------------------------------------ JSON API
    @app.get("/api/events")
    def api_events(country: str | None = None, asset_class: str | None = None, ticker: str | None = None,
                   event_type: str | None = None, source_type: str | None = None, sentiment: str | None = None,
                   agreement: str | None = None, date_from: str | None = None, date_to: str | None = None,
                   limit: int = Query(200, le=1000)):
        with factory() as s:
            return views.list_events(s, filters(country, asset_class, ticker, event_type, source_type,
                                                sentiment, agreement, date_from, date_to), limit)

    @app.get("/api/events/{event_id}")
    def api_event(event_id: int):
        with factory() as s:
            d = views.event_detail(s, event_id)
        if d is None:
            raise HTTPException(404, "event not found")
        return d

    @app.get("/api/breadth")
    def api_breadth(scope: str = views.GLOBAL, as_of: str | None = None,
                    mode: Literal["POINT_IN_TIME", "RESTATED"] = "POINT_IN_TIME"):
        with factory() as s:
            return views.breadth_table(s, _date(as_of), scope, mode)

    @app.get("/api/history")
    def api_history(label_source: str = "claude_factual", window: str = "7D", scope: str = views.GLOBAL,
                    days: int = Query(30, ge=1, le=365), end: str | None = None):
        _check(label_source, window)
        with factory() as s:
            return views.history_view(s, label_source, window, scope, days, _date(end))

    @app.get("/api/drivers")
    def api_drivers(label_source: str = "claude_factual", window: str = "7D", scope: str = views.GLOBAL,
                    as_of: str | None = None):
        _check(label_source, window)
        with factory() as s:
            return views.drivers_view(s, label_source, window, scope, _date(as_of))

    @app.get("/api/momentum")
    def api_momentum(as_of: str | None = None):
        with factory() as s:
            return views.momentum_view(s, _date(as_of))

    @app.get("/api/assets")
    def api_assets(as_of: str | None = None):
        with factory() as s:
            return views.asset_table(s, _date(as_of))

    @app.get("/api/models")
    def api_models():
        with factory() as s:
            return views.model_diagnostics(s)

    @app.get("/api/sources")
    def api_sources():
        with factory() as s:
            return views.source_health(s)

    # ------------------------------------------------------------------ HTML
    def render(request: Request, name: str, s, **ctx) -> HTMLResponse:
        return TEMPLATES.TemplateResponse(request, name, {"fixture_data": views.any_fixture_data(s), **ctx})

    @app.get("/", response_class=HTMLResponse)
    def overview(request: Request, scope: str = views.GLOBAL):
        with factory() as s:
            book = views.LabelBook.from_session(s)
            if scope not in book.scopes():
                scope = views.GLOBAL
            return render(request, "overview.html", s,
                          strip=views.headline_strip(s, "claude_factual", book=book),
                          assets=views.asset_table(s, book=book),
                          breadth=views.breadth_table(s, None, scope, book=book),
                          momentum=views.momentum_view(s, book=book),
                          drivers=views.drivers_view(s, "claude_factual", "7D", scope, book=book),
                          divergences=views.divergences(s),
                          review=[e for e in views.list_events(s, views.EventFilters(), limit=1000)
                                  if e["review_required"]],
                          sources=views.source_health(s), scope=scope)

    @app.get("/history", response_class=HTMLResponse)
    def history_page(request: Request, label_source: str = "claude_factual", window: str = "7D",
                     scope: str = views.GLOBAL, days: int = Query(30, ge=1, le=365)):
        _check(label_source, window)
        with factory() as s:
            h = views.history_view(s, label_source, window, scope, days)
            return render(request, "history.html", s, h=h,
                          line_chart=Markup(charts.breadth_line_chart(h["rows"])),
                          composition_chart=Markup(charts.composition_chart(h["rows"])),
                          drivers=views.drivers_view(s, label_source, window, scope),
                          label_sources=views.LABEL_SOURCES, windows=list(views.WINDOWS))

    @app.get("/events", response_class=HTMLResponse)
    def events_page(request: Request, country: str = "", asset_class: str = "", ticker: str = "",
                    event_type: str = "", source_type: str = "", sentiment: str = "", agreement: str = "",
                    date_from: str = "", date_to: str = ""):
        f = filters(country, asset_class, ticker, event_type, source_type, sentiment, agreement, date_from, date_to)
        with factory() as s:
            return render(request, "events.html", s, events=views.list_events(s, f), f=f,
                          q=dict(country=country, asset_class=asset_class, ticker=ticker, event_type=event_type,
                                 source_type=source_type, sentiment=sentiment, agreement=agreement,
                                 date_from=date_from, date_to=date_to),
                          event_types=[e.value for e in EventType], source_types=[t.value for t in SourceType],
                          sentiments=[x.value for x in Sentiment], agreements=[a.value for a in AgreementStatus])

    @app.get("/events.csv")
    def events_csv(request: Request, country: str = "", asset_class: str = "", ticker: str = "",
                   event_type: str = "", source_type: str = "", sentiment: str = "", agreement: str = "",
                   date_from: str = "", date_to: str = ""):
        f = filters(country, asset_class, ticker, event_type, source_type, sentiment, agreement, date_from, date_to)
        with factory() as s:
            body = views.events_csv(views.list_events(s, f, limit=100_000), str(request.base_url).rstrip("/"))
            synthetic = views.any_fixture_data(s)
        name = "mie-events-SYNTHETIC.csv" if synthetic else "mie-events.csv"
        return Response(body, media_type="text/csv",
                        headers={"Content-Disposition": f'attachment; filename="{name}"'})

    @app.get("/events/{event_id}", response_class=HTMLResponse)
    def event_page(request: Request, event_id: int):
        with factory() as s:
            d = views.event_detail(s, event_id)
            if d is None:
                raise HTTPException(404, "event not found")
            return render(request, "event_detail.html", s, e=d)

    @app.get("/models", response_class=HTMLResponse)
    def models_page(request: Request):
        with factory() as s:
            return render(request, "models.html", s, d=views.model_diagnostics(s))

    @app.get("/sources", response_class=HTMLResponse)
    def sources_page(request: Request):
        with factory() as s:
            return render(request, "sources.html", s, sources=views.source_health(s))

    return app
