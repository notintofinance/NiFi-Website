# Market Intelligence & Sentiment Engine — Architecture (V1)

Status: Phase 0 complete; Phases 1–4 implemented. Last revised 2026-09-24.

This is an internal research prototype. It does not use and must not receive
confidential bank data, customer data, portfolio data or paid data feeds.

---

## 1. Environment audit (Phase 0 findings)

| Item | Finding | Consequence |
|---|---|---|
| Repository | `notintofinance/NiFi-Website` is a Next.js marketing site. No existing Python or market-intel code. | The engine lives in a self-contained `market-intelligence/` folder and does not touch the site build. **Recommendation:** move it to its own repository before the team starts working on it. |
| Python | 3.11.15 and 3.12 available | Target Python ≥ 3.11 |
| Hardware | 4 vCPU, 15 GB RAM, no GPU | FinBERT (110M params) runs on CPU, which is fine for event-level volumes |
| Database | `psql` client present, no server running | SQLite for local MVP; the schema is written to run unchanged on PostgreSQL (`DATABASE_URL`) |
| Network (build sandbox) | PyPI reachable. **federalreserve.gov, bls.gov, sec.gov, stlouisfed.org, bps.go.id, bi.go.id, idx.co.id, ecb.europa.eu, eia.gov and huggingface.co were all denied** by the sandbox's egress policy | Connectors are implemented against the documented formats and tested on **synthetic fixtures**. Live accessibility must be confirmed on a machine with normal internet access (`scripts/check_sources.py`). FinBERT weights must be downloaded where Hugging Face is reachable. |
| Claude credentials | No `ANTHROPIC_API_KEY` in the environment | Claude stage is off by default (`CLAUDE_ENABLED=false`); it's wired and unit-tested with a stub client |

---

## 2. Architecture diagram

```
                     ┌──────────────────────────── DATA ENGINE ────────────────────────────┐
  Official APIs ───► │ Connector (fetch) ──► Connector (parse) ──► NormalizedDocument      │
  RSS feeds     ───► │   retry/backoff         pure function        (pydantic, typed)      │
  Filings (P1)  ───► │   ingestion_runs log                                                │
  Media meta (P2)──► │                    ──► documents  (raw + normalized, content hash)  │
                     └───────────────────────────────┬─────────────────────────────────────┘
                                                     │
                     ┌──────────────────────────── EVENT ENGINE ───────────────────────────┐
                     │ cleaner ─► entity matcher (dictionary, deterministic)               │
                     │        ─► event extractor                                           │
                     │             • structured series → Python facts (macro.py)           │
                     │             • text → rule-based event type + statement layering     │
                     │        ─► dedup / clustering (hard constraints + lexical cosine)    │
                     │        ─► events, event_documents, event_statements                 │
                     │           (FACTUAL / MANAGEMENT / MEDIA layers kept separate)       │
                     └───────────────────────────────┬─────────────────────────────────────┘
                                                     │  source-blind, price-blind input
                     ┌───────────────────────── INTELLIGENCE ENGINE ───────────────────────┐
                     │  FinBERT (local)          Claude (API, gated)       ← blind to each │
                     │  sentence labels          event label, mgmt tone,     other         │
                     │                           asset implications                        │
                     │         └────────── comparison (AGREE / DISAGREE / …) ──┘           │
                     │  aggregation: breadth by window · narrative distribution ·          │
                     │  divergence flags · coverage monitoring                             │
                     └───────────────────────────────┬─────────────────────────────────────┘
                                                     │
                            FastAPI  ──►  JSON API + server-rendered dashboard
```

The three engines are Python sub-packages (`mie.ingestion`, `mie.processing`,
`mie.models` + `mie.intelligence`) that talk only through the database and
typed schemas. Any stage can be re-run on its own.

---

## 3. Data flow (one pass)

1. **Fetch.** A connector fetches raw payloads with retry and exponential
   backoff. Every run writes an `ingestion_runs` row: counts, errors, duration.
   When a source fails, the run records it and the pipeline carries on.
2. **Parse.** A pure function turns the payload into `NormalizedDocument`
   objects. It's unit-tested against fixtures.
3. **Store.** Documents are upserted by `(source_id, external_id)`. The content
   hash is kept, so a changed republication is detected rather than silently
   overwritten.
4. **Entities.** Matching uses a dictionary from `config/entities.yaml`, with
   word boundaries, case-sensitive short aliases and no ML.
