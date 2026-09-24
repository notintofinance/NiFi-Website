"""FastAPI app: JSON API + server-rendered dashboard. Read-only."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.engine import Engine

from mie.api import views
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
    def api_breadth(country: str | None = None, asset_class: str | None = None, as_of: str | None = None):
        with factory() as s:
            return views.breadth_table(s, _date(as_of), country, asset_class)

    @app.get("/api/sources")
    def api_sources():
        with factory() as s:
            return views.source_health(s)

    # ------------------------------------------------------------------ HTML
    def render(request: Request, name: str, s, **ctx) -> HTMLResponse:
        return TEMPLATES.TemplateResponse(request, name, {"fixture_data": views.any_fixture_data(s), **ctx})

    @app.get("/", response_class=HTMLResponse)
    def overview(request: Request, country: str | None = None, asset_class: str | None = None):
        with factory() as s:
            breadth = views.breadth_table(s, None, country or None, asset_class or None)
            recent = views.list_events(s, views.EventFilters(), limit=10)
            review = [e for e in views.list_events(s, views.EventFilters(), limit=1000) if e["review_required"]]
            return render(request, "overview.html", s, breadth=breadth, recent=recent, review=review,
                          country=country or "", asset_class=asset_class or "",
                          sources=views.source_health(s))

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

    @app.get("/events/{event_id}", response_class=HTMLResponse)
    def event_page(request: Request, event_id: int):
        with factory() as s:
            d = views.event_detail(s, event_id)
            if d is None:
                raise HTTPException(404, "event not found")
            return render(request, "event_detail.html", s, e=d)

    @app.get("/sources", response_class=HTMLResponse)
    def sources_page(request: Request):
        with factory() as s:
            return render(request, "sources.html", s, sources=views.source_health(s))

    return app
