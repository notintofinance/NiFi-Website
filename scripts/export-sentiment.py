#!/usr/bin/env python3
"""
Export a market-sentiment snapshot from the Market Intelligence & Sentiment
Engine into this website as static JSON.

The website is a static Next.js site (no backend), so it reads a point-in-time
snapshot instead of calling the engine live. Re-run this whenever you want to
refresh the figures on notintofinance.com/sentiment.

Usage (from the ENGINE directory, with its venv active):

    cd /Users/agatbe/market-intelligence-engine
    source .venv/bin/activate
    PYTHONPATH=/Users/agatbe/market-intelligence-engine \
      python "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/scripts/export-sentiment.py"

It writes to  data/sentiment-snapshot.json  in the website project, which the
/sentiment page imports at build time. Then commit + push to deploy.
"""
import datetime
import json
import pathlib

from mie.db.session import make_engine, make_session_factory
from mie.api import views

SITE = pathlib.Path(__file__).resolve().parent.parent
OUT = SITE / "data" / "sentiment-snapshot.json"


def main() -> None:
    engine = make_engine()
    factory = make_session_factory(engine)
    with factory() as session:
        # One GLOBAL call already includes the US and Indonesia readings,
        # the asset-class breakdowns, and the notable good/bad news.
        data = views.simple_home(session, "GLOBAL", "7D")

    data["generated_at"] = (
        datetime.datetime.now(datetime.timezone.utc).isoformat()
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, default=str, ensure_ascii=False, indent=2))
    print(f"wrote {OUT}")
    print(f"  markets: {len(data.get('markets', []))}  "
          f"good_news: {len(data.get('good_news', []))}  "
          f"bad_news: {len(data.get('bad_news', []))}  "
          f"test_data_only: {data.get('test_data_only')}")


if __name__ == "__main__":
    main()