5. **Events.**
   - *Structured series* (e.g. BLS CPI): Python computes facts such as index
     level, YoY % and change in YoY. The event key is
     `(series_id, period)`, so duplicates are exact and no threshold is needed.
   - *Text* (e.g. Fed press releases): the event type comes from the source's
     own category plus a keyword table (`config/event_rules.yaml`). Each
     statement is assigned a layer from the **source type and document type**,
     not from a model.
6. **Dedup.** A new text document is compared only with events that pass
   *hard constraints* (same event type, time window, overlapping entities).
   Within those it's scored by lexical cosine similarity. It attaches to the
   best match at or above the threshold; otherwise it opens a new event.
7. **FinBERT.** It runs locally on English FACTUAL and MANAGEMENT sentences.
   Sentence labels are stored with their raw probabilities, and the event-level
   label is derived without parameters (§6).
8. **Claude** (gated). It receives a minimal, source-blind, price-blind JSON
   brief per event and returns constrained labels plus asset implications.
9. **Comparison.** After both predictions are stored, a pure function assigns
   `AGREE`, `DISAGREE`, `CLAUDE_ONLY`, `FINBERT_ONLY` or `UNCERTAIN`, plus a
   `review_required` flag.
10. **Aggregation.** Counts are computed at query time over unique events for
    24H, 3D, 7D and 30D windows. Each model's result is reported separately and
    never averaged.

---

## 4. Stack

| Concern | Choice | Why |
|---|---|---|
| Language | Python 3.11 | Team skill set, NLP ecosystem |
| API & dashboard | FastAPI + Jinja2 templates (server-rendered) | One process, no JS build, easy to audit. Streamlit was rejected because its rerun model makes read-only audit views harder to test. React/Next can replace the templates later because every page is backed by a JSON endpoint. |
| ORM / DB | SQLAlchemy 2.0; SQLite (MVP) → PostgreSQL | Same models on both; `DATABASE_URL` selects |
| Schemas | Pydantic v2 | Typed contracts between engines |
| HTTP / RSS | httpx, feedparser | Standard, testable |
| Similarity | scikit-learn `HashingVectorizer` (word 1–2 grams) + cosine | Deterministic, stateless across runs, no model download. `sentence-transformers` is pluggable behind the same interface (P1). |
| Text sentiment | `ProsusAI/finbert` via `transformers` (optional extra) | Local, no data leaves the machine |
| Reasoning | Anthropic Python SDK, structured JSON output | Constrained labels |
| Tests | pytest | |

---

## 5. Database schema

All timestamps are stored as UTC. `published_at` is when the source says the
item was published. `retrieved_at` is when **we** learned of it, and that is the
point-in-time knowledge boundary.

```
sources            id, key (unique), name, source_type, country, base_url, access_method,
                   licence_note, allow_external_llm (bool), is_fixture (bool), enabled
documents          id, source_id→sources, external_id, url, document_type, language,
                   headline, body, published_at, retrieved_at, timestamp_quality,
                   content_hash, raw_metadata(JSON)            UNIQUE(source_id, external_id)
entities           id, key (unique), name, entity_type, country, tickers(JSON), asset_classes(JSON)
document_entities  document_id, entity_id, matched_alias, method
events             id, event_key (unique, for structured events), event_type, title,
                   event_time, event_time_quality, country, asset_classes(JSON), created_at,
                   updated_at, dedup_method, extraction_method,
                   event_type_history(JSON: every post-creation type change and who made it)
event_documents    event_id, document_id, similarity, attached_by, attached_at   UNIQUE(document_id)
event_entities     event_id, entity_id
event_statements   id, event_id, document_id, layer (FACTUAL|MANAGEMENT|MEDIA),
                   text, value(JSON, for computed facts), position
macro_observations id, source_id, series_id, period, value, unit, derived(JSON),
                   document_id                                   UNIQUE(series_id, period, source_id)
model_versions     id, name, version, kind (FINBERT|CLAUDE|…), config(JSON), created_at
                                                                 UNIQUE(name, version)
finbert_predictions id, event_id, statement_id, layer, model_version_id, label,
                   probabilities(JSON), input_hash, predicted_at   (append-only)
claude_predictions id, event_id, model_version_id, prompt_version, served_model,
                   status (OK|REFUSED|INVALID), factual_sentiment, management_tone,
                   impact_horizon, output(JSON), input_hash, as_of, input_tokens, output_tokens,
                   cache_read_input_tokens, error_message, predicted_at   (append-only)
claude_event_typings id, event_id, model_version_id, prompt_version, served_model, status,
                   previous_event_type, proposed_event_type, rationale, applied, input_hash,
                   as_of, tokens, predicted_at                    (append-only)
event_impacts      id, claude_prediction_id, event_id, asset, direction, horizon, rationale
model_comparisons  id, event_id, layer, finbert_prediction_ref, claude_prediction_id,
                   finbert_label, claude_label, status, review_required, compared_at
ingestion_runs     id, source_id, started_at, finished_at, status, fetched, parsed,
                   inserted, duplicates, errors, error_type, error_message, attempts
sentiment_snapshots id, as_of, scope, label_source, window, methodology_version, counts,
                   breadth                                        (append-only: what was shown)
market_data        (reserved for post-hoc validation — never read by a classifier)
```

