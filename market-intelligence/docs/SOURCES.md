# Source Assessment

A source is **enabled** only after `python scripts/check_sources.py` has been run
against it from a machine with normal internet access. The build sandbox has no
access to these hosts, so verification happens on an analyst's machine.

## Status

| Source | Key | Type | Endpoint | Access | Status |
|---|---|---|---|---|---|
| Federal Reserve Board press releases | `fed_press_releases` | CENTRAL_BANK | RSS `https://www.federalreserve.gov/feeds/press_all.xml` | Public, no key | ✅ **Verified live 2026-09-24**: 20 items, all with pubDate, 0 parse errors. Enabled. |
| BLS CPI-U (NSA) | `bls_cpi` | STATISTICAL_AUTHORITY | `POST https://api.bls.gov/publicAPI/v{1,2}/timeseries/data/` | v1 no key; v2 free key `BLS_API_KEY` | ✅ **Verified live 2026-09-24**: 62 observations, 0 parse errors. Enabled. |
| SEC EDGAR filings (watchlist) | `sec_edgar` | REGULATORY | `https://data.sec.gov/submissions/CIK##########.json` | No key. User-Agent with contact e-mail required; ≤10 req/s | ☐ Implemented, **disabled** until `HTTP_USER_AGENT` contains an e-mail and the check passes |
| ECB press releases | `ecb_press` | CENTRAL_BANK | RSS `https://www.ecb.europa.eu/rss/press.html` | Public | ☐ Implemented (generic RSS), **disabled**: endpoint and reuse terms unverified |
| YouTube official channels | `youtube_official` | VIDEO | `https://www.youtube.com/feeds/videos.xml?channel_id=…` | Public feed, no key | ☐ Implemented, **disabled**: whitelist empty until channel IDs are approved |

To verify and enable a disabled source:

```bash
python scripts/check_sources.py --include-disabled --source sec_edgar
# if OK: set `enabled: true` for it in config/sources.yaml, then python -m mie.cli run
```

## Caveats per source

**BLS.** The API returns current values, not first-release vintages.
Not-seasonally-adjusted CPI-U is not revised, so V1 uses NSA series only. There
is no release timestamp, so knowledge time is the retrieval time, and all 62
observations show as "missing timestamps" by design. A release calendar
(P1) will give true release times. There is no free consensus forecast, so the
engine never claims "above/below expectations".

**Fed.** The engine maps the feed's own categories to event types, and
`check_sources.py` lists every category seen. "Orders on Banking Applications" was
added after the first live run showed an approval landing in OTHER. For new
category names, add a line to `config/event_rules.yaml`.

**SEC EDGAR.**
- *Metadata only:* form type, 8-K item codes, company, acceptance time and link.
  The 8-K item codes are the filer's own statement of the filing's subject, which
  gives a deterministic event type (Item 2.02 → EARNINGS, 5.02 →
  MANAGEMENT_CHANGE, 2.01/5.01 → M&A, and so on).
- *Acceptance time:* `acceptanceDateTime` ends in "Z" but appears to be US
  Eastern time, so it is read as America/New_York. This is conservative: if it
  were really UTC, filings would be placed 4–5 hours late, never early.
  `check_sources.py` prints one raw and one interpreted value next to the filing
  index URL. Compare that with the index page's "Accepted" time and record the
  result here.
- *Watchlist:* AAPL, MSFT, NVDA, JPM and XOM for the prototype. Edit
  `options.watchlist` and add matching entries to `config/entities.yaml`.

**ECB.** The ECB website's reuse terms (attribution) need confirming before
enabling. The event type comes from keyword rules until its category names are
known.

**YouTube.**
- *Scope:* official institution and company channels only, and approved media.
  No search and no influencers.
- *Metadata only:* title, description, upload time and link. Transcripts are
  **not** fetched, because caption download needs the channel owner's
  authorisation or a licensed provider.
- *Claude:* `allow_external_llm` is false until the whitelist is approved.

## Indonesian sources: plan and blockers

| Source | What exists | Blocker | Next step |
|---|---|---|---|
| **BPS** (Statistics Indonesia) | WebAPI `webapi.bps.go.id` with free registration key; dynamic tables (CPI, GDP, trade) | Needs a key, and the exact response format must be confirmed from a real response, not guessed | Register a key and store it as `BPS_API_KEY` (never in chat). Send one real JSON response for the CPI table; the connector is written against that sample. Numbers are processed in Python, so FinBERT is not needed. |
| **Bank Indonesia** | Press releases (Indonesian and English) on bi.go.id; BI-Rate decisions | No documented public API or RSS confirmed | Check robots.txt and the terms of use. If HTML retrieval of press-release headlines is permitted, build a headline+link connector; otherwise use a licensed feed |
| **IDX** | Company announcements and disclosures on idx.co.id | Website endpoints are undocumented and bot-protected; **do not scrape** | IDX data subscription (licensed). The connector interface is ready for it |
| **OJK, Kemenkeu/DJPPR, ESDM** | Publications and SBN auction results (DJPPR) as HTML/PDF | No APIs; PDF parsing; terms to check | DJPPR auction results are the highest-value item (BOND_AUCTION); assess terms first |
| **Official YouTube** (BI, Kemenkeu) | Public channel feeds | Channel IDs must be confirmed from the official websites | Add them to the `youtube_official` whitelist |

Indonesian-language text goes to Claude (subject to `allow_external_llm`) but
**not** to FinBERT, which is English-only. An Indonesian financial NLP model can
be evaluated behind the same classifier interface (P2).

## Media (for the narrative layer)

No media source is connected, so the narrative layer and its divergence flags
stay empty. For every outlet, check for an official API, RSS or licensed feed,
record the terms in `licence_note`, and ingest headline, link and time only
unless full text is clearly licensed. Keep `allow_external_llm: false` until
sending that text to an external AI provider is confirmed as permitted.
