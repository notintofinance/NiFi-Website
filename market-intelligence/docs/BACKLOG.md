# MVP Backlog

✅ = done in this iteration · ☐ = open

## P0 — prove the traceable flow (Phase 1, plus the Phase 2 wiring needed for the flow)

- ✅ Project skeleton, config via env, `.env.example`, no secrets in code
- ✅ Typed schemas: `NormalizedDocument`, `SourceSpec`, enums for source types, event types, layers and labels
- ✅ Database schema (SQLAlchemy; SQLite ↔ PostgreSQL), UTC-safe timestamps, append-only prediction tables
- ✅ Connector interface and runner with retry/backoff, per-run logging and failure isolation
- ✅ Connector: Federal Reserve press releases RSS (text)
- ✅ Connector: BLS CPI-U API (structured) with Python-computed facts
- ✅ Fixture mode with synthetic payloads, stored under an `is_fixture` source and shown with a banner in the UI
- ✅ Dictionary entity matcher
- ✅ Event extraction: structured (natural key) + text (source category + keyword rules), with FACTUAL, MANAGEMENT and MEDIA statement layering
- ✅ Deduplication: hard constraints + lexical cosine; threshold marked UNCALIBRATED, plus a calibration routine
- ✅ FinBERT module (lazy-loaded, English-only guard, raw probabilities stored, parameter-free event label)
- ✅ Source-blind, price-blind brief builder
- ✅ Claude module: constrained JSON schema, gated by config and by a per-source external-LLM permission, input-hash idempotency, token logging
- ✅ Comparison statuses + `review_required`
- ✅ Sentiment breadth + 24H/3D/7D/30D windows, reported per model and never averaged
- ✅ Narrative distribution + normalised-entropy dispersion; divergence flags
- ✅ FastAPI: event feed (filters), event detail, breadth summary, source health; JSON API
- ✅ Tests: parsing, timestamps, dedup, entities, FinBERT label derivation, schemas, breadth, disagreement, missing data, API failure
- ✅ Phase 2: Claude event typing for rule-`OTHER` events, with type history
- ✅ Phase 2: pre-flight `claude-preview` (no API call) sharing eligibility logic with the live run
- ✅ Phase 2: per-asset implication breadth (latest prediction only; absence ≠ neutral)
- ✅ Phase 2: `/models` diagnostics (agreement by event type with n, usage, review queue)
- ✅ Phase 2: API error policy (stop on auth/rate limit), cacheable fixed system prefix, published-precision facts
- ☐ Run `scripts/check_sources.py` from a networked machine and tick the Verified column in SOURCES.md
- ☐ Download FinBERT weights (`pip install -r requirements-ml.txt`) and run the pipeline once live
- ☐ Obtain an `ANTHROPIC_API_KEY` for the team and have someone approve the first Claude run

## P1 — make it trustworthy

- ☐ Gold-label tooling: export events for blind labelling by ≥2 analysts; Cohen/Fleiss kappa and Krippendorff's alpha
- ☐ Frozen dev / validation / test split by **time** (walk-forward); prompt changes only against dev
- ☐ Dedup pair labelling + `calibrate_threshold` run; publish the chosen threshold and its F1
- ☐ Coverage anomaly monitor (documents/day vs trailing distribution; last success; parse failures)
- ☐ BLS release calendar → true `published_at`; ALFRED vintages for revised series
- ☐ SEC EDGAR connector (8-K items → event types, deterministic mapping)
- ☐ Message Batches API for non-urgent backfills (50% cost), gated like the live stage
- ☐ Analyst review actions on the review queue (needs auth) feeding the gold set
- ☐ Sentence-transformer similarity backend behind the same interface; compare against the lexical baseline on labelled pairs
- ☐ Alembic migrations
- ☐ PostgreSQL docker-compose profile
- ☐ Nightly snapshots for Sentiment History charts

## P2 — breadth and polish

- ☐ Indonesian sources (BPS, BI, OJK, DJPPR), then evaluate an Indonesian financial NLP model vs Claude
- ☐ Company IR + whitelisted YouTube metadata; transcript segmentation where permitted
- ☐ Management Language Tracker (quarter-over-quarter phrase comparison, labels only)
- ☐ Media metadata connectors (licence-checked); narrative dispersion in the dashboard
- ☐ Claude per-article media labels (independent of FinBERT) and Claude fact extraction from company releases
- ☐ Alert framework (reversal, deterioration, divergence, disagreement, feed failure), with documented, configurable thresholds
- ☐ Asset-class heatmap and Sentiment History pages
- ☐ Market-data table for **post-hoc validation only** (event study), never read by classifiers
- ☐ Auth/SSO in front of the dashboard; audit-log export