**Append-only predictions.** Prediction rows are never updated. A new model
version, prompt version or input hash produces a new row. Uniqueness on
`(event, layer, model_version, prompt_version, input_hash)` makes re-runs
idempotent.

**Derived, not stored.** Media-narrative distribution, breadth and divergence
flags are computed at query time from predictions. Storing them would create
denormalised copies that go stale when a model version changes. Nightly
snapshots can be added later for history charts.

---

## 6. Model responsibilities

| Task | Owner | Notes |
|---|---|---|
| Fetching, parsing, arithmetic, statistics, joins | **Python** | Never an LLM |
| Entity matching, event keys for structured data | **Python** | Dictionary + natural keys |
| Duplicate detection | **Python** | Hard constraints + lexical cosine; Claude is not used |
| Sentence-level text sentiment (English) | **FinBERT** | Challenger/control model. Raw probabilities are stored for diagnostics and **not used as weights** |
| Event interpretation, management tone, asset implications, mixed/ambiguous events | **Claude** | Constrained enums; no numeric scores |
| Comparison of the two | **Python** | Only after both are stored |

**FinBERT event label (no parameters).** Across an event's sentences in one
layer:

- only POSITIVE and NEUTRAL, with at least one POSITIVE → **POSITIVE**
- only NEGATIVE and NEUTRAL, with at least one NEGATIVE → **NEGATIVE**
- at least one POSITIVE and one NEGATIVE → **MIXED**
- all NEUTRAL → **NEUTRAL**

Non-English text is **not** sent to FinBERT. It is recorded as not applicable,
and the classifier interface lets an Indonesian model be added and evaluated
separately.

**Structured macro releases** never go to FinBERT. They get Python facts and
optional Claude interpretation, so their comparison status is `CLAUDE_ONLY` by
design.

---

## 7. Connector architecture

```python
class SourceConnector(ABC):
    spec: SourceSpec                      # descriptive metadata only, no weights
    def fetch(self, client) -> list[RawPayload]     # network; retried by the runner
    def parse(self, payload) -> list[NormalizedDocument]   # pure; unit-tested
```

- Connectors are registered in `mie/ingestion/registry.py` and enabled per
  source in `config/sources.yaml`.
- The runner owns retries, backoff, timeouts, the User-Agent and run logging.
  A connector only knows its format.
- Every `SourceSpec` has `licence_note`, `access_method` and
  `allow_external_llm`. Media connectors default to headline and metadata only
  (§ SOURCES.md).
- Fixture mode loads the same `parse()` input from `tests/fixtures/`. Those
  documents are stored under a separate `is_fixture=true` source, and the
  dashboard shows a **SYNTHETIC DATA** banner whenever any are present.

---

## 8. Bias controls

| Risk | Control | Where enforced |
|---|---|---|
| Source anchoring | **Source-blind input.** The model brief has no publisher, URL, author, popularity or view count. Statements are listed without attribution. | `mie/models/briefing.py`, with a test that asserts no source name or URL is in the prompt |
| Hindsight / look-ahead | **Price-blind, point-in-time input.** The brief is built with an `as_of` cut-off, so documents retrieved after it are excluded and `market_data` is never read. | `briefing.build_event_brief(as_of=…)`, tested |
| Model cross-contamination | **Blind independent classification.** FinBERT and Claude read the same brief builder output and never each other's labels. Comparison runs after both are stored. | Separate modules; `intelligence/comparison.py` |
| Duplicate amplification | Aggregation counts **unique events**, never documents | `intelligence/aggregation.py` |
| Media-volume amplification | Media narrative is a distribution with its sample size, not a multiplier | `intelligence/narrative.py` |
| Invented weights | None in code. Remaining thresholds (dedup similarity, time window, alert levels) are config values marked `UNCALIBRATED` and have calibration routines (§10) | `config/settings`, `processing/dedup.py::calibrate_threshold` |
| Pseudo-precision | Claude returns labels, not probabilities. Breadth is always shown with the event count and full distribution | Output schema, templates |
| Silent methodology drift | Model versions, prompt version, input hash, append-only rows | `model_versions`, prediction tables |
| Missing-data illusions | `ingestion_runs` plus a coverage-anomaly check before any trend is read | `intelligence/coverage.py` (P1) |

