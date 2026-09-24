"""Checks that each source endpoint is reachable and still returns the documented
format. Run on a networked machine before enabling or trusting a source:

    python scripts/check_sources.py                      # enabled sources
    python scripts/check_sources.py --include-disabled   # also sources awaiting verification
    python scripts/check_sources.py --source ecb_press   # one source

Read-only: it fetches once per source and stores nothing. It also prints the
source's own category names, so event-type mapping gaps are visible.
"""
from __future__ import annotations

import argparse
import sys
from collections import Counter
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mie.core.config import get_settings  # noqa: E402
from mie.ingestion.base import HttpFetcher  # noqa: E402
from mie.ingestion.registry import load_connectors  # noqa: E402
from mie.processing.rules import EventRules, base_source_key  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--include-disabled", action="store_true")
    ap.add_argument("--source", action="append", help="source key (repeatable)")
    args = ap.parse_args()
    settings = get_settings()
    rules = EventRules.from_yaml()
    failures = 0
    with httpx.Client(headers={"User-Agent": settings.http_user_agent}, timeout=settings.http_timeout_s,
                      follow_redirects=True) as client:
        http = HttpFetcher(client, max_attempts=2)
        connectors = load_connectors(settings, include_disabled=args.include_disabled,
                                     only=set(args.source) if args.source else None)
        for c in connectors:
            try:
                docs = [d for p in c.fetch(http) for d in c.parse(p)]
            except Exception as exc:
                failures += 1
                print(f"FAIL  {c.spec.key}: {type(exc).__name__}: {exc}")
                continue
            dated = sum(1 for d in docs if d.published_at)
            print(f"OK    {c.spec.key}: {len(docs)} documents ({dated} with published_at)")
            for d in docs[:3]:
                print(f"        {d.published_at}  {d.headline[:90]}")
            if not docs:
                failures += 1
                print("      ^ reachable but parsed 0 documents; format may have changed")
            cats = Counter(cat for d in docs for cat in d.raw_metadata.get("categories", []))
            mapped = rules.source_categories.get(base_source_key(c.spec.key), {})
            for cat, n in cats.most_common():
                print(f"        category {cat!r} x{n} -> {mapped.get(cat, 'not mapped (keywords, then OTHER)')}")
            sample = next((d for d in docs if "acceptance_raw" in d.raw_metadata), None)
            if sample:
                print(f"        timezone check: EDGAR acceptanceDateTime {sample.raw_metadata['acceptance_raw']!r} "
                      f"read as {sample.raw_metadata['acceptance_timezone']} = {sample.published_at} UTC. "
                      f"Compare with 'Accepted' on {sample.url.rsplit('/', 1)[0]}/")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
