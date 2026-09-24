"""YouTube channel metadata for a whitelist of official channels (public Atom feed).

Endpoint: https://www.youtube.com/feeds/videos.xml?channel_id=<CHANNEL_ID>
Access: no key; returns each channel's most recent uploads (metadata only).

Scope, deliberately narrow:
* only channels listed in options.channels (official institutions and companies,
  approved media). No search, no influencers;
* metadata only: video id, title, description, channel, upload time, URL;
* no transcripts. Caption download needs a permitted mechanism, such as the
  channel owner's authorisation or a licensed provider, and is a separate decision.
"""
from __future__ import annotations

from datetime import datetime, timezone

import feedparser

from mie.core.enums import DocumentType
from mie.core.schemas import NormalizedDocument, RawPayload
from mie.ingestion.base import HttpFetcher, ParseError, SourceConnector
from mie.ingestion.rss import entry_time
from mie.processing.cleaner import clean_text

FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"


class YouTubeChannelConnector(SourceConnector):
    fixture_files = ("youtube_channel.synthetic.xml",)

    def fetch(self, http: HttpFetcher) -> list[RawPayload]:
        payloads = []
        for ch in self.options.get("channels", []):
            url = FEED_URL.format(channel_id=ch["channel_id"])
            resp = http.request("GET", url)
            payloads.append(RawPayload(source_key=self.spec.key, content=resp.content,
                                       content_type=resp.headers.get("content-type"),
                                       fetched_at=datetime.now(timezone.utc),
                                       request_meta={"url": url, "channel": ch}))
        return payloads

    def parse(self, payload: RawPayload) -> list[NormalizedDocument]:
        feed = feedparser.parse(payload.content)
        if feed.bozo and not feed.entries:
            raise ParseError(f"unparseable feed: {feed.bozo_exception!r}")
        channel = payload.request_meta.get("channel", {})
        allowed = {c["channel_id"] for c in self.options.get("channels", [])}
        docs = []
        for e in feed.entries:
            video_id = e.get("yt_videoid")
            channel_id = e.get("yt_channelid") or channel.get("channel_id")
            if not video_id or (allowed and channel_id not in allowed):
                continue  # whitelist is enforced on parse too, not only on fetch
            docs.append(NormalizedDocument(
                external_id=f"youtube:{video_id}",
                source_key=self.spec.key,
                document_type=DocumentType.VIDEO_METADATA,
                language=channel.get("language", self.options.get("language", "en")),
                headline=clean_text(e.get("title", "")),
                body=clean_text(e.get("media_description") or e.get("summary", "")),
                url=e.get("link") or f"https://www.youtube.com/watch?v={video_id}",
                author=e.get("author"),
                published_at=entry_time(e),
                retrieved_at=payload.fetched_at,
                raw_metadata={"categories": [], "video_id": video_id, "channel_id": channel_id,
                              "channel": e.get("author"), "transcript": "not_ingested"},
            ))
        return docs
