"""Generic RSS/Atom connector for official publishers.

Configured per source in config/sources.yaml (options.url, options.document_type).
Ingests only what the feed itself publishes: title, link, date, categories and the
feed's summary. Full-page fetching is a separate, per-source licensing decision.
"""
from __future__ import annotations

import calendar
from datetime import datetime, timezone

import feedparser

from mie.core.enums import DocumentType
from mie.core.schemas import NormalizedDocument, RawPayload
from mie.ingestion.base import HttpFetcher, ParseError, SourceConnector
from mie.processing.cleaner import clean_text


def entry_time(entry) -> datetime | None:
    """feedparser normalises feed dates to UTC struct_time; missing stays missing."""
    for key in ("published_parsed", "updated_parsed"):
        if entry.get(key):
            return datetime.fromtimestamp(calendar.timegm(entry[key]), tz=timezone.utc)
    return None


class RssConnector(SourceConnector):
    default_url: str | None = None

    @property
    def url(self) -> str:
        url = self.options.get("url", self.default_url)
        if not url:
            raise ValueError(f"source {self.spec.key}: options.url is required")
        return url

    def fetch(self, http: HttpFetcher) -> list[RawPayload]:
        resp = http.request("GET", self.url)
        return [RawPayload(
            source_key=self.spec.key,
            content=resp.content,
            content_type=resp.headers.get("content-type"),
            fetched_at=datetime.now(timezone.utc),
            request_meta={"url": self.url},
        )]

    def parse(self, payload: RawPayload) -> list[NormalizedDocument]:
        feed = feedparser.parse(payload.content)
        if feed.bozo and not feed.entries:
            raise ParseError(f"unparseable feed: {feed.bozo_exception!r}")
        doc_type = DocumentType(self.options.get("document_type", DocumentType.PRESS_RELEASE.value))
        docs: list[NormalizedDocument] = []
        for entry in feed.entries:
            link = entry.get("link")
            external_id = entry.get("id") or link
            title = clean_text(entry.get("title", ""))
            if not external_id or not title:
                continue  # counted as dropped by the runner (parsed < fetched entries)
            categories = [t.get("term") for t in entry.get("tags", []) if t.get("term")]
            docs.append(NormalizedDocument(
                external_id=external_id,
                source_key=self.spec.key,
                document_type=doc_type,
                language=self.options.get("language", "en"),
                headline=title,
                body=clean_text(entry.get("summary", "")),
                url=link,
                published_at=entry_time(entry),
                retrieved_at=payload.fetched_at,
                raw_metadata={"categories": categories, "rss_entry_count": len(feed.entries)},
            ))
        return docs