---

## 9. Token and cost controls

1. Claude is **off by default** and only runs on event types listed in
   `CLAUDE_EVENT_TYPES` (default: macro and market-relevant types, excluding
   `OTHER`).
2. Claude receives **one compact JSON brief per unique event**, never per
   article and never a whole document. The brief holds deduplicated statements,
   capped per layer (`BRIEF_MAX_STATEMENTS_PER_LAYER`), plus Python-computed
   facts.
3. Structured numbers are pre-computed. Claude interprets them and doesn't
   calculate them.
4. The input hash is checked before calling. An unchanged brief under the same
   model and prompt version is never re-sent.
5. The system prompt and output schema are static, so they are cacheable
   prefixes.
6. Token usage is stored per prediction, so cost per event is observable.
7. Only sources with `allow_external_llm: true` (public official or permitted
   content) can reach Claude. Any other source is blocked in code.

Rough estimate: a naive approach sends ~5 articles × ~1,200 tokens ≈ 6,000
input tokens per event. The V1 brief is ~150–400 tokens, **more than a 90%
reduction**, before prompt caching.

---

## 10. What remains a numerical assumption (and how it gets removed)

| Parameter | V1 default | Status | Calibration path |
|---|---|---|---|
| Dedup cosine threshold | 0.35 | UNCALIBRATED | Label ~300 document pairs (same event / not), then `calibrate_threshold()` picks the F1-maximising value on the dev split and reports it on the validation split |
| Dedup time window | 72h | UNCALIBRATED | Empirical distribution of publish lags within labelled clusters |
| Brief statement cap per layer | 8 | Cost control, not a model parameter | Measure the label change rate vs cap on the dev set |
| Alert thresholds | none in V1 | Config-only | Walk-forward evaluation (Phase 3) |

Breadth `(P − N) / T` and the rolling windows have no free parameters beyond
the window lengths the brief specified.

---

## 11. Minimum viable flow — what proves it end to end

```
Fed press-release RSS (text)  ┐
BLS CPI API (structured)      ┴► documents ► events (+dedup) ► FinBERT ► Claude ► comparison ► SQLite ► dashboard
```

`python -m mie.cli demo` runs this chain on fixtures. The FinBERT and Claude
stages each report `skipped` with a reason when their runtime or credentials
are absent. See README for running against live sources.

---

## 12. Phase 2: Claude intelligence

