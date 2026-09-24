# Market Intelligence & Sentiment Engine (prototype)

A traceable, bias-aware, event-driven market intelligence pipeline for internal
investment research. It is **not** a news chatbot and **not** a weighted sentiment
score.

```
SOURCE → DOCUMENT → EVENT → DEDUP → FinBERT ┐
                                   Claude  ┴→ COMPARISON → DATABASE → DASHBOARD
```

- **Docs:** [Architecture](docs/ARCHITECTURE.md) · [Source assessment](docs/SOURCES.md) · [Backlog P0/P1/P2](docs/BACKLOG.md)
- **Status:** Phases 1–3 complete. It has only
  been exercised on **synthetic fixtures**, because the build environment had
  no internet access to the sources (see ARCHITECTURE §1).

## Quick start

```bash
cd market-intelligence
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt          # add requirements-ml.txt for local FinBERT
cp .env.example .env                     # then edit; never commit .env

pytest -q                                # 89 tests, no network needed
python -m mie.cli demo                   # SYNTHETIC fixtures → data/mie.db
python -m mie.cli serve                  # http://127.0.0.1:8000
```

The dashboard shows a **SYNTHETIC DATA PRESENT** banner whenever fixture data is
in the database. Delete `data/mie.db` before running against live sources.

## Running live

```bash
python scripts/check_sources.py          # confirm the Fed RSS + BLS API are reachable
pip install -r requirements-ml.txt       # FinBERT (downloads ProsusAI/finbert once)
python -m mie.cli run                    # ingest → events → FinBERT → (Claude) → comparison
```

Claude stays off until `CLAUDE_ENABLED=true` and `ANTHROPIC_API_KEY` are both
set. Before enabling it, review exactly what would be sent. This makes no API call:

```bash
python -m mie.cli claude-preview                 # every event: SEND or why not, plus the exact payload
python -m mie.cli claude-preview --show-system   # also the fixed system prompt and output schema
```

Only sources with `allow_external_llm: true` in `config/sources.yaml` can
ever reach the API. Get approval before turning this on.

When a stage can't run (no FinBERT weights, no API key), it reports `skipped`
with the reason instead of failing the pipeline.

Each run ends by recording a point-in-time snapshot of every breadth value
(`python -m mie.cli snapshot` does this on demand). The History page compares
what was knowable on each day with today's restated view.

There are no database migrations yet (Alembic is on the P1 backlog). After
pulling a schema change, delete `data/mie.db` and re-run.

## Layout

```
mie/
  core/           enums (controlled vocabularies), typed schemas, settings
  db/             SQLAlchemy models (append-only predictions), session, helpers
  ingestion/      connector interface, retry runner, fed_rss.py, bls.py, registry
  processing/     cleaner, entity dictionary, event rules, macro facts, dedup, extractor
  models/         briefing (source-blind, price-blind input), finbert.py, claude.py
  intelligence/   comparison, aggregation (breadth/windows), narrative, service
  api/            FastAPI JSON + server-rendered dashboard (overview, feed, detail, history, models, sources)
  preview.py      pre-flight view of what Claude would receive
config/           sources.yaml, entities.yaml, event_rules.yaml, assets.yaml
tests/            pytest suite + tests/fixtures (SYNTHETIC)
```

## Adding a source

1. Check the source's API, RSS or licence terms and record them in
   `docs/SOURCES.md`.
2. Subclass `SourceConnector` with `fetch()` for network I/O and `parse()` as a
   pure function returning `NormalizedDocument` objects.
3. Add a synthetic fixture and a parse test.
4. Register the class in `mie/ingestion/registry.py` and add an entry to
   `config/sources.yaml` with `licence_note` and `allow_external_llm`.
   Categories go in `config/event_rules.yaml` if the source has any.

## Design rules this code enforces

- No numeric weights for sources, models or importance. Uncalibrated
  thresholds are marked as such and have calibration routines.
- Breadth counts **unique events**, never articles, and is always shown with
  n and the full distribution.
- FinBERT and Claude never see each other's output, the publisher's identity,
  or market prices. They are compared only after both results are stored.
- Structured numbers are computed in Python. Claude interprets them and never
  does arithmetic.
- Every prediction stores the model version, prompt version, input hash and
  as-of time. Rows are never overwritten.
