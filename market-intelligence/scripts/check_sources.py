"""Checks that each Phase 1 endpoint is reachable and still returns the
documented format. Run this on a networked machine before trusting live data:

    python scripts/check_sources.py

Read-only: it fetches once per source and stores nothing.
"""
from __future__ import annotations

import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mie.core.config import get_settings  # noqa: E402
from mie.ingestion.base import HttpFetcher  # noqa: E402
from mie.ingestion.registry import load_connectors  # noqa: E402


def main() -> int:
    settings = get_settings()
    failures = 0
    with httpx.Client(headers={"User-Agent": settings.http_user_agent}, timeout=settings.http_timeout_s,
                      follow_redirects=True) as client:
        http = HttpFetcher(client, max_attempts=2)
        for c in load_connectors(settings):
            try:
                docs = [d for p in c.fetch(http) for d in c.parse(p)]
                dated = sum(1 for d in docs if d.published_at)
                print(f"OK    {c.spec.key}: {len(docs)} documents ({dated} with published_at)")
                for d in docs[:3]:
                    print(f"        {d.published_at}  {d.headline[:90]}")
                if not docs:
                    failures += 1
                    print("      ^ reachable but parsed 0 documents; format may have changed")
            except Exception as exc:
                failures += 1
                print(f"FAIL  {c.spec.key}: {type(exc).__name__}: {exc}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