| Capability | Implementation | Control |
|---|---|---|
| Event interpretation | `ClaudeClassifier`: factual sentiment, management tone, horizon, factors, per-asset implications | Constrained JSON schema; the asset list is fixed in `config/assets.yaml`; numeric labels fail validation |
| Event typing where rules fail | `EventTyper` runs only on events the rules left as `OTHER`. The payload excludes the rules' label so it can't anchor the model. | A change is written to `events.event_type_history` with the prediction id. `OTHER` is an allowed and encouraged answer. |
| Blind comparison | Unchanged. It now skips a layer with no statements, so a tone Claude gives for missing management text is never compared. | `run_comparisons` |
| Asset-level view | `asset_breadth()`: breadth per asset over events whose **latest** OK interpretation states a direction for it | Absence is not counted as neutral; no cross-asset total |
| Pre-flight review | `python -m mie.cli claude-preview` prints the exact request per event and why others are skipped. It makes **no API call**; token counting is excluded because it would also send the content. | Shares `eligible_briefs()` with the live run, so preview and run cannot drift |
| API failures | `api_error_policy`: auth/permission errors and rate limits **stop** the stage; bad requests, connection errors and 5xx skip the event. The SDK already retries transient errors twice. | Errors are logged, not stored as predictions, so the next run retries them |
| Prompt structure | Instructions, label definitions and asset list are in a byte-identical system prompt; the user turn is only the event JSON | `cache_control` on the prefix; `cache_read_input_tokens` is recorded to verify it engages (it needs the prefix above the model's minimum cacheable length) |
| Precision | Briefs carry computed facts at the **published** precision (BLS: index 3 dp, rates 1 dp). The stated change equals the difference of the stated rates. | Full precision stays in `event_statements.value` for audit |
| Diagnostics | `/models`: status counts, token totals, cache reads, agreement by event type with n, review queue, re-typed events | Agreement rate is labelled as model consistency, **not accuracy** |

Pipeline order: ingest → events → FinBERT → Claude typing → Claude interpretation → comparison.
FinBERT runs before Claude only for convenience; neither reads the other's output.

**Not yet done in Phase 2 (needs data we don't have):** Claude classification of
individual media articles, since there are no licensed media sources yet, and
Claude fact extraction from company releases, since there is no company source
yet. Both reuse `StructuredClaudeCall` when those sources arrive.

---

## 13. Phase 3: aggregation

**Label sources.** Each is a separate layer or model. None is combined with another.

| id | Meaning |
|---|---|
| `claude_factual` | Claude's factual-layer sentiment |
| `finbert_factual` | FinBERT factual-layer label, derived from sentences |
| `agreed_factual` | The factual label, only where Claude and FinBERT give the same directional or neutral label |
| `claude_management` | Claude's management tone (MIXED_POSITIVE/NEGATIVE → MIXED) |
| `finbert_management` | FinBERT management-layer label |
| `media_narrative` | Strict plurality of per-article FinBERT labels; ties and no-media give no label |

**Rule applied everywhere:** a layer with no statements gets no label, in
comparisons, aggregation and the feed alike. A model's opinion on text it
wasn't shown is not counted.

**Point-in-time vs restated** (`mie/intelligence/history.py`).
- *Point-in-time at t*: an event counts only if a supporting document was
  retrieved by t, and only predictions made by t are used, with the latest
  FinBERT model version available at t. This is the **only** series valid for
  backtests or signal evaluation.
- *Restated*: today's labels applied to past windows. The History page shows
  the two series side by side and flags every day where they differ.

**Drivers.** These are the unique events behind a value, grouped by label and
ordered by time. They are deliberately not ranked by importance, since that
would require weights.

**Momentum and reversal.** 24H vs 7D and 7D vs 30D are shown side by side. A
reversal is flagged when both are defined and strictly opposite in sign. Zero
is not a reversal, there is no magnitude threshold, and n is always shown.
Magnitude-based alerts belong to the alert framework, where thresholds must be
documented and calibrated.

**Scopes.** `GLOBAL` plus each country present in the data.

**Snapshots.** Every pipeline run (or `python -m mie.cli snapshot`) appends the
point-in-time values for every scope × label source × window, tagged with
`METHODOLOGY_VERSION`. A snapshot that differs from a later recomputation
means data arrived or was revised afterwards, and that difference is itself
auditable.

**Not included, deliberately.** There is no exponential time decay (the spec
requires empirical validation first). There are no confidence intervals on
breadth: any interval needs a chosen confidence level, and with small n the
sample size shown next to each value is the honest signal. Both can be added
once the gold set exists.

---

## 14. Phase 4: dashboard

| Page | Contents |
|---|---|
| **Market dashboard** `/` | Headline strip per scope (Claude factual 24H/7D/30D, 7D week-on-week); **asset heatmap** (assets × windows, point-in-time, 7D vs one week earlier); sentiment reversals; narrative divergences; positive and negative events (7D, newest first); review queue; per-source breadth detail; source status |
| **Event feed** `/events` | Filters (country, asset class, ticker, event type, source type, Claude sentiment, agreement, dates); flags column (review, divergence); **CSV export** with the same filters (`/events.csv`) |
| **Event detail** `/events/{id}` | Facts / management / media layers with provenance, both models, comparisons, implications, type history, supporting documents, raw JSON link |
| **Sentiment history** `/history` | Breadth line chart (point-in-time solid, restated dashed gray), daily composition bars in a **separate** chart (no dual axis), table view, drivers, recorded snapshots |

**Charts** are server-rendered SVG (`mie/api/charts.py`) with a small script for
the hover crosshair and tooltip. No chart library or CDN is loaded, which suits a
locked-down internal network. Missing days break the line: nothing is
interpolated or zero-filled. The table view stays on the page as the accessible
equivalent.

**Heatmap colours.** The scale diverges: blue for positive, red for negative,
and gray at zero. Blue comes from the palette ramp (steps 250/400/550). Red is
derived at matched OKLCH lightness. Each same-magnitude blue/red pair passes the
colour-blind and normal-vision separation checks in light and dark mode. The
lightest ramp step (150) was rejected because it failed normal-vision
separation. Cells are shaded by magnitude in thirds, which is display
quantisation only. The exact value and n are always printed in the cell, so
colour never carries meaning alone.

**Week-on-week** compares a window's point-in-time value with the same window
one week earlier and reports the sign of the change. There is no threshold.
Where either value is undefined, it says "no 1-wk comparison" instead of
guessing.

**CSV export safety.** Cells beginning with `= + - @` (or a tab or CR) are
prefixed with `'` so text from external sources can't run as a spreadsheet
formula. The filename is marked `SYNTHETIC` whenever fixture data is present.
