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
- ✅ Phase 3: six separate label sources (factual/management/media × model), none combined
- ✅ Phase 3: point-in-time vs restated history with differences flagged
- ✅ Phase 3: drivers per window, momentum (24H/7D, 7D/30D) and parameter-free reversal flags, country scopes
- ✅ Phase 3: append-only sentiment snapshots per pipeline run
- ✅ Phase 4: market dashboard (scope strip, asset heatmap with week-on-week, reversals, divergences, positive/negative events)
- ✅ Phase 4: history charts (point-in-time vs restated line, separate composition chart, hover, table view)
- ✅ Phase 4: feed flags column and formula-safe CSV export
- ✅ Fed + BLS verified live and pipeline run with real FinBERT (2026-09-24, analyst Mac)
- ✅ Phase 5: generic RSS connector; SEC EDGAR (8-K items), ECB, YouTube whitelist connectors (disabled until verified)
- ✅ Phase 5: dashboard shows Claude and FinBERT side by side; source categories visible; Fed banking-applications mapping
- ☐ Verify and enable SEC EDGAR (needs HTTP_USER_AGENT with e-mail), ECB (terms), YouTube (approved channel IDs)
- ☐ Obtain an `ANTHROPIC_API_KEY` for the team and have someone approve the first Claude run

## P1 — make it trustworthy

- ☐ Gold-label tooling: export events for blind labelling by ≥2 analysts; Cohen/Fleiss kappa and Krippendorff's alpha
- ☐ Frozen dev / validation / test split by **time** (walk-forward); prompt changes only against dev
- ☐ Dedup pair labelling + `calibrate_threshold` run; publish the chosen threshold and its F1
- ☐ Coverage anomaly monitor (documents/day vs trailing distribution; last success; parse failures)
- ☐ BLS release calendar → true `published_at`; ALFRED vintages for revised series
- ☐ Message Batches API for non-urgent backfills (50% cost), gated like the live stage
- ☐ Analyst review actions on the review queue (needs auth) feeding the gold set
- ☐ Sentence-transformer similarity backend behind the same interface; compare against the lexical baseline on labelled pairs
- ☐ Alembic migrations
- ☐ PostgreSQL docker-compose profile
- ☐ Schedule the pipeline (cron) so snapshots accumulate daily

## P2 — breadth and polish

- ☐ Indonesian sources: BPS (needs key + real sample response), BI (terms check), DJPPR auctions, IDX (licence); then evaluate an Indonesian NLP model vs Claude
- ☐ Company IR + whitelisted YouTube metadata; transcript segmentation where permitted
- ☐ Management Language Tracker (quarter-over-quarter phrase comparison, labels only)
- ☐ Media metadata connectors (licence-checked); narrative dispersion in the dashboard
- ☐ Claude per-article media labels (independent of FinBERT) and Claude fact extraction from company releases
- ☐ Alert framework (reversal, deterioration, divergence, disagreement, feed failure), with documented, configurable thresholds
- ☐ Market-data table for **post-hoc validation only** (event study), never read by classifiers
- ☐ Auth/SSO in front of the dashboard; audit-log export
