"""Federal Reserve Board press releases (RSS).

Endpoint (listed on https://www.federalreserve.gov/feeds/feeds.htm):
    https://www.federalreserve.gov/feeds/press_all.xml
Terms: U.S. federal government work, public domain. Verified live 2026-09-24
(20 items, all with pubDate). Category names: check with scripts/check_sources.py.
"""
from __future__ import annotations

from mie.ingestion.rss import RssConnector

DEFAULT_URL = "https://www.federalreserve.gov/feeds/press_all.xml"


class FedPressReleaseConnector(RssConnector):
    default_url = DEFAULT_URL
    fixture_files = ("fed_press_all.synthetic.xml",)
