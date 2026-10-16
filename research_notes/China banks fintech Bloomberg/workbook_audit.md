# Bloomberg workbook audit

## Which securities, metrics and dates are covered, and which values are actual versus estimates?

### Takeaway

The workbook is a Bloomberg Excel `BDH` history export with four sheets: two live-linked formula sheets and two formula-free cached-value copies. It contains 11 bank-designated rows and 10 fintech-designated rows, but only 10 rows are commercial banks and only nine fintech tickers are unique. The date grid spans 2010Q1–2026Q3, but it is an observation-date history rather than a clean fiscal-period dataset, and it contains no actual/estimate, fiscal-period, currency, scale, restatement or reporting-basis fields.

### Cited Findings

- Workbook integrity: the file audited was 424,385 bytes, SHA-256 `31aef2251b049d41e6cf1efbce2120a3ac9dbdea7ad429138d40b187f7baabc1`. The OOXML core properties identify both creator and last modifier as `bloomberg`, with creation at `2026-10-14T02:57:58Z` and modification at `2026-10-14T03:33:10Z`. The original workbook was not edited or exported. — [TIM - 11.xlsx](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Sheet inventory and used ranges: `Bank!A1:CK224` has 231 formulas; `Bank 1!A1:CK224` has none; `Fintech!A1:CK154` has 160 formulas; and `Fin!A1:CK154` has none. Cached values in `Bank!C4:CK224` equal `Bank 1!C4:CK224` cell for cell, and cached values in `Fintech!C4:CK154` equal `Fin!C4:CK154` cell for cell. I therefore used the static `Bank 1` and `Fin` copies for analysis while retaining the formula sheets for provenance. — [Workbook, all four used ranges](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Formula design: `Bank` contains 220 `_xll.BFieldInfo` formulas in column B plus 11 `_xll.BDH` array formulas, one per security. The first is `Bank!D4:CK24 = _xll.BDH($A5,$C5:$C24,$B1,$B2,"Dir=H","Per=Q","Days=A","Dts=S","Sort=R")`; subsequent security blocks hide the repeated date header with `Dts=H`. `Fintech` contains 150 `BFieldInfo` formulas and 10 analogous `BDH` arrays, starting at `Fintech!D4:CK19`. `B1` is 1 January 2010 and `B2` is blank, so the end date was dynamic at refresh time. — [Bank!A1:CK224 and Fintech!A1:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- The 86 raw date columns in `Bank 1!D4:CK4` represent only 67 calendar quarters, from 31 March 2010 through 30 September 2026. Nineteen quarters appear twice because both calendar quarter-end and preceding business-day observations are present, for example `2024-06-30` and `2024-06-28`. All calculations below retain the later calendar date once per quarter; adding every column would double-count 19 periods. — [Bank 1!D4:CK4](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- The 30 September 2026 column is not a clean Q3 fundamental period. For example, all ICBC accounting fields in `Bank 1!D5:D19` repeat the 30 June values in `E5:E19`, while market-cap and valuation fields change. The same pattern is visible for fintech names. This indicates that `BDH Per=Q` sampled the latest known field value on the observation date; it did not create Q3 estimates. The latest defensible common fundamental cutoff is 2026Q2/H1. — [Bank 1!D5:E24; Fin!D5:E154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Bank securities and exact row blocks:

| Rows | Ticker | Company | Audit status |
|---|---|---|---|
| `5:24` | `601398 CH Equity` | ICBC | In scope |
| `25:44` | `601939 CH Equity` | China Construction Bank | In scope |
| `45:64` | `601288 CH Equity` | Agricultural Bank of China | In scope |
| `65:84` | `601988 CH Equity` | Bank of China | In scope |
| `85:104` | `601328 CH Equity` | Bank of Communications | In scope |
| `105:124` | `601658 CH Equity` | Postal Savings Bank of China | In scope; history begins 2016Q1 |
| `125:144` | `600036 CH Equity` | China Merchants Bank | In scope |
| `145:164` | `600000 CH Equity` | Shanghai Pudong Development Bank | In scope |
| `165:184` | `601995 CH Equity` | China International Capital Corporation | **Not a commercial bank; exclude from bank statistics** |
| `185:204` | `600016 CH Equity` | China Minsheng Bank | In scope |
| `205:224` | `000001 CH Equity` | Ping An Bank | In scope |

  The requested Industrial Bank (`601166 CH`) and China CITIC Bank (`601998 CH`) are absent. The Shanghai Stock Exchange identifies `601995` as China International Capital Corporation, a capital-markets firm, confirming that it is a ticker substitution rather than CITIC Bank. — [Bank 1!A5:C224](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [Shanghai Stock Exchange](https://www.sse.com.cn/assortment/stock/areatrade/area/detail.shtml?AREANAME=22)
- Fintech/platform securities and exact row blocks:

| Rows | Ticker | Company/model | Audit status |
|---|---|---|---|
| `5:19` | `700 HK Equity` | Tencent/platform | In scope |
| `20:34` | `9988 HK Equity` | Alibaba/platform | In scope |
| `35:49` | `9618 HK Equity` | JD.com/platform | In scope |
| `50:64` | `2318 HK Equity` | Ping An/insurance conglomerate | Heterogeneous, not a fintech pure-play |
| `65:79` | `9618 HK Equity` | JD.com/platform | **Exact duplicate of rows 35:49** |
| `80:94` | `300059 CH Equity` | East Money/digital broker and fund distributor | In scope |
| `95:109` | `FUTU US Equity` | Futu/offshore digital broker | In scope; not a Mainland market-share proxy |
| `110:124` | `3660 HK Equity` | Qfin/loan facilitator | In scope |
| `125:139` | `LX US Equity` | Lexin/loan facilitator | In scope |
| `140:154` | `FINV US Equity` | FinVolution/loan facilitator | In scope |

  Lufax (`6623 HK` or `LU US`) is absent. Company statistics below remove the second JD block and use nine unique securities. — [Fin!A5:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Bank field dictionary, based on the mnemonics in `Bank 1!C5:C24` repeated for every ticker:

| Bloomberg mnemonic | Stock/flow/ratio | Defensible interpretation and use |
|---|---|---|
| `BS_TOT_ASSET` | End-period stock | Total assets; usable for within-company growth and peer asset scale after currency/scale validation |
| `BS_GROSS_LOANS_COMPANY_BASIS` | End-period stock | Gross company-basis loans; this is an on-balance-sheet bank loan measure, not a platform-facilitated balance |
| `BS_CUSTOMER_DEPOSITS` | End-period stock | Bloomberg customer-deposit balance; requires definition reconciliation against each annual report |
| `TOTAL_EQUITY` | End-period stock | Total consolidated equity, not common equity attributable to shareholders |
| `SALES_REV_TURN` | Period flow/turnover | Bloomberg sales/revenue/turnover; for banks it is not comparable with published operating revenue on a net-interest basis |
| `IS_OPER_INC` | Period flow | Operating income/profit field; for ICBC, four 2025 quarterly observations sum to published operating profit, not net income |
| `IS_INT_INC` | Period flow | Gross interest income, not net interest income |
| `ARD_NET_FEE_AND_COMMISSION_INC` | Period flow | Net fee and commission income; update frequency must be checked before summing quarterly observations |
| `T12_NET_INT_MARGIN` | Trailing ratio (%) | Bloomberg trailing-12-month NIM; not identical to the bank-reported annual NIM |
| `RETURN_ON_ASSET` | Ratio (%) | Bloomberg ROA basis; broadly comparable only when definition is held constant |
| `RETURN_COM_EQY` | Ratio (%) | Bloomberg return on common equity; not necessarily company-reported weighted-average ROE |
| `NPLS_TO_TOTAL_LOANS` | End-period ratio (%) | NPL ratio |
| `IS_PROV_FOR_LOAN_LOSS` | Period flow | Loan-loss provision; sign and quarterly/cumulative basis require field metadata |
| `BS_CET1_BUFFR_PCT` | Ratio (%) | **CET1 buffer percentage, not CET1 capital ratio** |
| `EQY_DPS` | Per-share/market field | Dividend per share; the workbook does not identify declared, paid, trailing or fiscal basis |
| `CUR_MKT_CAP` | Point-in-time stock | Market capitalization; currency/scale not specified in the workbook |
| `PX_TO_BOOK_RATIO` | Market multiple | Price-to-book at observation date |
| `PE_RATIO` | Market multiple | Trailing/current P/E at observation date |
| `BEST_PE_RATIO` | Consensus market multiple | Estimate-derived forward P/E, but no forecast year, estimate count or revision date is supplied |
| `DIVIDEND_12_MONTH_YIELD` | Trailing market ratio (%) | Trailing 12-month dividend yield |

  — [Bank 1!C5:C24](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Fintech field dictionary, based on `Fin!C5:C19` repeated for every ticker:

| Bloomberg mnemonic | Stock/flow/ratio | Defensible interpretation and use |
|---|---|---|
| `SALES_REV_TURN` | Period flow | Reported revenue/turnover; within-company growth is usable, but bank revenue definitions differ |
| `PG_REVENUE_VALUE` | Unresolved operating field | `BFieldInfo` failed and no product-group dimension or definition is retained; do not use in cross-company analysis |
| `EBIT` | Period flow | EBIT; not economically comparable with bank operating profit because interest is core bank revenue |
| `EBITDA` | Period flow | EBITDA; only 37.5% populated and several series are stale/repeated |
| `NET_INCOME` | Period flow | Net income; usable for within-company growth with fiscal-period caution |
| `BS_TOT_ASSET` | End-period stock | Total assets; absolute aggregation invalid without reporting-currency normalization |
| `TOTAL_EQUITY` | End-period stock | Total equity |
| `RETURN_ON_ASSET` | Ratio (%) | Bloomberg ROA |
| `RETURN_COM_EQY` | Ratio (%) | Bloomberg common-equity return |
| `MONTHLY_ACTIVE_USERS` | Operating KPI | Only Tencent and Futu populate the field, with no retained definition or unit; not a consistent user panel |
| `PE_RATIO` | Market multiple | Trailing/current P/E |
| `BEST_PE_RATIO` | Consensus market multiple | Forward P/E without explicit forecast year/count/revision metadata |
| `PX_TO_BOOK_RATIO` | Market multiple | Price-to-book |
| `CURRENT_EV_TO_12M_SALES` | Market multiple | Current EV/trailing-12-month sales |
| `DIVIDEND_12_MONTH_YIELD` | Trailing market ratio (%) | Trailing 12-month yield |

  — [Fin!C5:C19](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- No sheet contains a dedicated actual/estimate flag. Historical fundamental fields should be labelled “cached Bloomberg historical observations,” market fields “point-in-time market observations,” and `BEST_PE_RATIO` “estimate-derived multiple.” The file does not contain FY2026E–FY2028E revenue, earnings, balance-sheet or ratio forecasts. — [Bank 1!C5:CK224; Fin!C5:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- The workbook contains no explicit unit, currency, fiscal-period, consolidated/standalone, reported/restated or scale columns, and the `BDH` formulas have no currency or scale overrides. ICBC values show that many Mainland-bank amounts are in RMB millions, but that validation cannot be generalized to the mixed HK/US fintech list. Trading currency must not be assumed to be reporting currency. — [Bank!D4:CK224; Fintech!D4:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Missing-value pattern after deduplicating quarters: bank assets/deposits/equity are 93.1% populated; gross loans only 56.0% and begin in 2015Q3; the CET1-buffer field is 58.5%; and forward P/E is just 1.5%. Fintech revenue/assets/equity/net income are 73.0% populated; EBIT 63.0%; EBITDA 37.5%; `PG_REVENUE_VALUE` 41.3%; forward P/E 19.4%; and MAU only 7.0%. The raw sheets also contain 220/150 `#N/A Requesting Data...` values from failed field-description formulas and 3,426/4,868 `#N/A N/A` data cells on each bank/fintech pair. — [Bank 1!B5:CK224; Fin!B5:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)

### Inferences

- The workbook is suitable as a cached observation panel, not as a ready-made fundamental database. Quarter deduplication, ticker correction, definition tagging and currency validation are prerequisites.
- “2026Q3” cannot be assigned a uniform actual or estimate status. It combines Q3 market prices with forward-filled Q2 fundamentals. The prior report’s decision to stop fundamental comparisons at 2026 H1/Q2 is correct.
- The `BFieldInfo` formulas were intended to provide definitions, but every one is cached as `#N/A Requesting Data...`; the workbook therefore preserves mnemonic names but not authoritative Bloomberg definitions or units.

### Gaps

- The Bloomberg field descriptions, units, default currencies, scaling, fiscal-period identifiers and reported/restated flags are not recoverable from the cached file because `BFieldInfo` never completed.
- The exact semantic definition of `PG_REVENUE_VALUE` is unavailable and the field should remain excluded until the Terminal supplies `BFieldInfo`/`FLDS` metadata.
- No underlying estimate-year mapping exists for `BEST_PE_RATIO`; it cannot substitute for a FY2026E–FY2028E consensus panel.

## Can the data support bank-versus-fintech comparisons in growth, profitability, balance sheets, asset quality, capital and valuation?

### Takeaway

The workbook supports a useful but narrow peer comparison: bank balance-sheet growth, Bloomberg-defined returns/asset quality, and point-in-time valuation versus within-company growth and valuation for listed platforms. It does not support transaction market share, a common revenue definition, fintech loan balances, bank net income, bank net interest income, or a clean consensus forecast comparison.

### Cited Findings

- Long-run growth that is defensible from end-period stocks: among the nine commercial-bank rows with 2010 data, median total-asset CAGR was 10.2% from 2010Q4 to 2025Q4. Postal Savings Bank starts in 2016 and CICC was excluded. Across the nine unique fintech/platform securities, median Q4 revenue CAGR was 12.8% from 2019Q4 to 2025Q4, ranging from negative for Ping An and Lexin to 65.7% for Futu. The fintech calculation is a company-growth statistic, not a sector share, and uses a shorter common window because of listing histories. — [Bank 1!G5:CK224; Fin!G5:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- 2025 descriptive peer medians, after excluding CICC and duplicate JD:

| Metric | 10 conventional banks | 9 unique fintech/platform names | Interpretation |
|---|---:|---:|---|
| Total-asset growth, 2025Q4 YoY | 8.5% | 7.7% | Within-company growth; do not aggregate absolute fintech assets across currencies |
| Gross-loan growth, 2025Q4 YoY | 7.1% | n.a. | Bank on-balance-sheet loans only |
| Customer-deposit growth, 2025Q4 YoY | 7.2% | n.a. | Bloomberg deposit definition |
| Calendar-2025 operating-field growth | `IS_OPER_INC` +0.4% | EBIT +5.9% (`n=8`) | Different economics; descriptive only |
| Calendar-2025 net-income growth | Not provided | +6.7% | Bank `NET_INCOME` absent |
| ROA at 2025Q4 | 0.65% | 5.86% | Bloomberg definitions; capital-light businesses structurally higher |
| Return on common equity at 2025Q4 | 9.68% | 14.78% | Not identical to issuer-reported weighted-average ROE |
| NIM at 2025Q4 | 1.36% | n.a. | Bloomberg T12 NIM |
| NPL ratio at 2025Q4 | 1.27% | n.a. | No fintech delinquency/NPL series |
| Price/book at 2025Q4 | 0.67x | 3.34x (`n=6`) | Point-in-time market multiple |
| Trailing P/E at 2025Q4 | 7.35x | 17.29x (`n=6`) | Coverage differs |
| Dividend yield at 2025Q4 | 4.20% | 3.48% | Trailing 12-month yield |

  Stock growth uses `2025Q4/2024Q4`. Flow growth uses four deduplicated calendar-quarter observations for each year only where all eight observations are numeric. These are medians, not weighted sector totals. — [Bank 1!G5:O224; Fin!G5:O154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- At 2026Q2/H1, bank median total assets grew 8.4% YoY, loans 5.7%, deposits 3.9%, and the `IS_OPER_INC` H1 sum grew 6.1%. Median T12 NIM was 1.38%, ROA 0.63%, common ROE 9.47% and NPL ratio 1.27%. The pattern is more asset growth than deposit or revenue growth, consistent with continued balance-sheet expansion under tight profitability. — [Bank 1!E5:J224](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- At 2026 H1, the nine-name fintech/platform sample had median revenue growth of 5.8% and median net-income change of -28.3%, but the median masks sharp divergence. Tencent’s revenue/net income rose about 10.1%/10.3%; East Money 53.2%/44.8%; Futu revenue rose 30.5%; Qfin revenue/net income fell 25.6%/63.5%; Lexin fell 2.9%/67.9%; and FinVolution fell 6.3%/42.6%. This supports the prior report’s distinction between strong capital-markets platforms and pressured loan facilitators. — [Fin!E5:J154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- 2025 fintech subgroups were already economically distinct: the East Money/Futu broker pair had median revenue growth of 53.3%, net-income growth of 67.0% and common ROE of 23.7%; the Tencent/Alibaba/JD/Ping An group had median revenue growth of 8.3% and net-income growth of -9.3%; the Qfin/Lexin/FinVolution facilitator group had median revenue growth of 3.9% and net-income growth of 6.7%, before deteriorating in H1 2026. — [Fin!G5:O154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- The workbook’s strongest valuation signal is the business-model premium, not a market-share claim: at 2025Q4 the mixed fintech sample’s median P/B was roughly five times the bank median (3.34x versus 0.67x) and trailing P/E more than twice it (17.29x versus 7.35x), accompanied by higher Bloomberg-calculated ROA/ROE. The gap reflects capital intensity, growth, accounting and sample composition; it is not proof of superior risk-adjusted returns. — [Bank 1!G13:G24 and corresponding 20-row blocks; Fin!G12:G19 and corresponding 15-row blocks](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- The bank loan field is unambiguous in economic category: `BS_GROSS_LOANS_COMPANY_BASIS` is a bank balance-sheet stock. No fintech row contains “loan,” “facilitated,” “originations,” “receivables,” “risk-bearing,” “capital-light” or “guarantee.” The workbook therefore cannot update the Qfin, FinVolution, Lexin or Lufax outstanding-balance analysis. — [Bank 1!C6 and every 20-row bank block; Fin!C5:C154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- MAU cannot support a user comparison. Only Tencent and Futu contain numeric `MONTHLY_ACTIVE_USERS`; Alibaba, JD, Ping An, East Money and all loan facilitators are blank. The retained values have no unit or product scope, so Tencent’s multi-product figure cannot be compared with Futu’s brokerage-app figure. — [Fin!C14:CK14; Fin!C104:CK104 and all other MAU rows](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)

### Inferences

- The Bloomberg panel reinforces the core report conclusion: banks continued to compound assets while their return profile remained modest, whereas listed capital-light models could produce higher returns and valuation multiples but with much greater earnings dispersion.
- “Fintech growth” is not a single factor. The 2025–H1 2026 transition separates transaction/information/broker platforms from credit facilitators; the latter’s earnings contracted even though the workbook provides no loan-volume decomposition.
- The higher fintech valuation and returns should be presented by subgroup. A single fintech median mixes a social/payment platform, ecommerce firms, an insurer, brokers and loan facilitators.

### Gaps

- Bank `NET_INCOME`, true net interest income, cost-to-income, PPOP, provision coverage, credit cost, Tier 1/CAR and LDR are absent.
- Fintech loans, originations, TPV, AUM/client assets, active borrowers/merchants, take rate, APR/funding cost, delinquency, capital-light/risk-bearing balances and partner funding are absent.
- No transaction-count or transaction-value data appear anywhere in the workbook, so it cannot change the market-share estimates in the prior report.
- Absolute bank-versus-fintech financial totals cannot be aggregated until every company’s reporting currency and scale are supplied.

## Which comparisons are invalid because of differing business models, currencies, units or fiscal periods?

### Takeaway

Several superficially convenient comparisons are invalid: fintech assets versus bank assets, fintech originations versus bank loans, bank `SALES_REV_TURN` versus platform revenue, bank operating profit versus platform EBIT, and raw MAU across Tencent and Futu. Ratios and within-company growth are safer, but only when their Bloomberg basis and observation-date lag are disclosed.

### Cited Findings

- Bank `SALES_REV_TURN` is not published bank operating revenue. For ICBC, the four 2025 observations total RMB1,513,651 million, while the company reported operating income of RMB801,395 million. By contrast, `IS_OPER_INC` observations total RMB419,661 million, exactly matching ICBC’s published operating profit. This validates `IS_OPER_INC` as a quarterly operating-profit flow for ICBC and demonstrates that `SALES_REV_TURN` should not be compared with Tencent/JD/Alibaba revenue as though the accounting bases were identical. — [Bank 1!G9:J10](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [ICBC 2025 financial highlights](https://www.icbc.com.cn/ICBCLtd/%E6%8A%95%E8%B5%84%E8%80%85%E5%85%B3%E7%B3%BB/%E6%8A%95%E8%B5%84%E4%BB%B7%E5%80%BC/%E6%88%91%E4%BB%AC%E7%9A%84%E6%88%90%E5%B0%B1/)
- Bank `IS_INT_INC` is gross interest income, not NII. The prior request asked for net interest income; the workbook does not contain it. ICBC separately reported 2025 NII of RMB635,126 million. — [Bank 1!C11](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [ICBC 2025 annual report](https://v.icbc.com.cn/userfiles/resources/icbcltd/download/2026/2025AnnualReport.pdf)
- Bloomberg-calculated profitability ratios do not always equal issuer-reported ratios. At 2025Q4, ICBC’s workbook values are T12 NIM 1.3564%, ROA 0.7206% and common ROE 9.8216%, versus company-reported NIM 1.28%, average-asset ROA 0.72% and weighted-average ROE 9.45%. The NPL ratio of 1.308% rounds to the reported 1.31%, showing that some metrics reconcile while denominator/timing conventions differ for others. — [Bank 1!G13:G16](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [ICBC 2025 annual report profitability table](https://v.icbc.com.cn/userfiles/Resources/ICBCLTD/download/2026/2025AnnualReport.pdf)
- `BS_CET1_BUFFR_PCT` is not CET1 capital adequacy. ICBC’s workbook value is 4.57% at 2025Q4, while the company-reported CET1 ratio is 13.57%. This field cannot answer the requested capital-ratio comparison. — [Bank 1!G18](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [ICBC 2025 annual report profitability/capital table](https://v.icbc.com.cn/userfiles/Resources/ICBCLTD/download/2026/2025AnnualReport.pdf)
- `BS_CUSTOMER_DEPOSITS` requires reconciliation. ICBC’s workbook value is RMB37,814,371 million at 2025Q4, versus published customer deposits of RMB37,311,778 million, a RMB502,593 million or 1.35% excess. Total assets and gross loans in the adjacent workbook cells do match the published RMB53,477,773 million and RMB30,506,114 million exactly. The prior report’s RMB37.31tn deposit figure should therefore remain; the Bloomberg figure should not overwrite it without a field-definition explanation. — [Bank 1!G5:G8](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [ICBC 2025 annual report deposit table](https://v.icbc.com.cn/userfiles/Resources/ICBCLTD/download/2026/2025AnnualReport.pdf)
- Currency and units are not stored. Mainland bank levels appear to be RMB millions after reconciliation with ICBC, but the fintech list combines HK and US listings and companies with differing reporting currencies. Ratios and within-company growth avoid most currency problems; aggregate asset, revenue, earnings and market-cap totals do not. — [Bank!D4:CK224; Fintech!D4:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Fiscal calendars and reporting lags differ. Alibaba does not share the same fiscal year-end as Tencent, JD or Chinese banks. The workbook gives calendar observation dates but no fiscal-period labels; “2025Q4” in the normalized panel means the value observed on 31 December 2025, not necessarily the issuer’s fiscal Q4. — [Fin!D4:CK34](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Business-model comparability is weak even within the fintech tab: Ping An is an insurer/financial conglomerate; Tencent and Alibaba are broad platforms; East Money and Futu are brokers; Qfin, Lexin and FinVolution are loan facilitators. Their asset intensity, revenue recognition and regulatory capital differ materially. — [Fin!A5:C154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- A facilitated or originated loan is a flow or off-balance-sheet enabled balance, while `BS_GROSS_LOANS_COMPANY_BASIS` is an on-balance-sheet bank stock. The workbook has no data that permit these categories to be added or compared as “loan market share.” — [Bank 1!C6; Fin!C5:C154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)

### Inferences

- The safest cross-sector comparison is a two-axis view: within-company growth and capital efficiency on one axis, and economic ownership of assets/liabilities/risk on the other. Absolute balance-sheet totals should stay sector-specific.
- Bloomberg-calculated ratios are valuable for consistent screening, while annual reports remain authoritative for issuer-reported NIM, ROE, capital and deposit definitions. Both can be shown, but not silently mixed.
- Observation-date quarterly histories should be labelled “as-of quarter-end” unless the fiscal-period mapping is added. Company-specific annual or interim analysis should use issuer-period fields or annual-report values.

### Gaps

- Bloomberg field metadata is needed to explain the ICBC deposit difference and the exact denominator/timing conventions for T12 NIM, common ROE, ROA and provisions.
- A common-currency override or explicit reporting-currency field is required before summing or ranking absolute fintech amounts.
- Fiscal period-end, fiscal quarter/year, preliminary/final and restatement flags are required for a clean panel.

## What new conclusions or corrections should be added to the prior report?

### Takeaway

The prior report’s market-structure conclusion remains intact. The Bloomberg workbook adds a credible listed-company valuation and profitability layer, but it also requires four corrections: fix the security lists, retain Q2/H1 2026 as the latest fundamental cutoff, label Bloomberg ratios separately from company-reported ratios, and do not treat the export as a source of fintech loan or transaction-share data.

### Cited Findings

- Add a peer-panel conclusion: from 2010Q4 to 2025Q4, nine long-history commercial banks compounded assets at a median 10.2% a year; at 2025Q4 those banks still traded at only 0.67x book and 7.35x trailing earnings with median common ROE of 9.68%. The mixed listed fintech sample traded at 3.34x book and 17.29x earnings where available, with median common ROE of 14.78%. This quantifies the report’s qualitative contrast between balance-sheet scale and capital-light returns. — [Bank 1!G5:CK224; Fin!G5:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Add a growth-quality conclusion: bank assets, loans and deposits grew about 8.5%, 7.1% and 7.2% at 2025Q4 YoY, while median operating-profit growth for calendar 2025 was only 0.4%. Balance-sheet expansion therefore continued to outpace profit growth. — [Bank 1!G5:O224](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Add a fintech-dispersion conclusion: brokers/investment platforms were the strongest 2025 subgroup, while H1 2026 loan-facilitator revenue and profit contracted sharply. This is consistent with the prior report’s argument that traffic is valuable only when funding, regulation and credit costs permit durable monetization. — [Fin!E5:O154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Correct the bank list: replace CICC `601995 CH` with the intended China CITIC Bank `601998 CH`, and add missing Industrial Bank `601166 CH`. Exclude CICC from every bank median in the current export. — [Bank 1!A165:A184](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [Shanghai Stock Exchange](https://www.sse.com.cn/assortment/stock/areatrade/area/detail.shtml?AREANAME=22)
- Correct the fintech list: delete the second JD `9618 HK` block and add Lufax `6623 HK` or `LU US`. — [Fin!A35:A79](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Keep the existing report’s ICBC customer-deposit figure of approximately RMB37.31tn. The Bloomberg `BS_CUSTOMER_DEPOSITS` value is 1.35% higher and is not definitionally reconciled. Assets and gross loans reconcile exactly, so the discrepancy is field-specific rather than a general currency/scale error. — [Bank 1!G5:G8](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [ICBC 2025 results](https://www.icbc.com.cn/ICBCLtd/%E6%8A%95%E8%B5%84%E8%80%85%E5%85%B3%E7%B3%BB/%E6%8A%95%E8%B5%84%E4%BB%B7%E5%80%BC/%E6%88%91%E4%BB%AC%E7%9A%84%E6%88%90%E5%B0%B1/)
- Do not replace issuer-reported NIM/ROE/CET1 values with the workbook’s T12/common-equity/buffer fields. For ICBC the differences are material and definition-driven. — [Bank 1!G13:G18](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [ICBC annual report](https://v.icbc.com.cn/userfiles/Resources/ICBCLTD/download/2026/2025AnnualReport.pdf)
- The existing report’s Q2-2026 outstanding balances for Qfin, FinVolution, Lexin and Lufax remain externally sourced and should remain so. The workbook contains no fintech loan balance or origination metric and omits Lufax entirely. — [Fin!C5:C154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [prior report](</Users/agatbe/Claude Project/Claude Vibecode (NiFi)/reports/China banks and fintech.md>)
- The existing payment-share analysis is unaffected because the workbook has no TPV, payment-count, clearing-rail or provider-share series. — [Fin!C5:C154; Bank 1!C5:C224](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>); [prior report](</Users/agatbe/Claude Project/Claude Vibecode (NiFi)/reports/China banks and fintech.md>)

### Inferences

- The best report addition is a compact “listed peer economics” section, clearly separated from the PBOC market-share section. The workbook can show profitability and valuation, not who owns transaction volume.
- The investment story becomes more precise: banks offer sustained asset compounding and discounted valuations; brokers/platforms offer higher returns and valuation premiums; loan facilitators show greater regulatory/funding sensitivity.
- The prior report’s public-source figures should remain authoritative where Bloomberg-calculated fields fail reconciliation. Bloomberg is useful as a standardized screening layer, not a universal replacement for issuer definitions.

### Gaps

- The report cannot add a complete consensus-forecast section from this export because only forward P/E is supplied and bank coverage is almost nonexistent.
- The report cannot add a user-share section from this export because the MAU field is sparse and definitionally inconsistent.
- The report cannot add a fintech credit-risk bridge from this export because facilitated/outstanding/risk-bearing loan fields are absent.

## What gaps remain after this Bloomberg export?

### Takeaway

The highest-value follow-up is a corrected, metadata-rich export rather than more rows of the same `BDH` history. Priority should go to exact fiscal-period actuals/estimates, bank capital and profitability definitions, fintech operating KPIs and loan-risk decomposition.

### Cited Findings

- Corrected bank universe needed: `601398 CH, 601939 CH, 601288 CH, 601988 CH, 601328 CH, 601658 CH, 600036 CH, 601166 CH, 600000 CH, 601998 CH, 600016 CH, 000001 CH`. The current workbook substitutes `601995 CH` for two missing banks. — [Bank 1!A5:A224](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Corrected fintech universe needed: one each of `700 HK, 9988 HK/BABA US, 9618 HK/JD US, 2318 HK, 6623 HK/LU US, 300059 CH, FUTU US, 3660 HK/QFIN US, LX US, FINV US`. The current workbook duplicates JD and omits Lufax. — [Fin!A5:A154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Metadata required for every field: Bloomberg description, unit, scale, currency, fiscal period end, fiscal year/quarter, actual/estimate, preliminary/final, reported/restated, consolidation basis, source document and refresh timestamp. None are retained in the current values grid. — [Bank 1!A1:CK224; Fin!A1:CK154](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Bank fields still needed: `NET_INCOME`, net interest income, cost-to-income, PPOP, NPL balance, credit cost, allowance/NPL coverage, actual CET1/Tier 1/total capital, LDR, estimate count and revisions. — [Bank 1!C5:C24](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Fintech fields still needed: segment revenue/profit, payment TPV, brokerage turnover, fund sales, AUM/client assets, active users/borrowers/merchants, quarterly originations, outstanding facilitated principal, on-balance-sheet receivables, guaranteed/risk-bearing balance, capital-light share, take rate, APR/funding cost and DPD/NPL. — [Fin!C5:C19](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- Consensus still needed: explicit FY2026E–FY2028E revenue, net income, EPS, balance-sheet and ratio estimates with analyst counts and revision dates. `BEST_PE_RATIO` alone is insufficient and is populated in only about 1.5% of bank-quarter cells. — [Bank 1!C23:CK223](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)
- User/usage analysis still needs company disclosures for mobile-banking MAU, active borrowers, active investors, active merchants, transaction TPV, fund sales and app-originated loans. The current MAU field is only 7.0% populated. — [Fin!C14:CK149](</Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx>)

### Inferences

- The next Bloomberg pull should use fiscal-period fundamentals rather than a blank-end-date, quarter-sampled observation history. Market multiples may remain point-in-time, but accounting data should carry explicit fiscal period and actual/estimate status.
- The user should refresh `BFieldInfo` or export `FLDS` metadata before another analysis round. Without it, repeated Bloomberg extracts can create apparent comparability while retaining definition mismatches.
- For fintech loan platforms, Bloomberg fundamentals alone are unlikely to supply all operating KPIs. Earnings releases and company operating-statistic fields remain necessary.

### Gaps

- Even a corrected listed-company export will not supply private Ant, WeBank or MYbank series, provider-level Alipay/WeChat transaction share, or PBOC transaction-layer market-share definitions. Those remain separate primary-source research tasks.
- Bloomberg availability for facilitated-loan KPIs may remain sparse. If no API field exists, the minimum manual table should be `period end | outstanding facilitated balance | on-balance-sheet receivables | risk-bearing/guaranteed balance | capital-light share | quarterly originations | delinquency definition`.
