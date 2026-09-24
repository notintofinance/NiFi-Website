# Source Assessment

**Verification status (2026-09-24).** The build sandbox's egress policy denied
every host below, so **none of these endpoints was live-tested from here**. The
formats and terms come from the providers' published documentation as I know
it. Run `python scripts/check_sources.py` on a machine with normal internet
access to confirm reachability before relying on a connector. Update the
"Verified" column when you do.

## Selected for the Phase 1 prototype

| # | Source | Type | Endpoint | Access | Terms | Why first | Verified |
|---|---|---|---|---|---|---|---|
| 1 | **Federal Reserve Board press releases** | CENTRAL_BANK (text) | RSS `https://www.federalreserve.gov/feeds/press_all.xml` (listed on federalreserve.gov/feeds/feeds.htm) | Public RSS, no key | U.S. federal government work, public domain. Full text may be ingested. | Primary source, high market relevance (FOMC), each item has title, link, date and category | ☐ |
| 2 | **BLS Public Data API — CPI-U** | STATISTICAL_AUTHORITY (structured) | `POST https://api.bls.gov/publicAPI/v2/timeseries/data/` series `CUUR0000SA0` (headline, NSA), `CUUR0000SA0L1E` (core, NSA) | v2 needs a free registration key (`BLS_API_KEY`). v1 works without a key at lower limits (25 queries/day). | Public domain | Structured, stable, well documented. Proves the "Python computes, Claude interprets" path. | ☐ |

**Point-in-time caveats for BLS**

- The API returns the *current* value for each period, not the value as first
  published. **Not-seasonally-adjusted CPI-U is not revised** after release, so
  V1 uses NSA series and derives YoY from NSA index levels. Seasonally adjusted
  series are revised every February and are excluded until a vintage source
  (e.g. ALFRED) is added.
- The API has no release timestamp. `published_at` is left **null**
  (`timestamp_quality = MISSING_PUBLISHED_AT`) and the knowledge time is
  `retrieved_at`. Adding the BLS release calendar is a P1 item.
- There is no free consensus forecast, so V1 computes **change versus prior
  period only** and never claims "below expectations".

## Phase 5 candidates (documented, not implemented)

| Source | Type | Access (per public docs) | Concerns |
|---|---|---|---|
| SEC EDGAR (8-K, 10-Q, submissions JSON) | REGULATORY | `data.sec.gov` JSON, no key. Requires a descriptive `User-Agent` with contact email. Fair-access limit of 10 req/s. | Good P1 candidate for company events |
| FRED / ALFRED | STATISTICAL (aggregator) | Free API key | ALFRED gives real vintages, which fixes the revision problem |
| BPS (Statistics Indonesia) WebAPI | STATISTICAL_AUTHORITY | `webapi.bps.go.id`, free key after registration | Indonesian-language metadata; the response format needs verification |
| Bank Indonesia | CENTRAL_BANK | No documented public API found. Press releases are HTML. | HTML scraping is fragile; check robots.txt and terms first |
| IDX announcements | EXCHANGE | The website JSON endpoints are undocumented and bot-protected | **Do not scrape.** Prefer an IDX data licence. |
| OJK, Kemenkeu/DJPPR, ESDM | REGULATORY / GOVERNMENT | Website publications, some PDFs | PDF parsing; Indonesian language |
| ECB, Eurostat, BoJ, RBA, BIS, IMF, World Bank, OECD | CENTRAL_BANK / MULTILATERAL | Mostly RSS and SDMX APIs, free | Each needs its own verification |
| EIA | GOVERNMENT | Free API key | Weekly petroleum status is a good commodity event |
| CFTC COT | REGULATORY | Public files and Socrata API | Weekly structured data |
| YouTube (whitelisted channels only) | VIDEO | YouTube Data API v3 provides **metadata** (title, description, publish time). Caption download through the API is limited to videos you own or have permission for. | Transcripts only through permitted mechanisms. Never crawl influencers. |
| Reuters/LSEG, Bloomberg, FT, WSJ, Nikkei | LICENSED_NEWS | Licensed feeds only | **Metadata/headline only unless a licence is in place.** The connector interface is the integration point. |
| CNBC Indonesia, Bisnis, Kontan, Katadata, Antara, IDX Channel | PUBLIC_MEDIA | Some RSS feeds exist, but they need confirmation per outlet | Default to headline + link + timestamp. Full-text copyright is unclear. |

## Rules applied to every media connector

1. Check for an official API, RSS feed or licensed feed first.
2. Record the terms and licence in `config/sources.yaml` → `licence_note`.
3. If full-text use is not clearly permitted, ingest headline, link and
   timestamp only.
4. `allow_external_llm` stays `false` until someone has confirmed that
   sending the text to an external AI provider is permitted.
