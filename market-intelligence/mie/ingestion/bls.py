"""BLS Public Data API — CPI-U (not seasonally adjusted).

Docs: https://www.bls.gov/developers/api_signature_v2.htm
    POST https://api.bls.gov/publicAPI/v2/timeseries/data/   (registration key)
    POST https://api.bls.gov/publicAPI/v1/timeseries/data/   (no key, lower limits)
Terms: public domain.

Point-in-time notes (see docs/SOURCES.md):
* NSA CPI-U is not revised after release, so current values equal first-release values.
* The API carries no release timestamp -> published_at is None; knowledge time is retrieved_at.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from mie.core.enums import DocumentType
from mie.core.schemas import NormalizedDocument, RawPayload
from mie.ingestion.base import HttpFetcher, ParseError, SourceConnector

V1_URL = "https://api.bls.gov/publicAPI/v1/timeseries/data/"
V2_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

# Descriptive metadata for supported series. Only NSA series (see module docstring).
# release_group: series published together in one release form ONE event.
SERIES = {
    "CUUR0000SA0": {"name": "CPI-U All items, U.S. city average, NSA", "release_group": "US_CPI"},
    "CUUR0000SA0L1E": {"name": "CPI-U All items less food and energy, U.S. city average, NSA",
                       "release_group": "US_CPI"},
}
UNIT = "INDEX_1982_84_100"


class BlsCpiConnector(SourceConnector):
    fixture_files = ("bls_cpi.synthetic.json",)

    def __init__(self, spec, options=None, api_key: str | None = None):
        super().__init__(spec, options)
        self.api_key = api_key

    def fetch(self, http: HttpFetcher) -> list[RawPayload]:
        now = datetime.now(timezone.utc)
        series = self.options.get("series", list(SERIES))
        # Two prior years so each recent month has its year-ago comparator.
        body: dict = {"seriesid": series, "startyear": str(now.year - 2), "endyear": str(now.year)}
        url = V1_URL
        if self.api_key:
            body["registrationkey"] = self.api_key
            url = V2_URL
        resp = http.request("POST", url, json=body)
        return [RawPayload(
            source_key=self.spec.key,
            content=resp.content,
            content_type=resp.headers.get("content-type"),
            fetched_at=datetime.now(timezone.utc),
            request_meta={"url": url, "series": series},  # key deliberately not logged
        )]

    def parse(self, payload: RawPayload) -> list[NormalizedDocument]:
        try:
            data = json.loads(payload.content)
        except json.JSONDecodeError as exc:
            raise ParseError(f"invalid JSON: {exc}") from exc
        if data.get("status") != "REQUEST_SUCCEEDED":
            raise ParseError(f"BLS status {data.get('status')}: {data.get('message')}")
        docs: list[NormalizedDocument] = []
        for series in data.get("Results", {}).get("series", []):
            series_id = series.get("seriesID")
            if series_id not in SERIES:
                continue
            for obs in series.get("data", []):
                period = obs.get("period", "")
                if not (period.startswith("M") and period[1:].isdigit() and 1 <= int(period[1:]) <= 12):
                    continue  # M13 = annual average; not a release event
                try:
                    value = float(obs["value"])
                except (KeyError, ValueError):
                    continue  # "-" marks unavailable data; skipped, not imputed
                period_key = f"{obs['year']}-{int(period[1:]):02d}"
                docs.append(NormalizedDocument(
                    external_id=f"{series_id}:{period_key}",
                    source_key=self.spec.key,
                    document_type=DocumentType.DATA_RELEASE,
                    language="en",
                    headline=f"{SERIES[series_id]['name']} — {period_key}: index {value:.3f}",
                    body="",
                    url="https://data.bls.gov/timeseries/" + series_id,
                    published_at=None,
                    retrieved_at=payload.fetched_at,
                    raw_metadata={
                        "observation": {
                            "series_id": series_id,
                            "series_name": SERIES[series_id]["name"],
                            "release_group": SERIES[series_id]["release_group"],
                            "period": period_key,
                            "value": value,
                            "unit": UNIT,
                            # BLS flags the newest period; only that one is a *new release*.
                            # Older periods are stored as history for derivations.
                            "is_latest": obs.get("latest") == "true",
                        },
                        "footnotes": [f.get("text") for f in obs.get("footnotes", []) if f.get("text")],
                    },
                ))
        return docs
