# Market Intelligence & Sentiment Engine (prototype)

A traceable, bias-aware, event-driven market intelligence pipeline for internal
investment research. It is **not** a news chatbot and **not** a weighted sentiment
score.

```
SOURCE → DOCUMENT → EVENT → DEDUP → FinBERT ┐
                                   Claude  ┴→ COMPARISON → DATABASE → DASHBOARD
```

- **Docs:** [Architecture](docs/ARCHITECTURE.md) · [Source assessment](docs/SOURCES.md) · [Backlog P0/P1/P2](docs/BACKLOG.md)
- **Status:** Phases 1–4 complete; Phase 5 (sources) under way. Fed and BLS verified live on
  2026-09-24 with real FinBERT. SEC EDGAR, ECB and YouTube connectors are built but disabled
  until verified (see docs/SOURCES.md).

## Quick start

Requires **Python 3.11 or newer**. On macOS, the built-in `python3` is usually 3.9 and is too old:
`pip` then fails with *"No matching distribution found for anthropic>=1.0"*. Install Python 3.12
from python.org (or `brew install python@3.12`) and use `python3.12` below.

```bash
cd market-intelligence
python3.12 -m venv .venv && source .venv/bin/activate
python --version                         # must show 3.11 or newer
pip install -r requirements.txt          # add requirements-ml.txt for local FinBERT
cp .env.example .env                     # then edit; never commit .env

pytest -q                                # 121 tests, no network needed
python -m mie.cli demo                   # SYNTHETIC fixtures → data/mie.db
python -m mie.cli serve                  # http://127.0.0.1:8000
```

The dashboard shows a **SYNTHETIC DATA PRESENT** banner whenever fixture data is
in the database. Delete `data/mie.db` before running against live sources.

## Running live

```bash
python scripts/check_sources.py          # confirm enabled sources are reachable
python scripts/check_sources.py --include-disabled   # also check sources awaiting verification
pip install -r requirements-ml.txt       # FinBERT (downloads ProsusAI/finbert once)
python -m mie.cli run                    # ingest → events → FinBERT → (Claude) → comparison
```

### Claude at no extra cost (Claude Pro/Max subscription)

The default Claude backend is your **Claude subscription through Claude Code**,
so no API key and no per-token bill. Every other component is free: public
sources, local FinBERT, SQLite and a local dashboard.

```bash
npm install -g @anthropic-ai/claude-code   # or see https://code.claude.com for other installers
claude                                    # once: log in with your Claude Pro/Max account, then /exit
```

Then set `CLAUDE_ENABLED=true` in `.env`, review what would be sent, and run:

```bash
python -m mie.cli claude-preview                 # every event: SEND or why not, plus the exact payload (no call)
python -m mie.cli run
```

- Calls count towards your plan's usage limits. If you hit the limit, the stage
  stops cleanly, and the next run continues where it stopped, because unchanged
  events are never re-sent.
- Each call runs `claude -p` in an empty temporary folder with action tools
  denied and structured JSON output. `ANTHROPIC_API_KEY` is removed from its
  environment, so it can never silently bill an API key.
- **Terms:** subscription use falls under consumer terms and privacy settings.
  That's fine for a personal prototype on public data. A bank deployment should
  switch to `CLAUDE_BACKEND=api` (commercial terms) or an enterprise agreement.

To use the API instead, set `CLAUDE_BACKEND=api` and `ANTHROPIC_API_KEY`.

Only sources with `allow_external_llm: true` in `config/sources.yaml` can
ever reach the API. Get approval before turning this on.

When a stage can't run (no FinBERT weights, no API key), it reports `skipped`
with the reason instead of failing the pipeline.

Each run ends by recording a point-in-time snapshot of every breadth value
(`python -m mie.cli snapshot` does this on demand). The History page compares
what was knowable on each day with today's restated view.

There are no database migrations yet (Alembic is on the P1 backlog). After
pulling a schema change, delete `data/mie.db` and re-run.

## Run automatically (macOS)

Install two background jobs once. You won't need to activate the environment
or open Terminal again:

```bash
./scripts/macos/install_launchd.sh        # pipeline every 2 hours (pass a number for another interval)
```

- **Dashboard:** always on at http://127.0.0.1:8000. It starts at login and
  restarts if it stops. It is reachable from this Mac only.
- **Pipeline:** `mie run` every N hours and once at login. A run missed while
  the Mac slept happens on wake. Unchanged events are never re-sent to Claude.
- **Logs:** `data/logs/pipeline.log` and `data/logs/dashboard.log`.
- **Run the pipeline now:** `launchctl kickstart gui/$(id -u)/com.notintofinance.mie.pipeline`
- **Remove the jobs:** `./scripts/macos/uninstall_launchd.sh` (keeps your data)

Manual commands without activating the environment: `./scripts/mie run`,
`./scripts/mie claude-preview`, `./scripts/mie serve`.

## Layout

```
mie/
  core/           enums (controlled vocabularies), typed schemas, settings
  db/             SQLAlchemy models (append-only predictions), session, helpers
  ingestion/      connector interface, retry runner, rss.py (Fed, ECB), bls.py, sec_edgar.py, youtube.py
  processing/     cleaner, entity dictionary, event rules, macro facts, dedup, extractor
  models/         briefing (source-blind, price-blind input), finbert.py, claude.py
  intelligence/   comparison, aggregation (breadth/windows), narrative, service
  api/            FastAPI JSON + server-rendered dashboard (dashboard, feed + CSV, detail, history charts, models, sources)
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
