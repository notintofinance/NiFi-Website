"""Federal Reserve Board press releases (RSS).

Endpoint (listed on https://www.federalreserve.gov/feeds/feeds.htm):
    https://www.federalreserve.gov/feeds/press_all.xml
Terms: U.S. federal government work, public domain.
V1 ingests title, link, date, category and the RSS description. Fetching the full
release page is P1.
"""
from __future__ import annotations

import calendar
from datetime import datetime, timezone

import feedparser

from mie.core.enums import DocumentType
from mie.core.schemas import NormalizedDocument, RawPayload
from mie.ingestion.base import HttpFetcher, ParseError, SourceConnector
from mie.processing.cleaner import clean_text

DEFAULT_URL = "https://www.federalreserve.gov/feeds/press_all.xml"


class FedPressReleaseConnector(SourceConnector):
    fixture_files = ("fed_press_all.synthetic.xml",)

    def fetch(self, http: HttpFetcher) -> list[RawPayload]:
        url = self.options.get("url", DEFAULT_URL)
        resp = http.request("GET", url)
        return [RawPayload(
            source_key=self.spec.key,
            content=resp.content,
            content_type=resp.headers.get("content-type"),
            fetched_at=datetime.now(timezone.utc),
            request_meta={"url": url},
        )]

    def parse(self, payload: RawPayload) -> list[NormalizedDocument]:
        feed = feedparser.parse(payload.content)
        if feed.bozo and not feed.entries:
            raise ParseError(f"unparseable RSS: {feed.bozo_exception!r}")
        docs: list[NormalizedDocument] = []
        for entry in feed.entries:
            link = entry.get("link")
            external_id = entry.get("id") or link
            title = clean_text(entry.get("title", ""))
            if not external_id or not title:
                continue  # counted as dropped by the runner (parsed < fetched entries)
            published = None
            if entry.get("published_parsed"):
                published = datetime.fromtimestamp(calendar.timegm(entry.published_parsed), tz=timezone.utc)
            categories = [t.get("term") for t in entry.get("tags", []) if t.get("term")]
            docs.append(NormalizedDocument(
                external_id=external_id,
                source_key=self.spec.key,
                document_type=DocumentType.PRESS_RELEASE,
                language="en",
                headline=title,
                body=clean_text(entry.get("summary", "")),
                url=link,
                published_at=published,
                retrieved_at=payload.fetched_at,
                raw_metadata={"categories": categories, "rss_entry_count": len(feed.entries)},
            ))
        return docs
