# Bloomberg PDF Audit - `1.pdf`, `2.pdf`, and `3.pdf`

## What the attachments contain

### Takeaway

The 45 supplied pages are three separately printed copies of one 15-page Bloomberg Intelligence report, **“Ant Group Private Company Research.”** They are not three company exports, a Bloomberg `FA`/`FLDS` field dump, or a bank-versus-fintech data panel. Their substantive value is a current BI thematic outlook on Ant, Chinese listed fintech earnings and valuations, plus one on-balance-sheet loan series for Chongqing Ant Consumer Finance. They do not provide conventional-bank financials, provider-level transaction share, Alipay TPV/AUM, or facilitated-loan KPIs.

### Cited Findings

#### Document identity, duplication and status

- `1.pdf`, `2.pdf`, and `3.pdf` each contain 15 A4 pages with the same Bloomberg Intelligence title, headings, charts, tables, analyst bylines and page order. Text normalized for the file number and footer timestamp has the same SHA-256 hash in all three files; rendered pixels above the footer are identical page by page. The only substantive file-level difference is the Bloomberg print time: 03:35:04, 03:36:37 and 03:37:49 on 14 October 2026. — [1.pdf, p.1](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1); [2.pdf, p.1](file:///Users/agatbe/Downloads/chinafintech/2.pdf#page=1); [3.pdf, p.1](file:///Users/agatbe/Downloads/chinafintech/3.pdf#page=1)
- The report is a Bloomberg Intelligence editorial/research compilation with sections headed “Outlook,” “Industry Themes,” “Chart Book,” “Peers” and “Key Topics.” It is not an API field export: there are no Bloomberg field mnemonics, estimate-contributor counts, reporting-currency metadata, restatement flags or raw historical statement rows. — [1.pdf, pp.1-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1)
- The main outlook is dated 4 September 2026, while embedded research items are dated 5 December 2025, 7-8 July 2026, 25 August 2026 and 13 October 2026. “Current” valuation and YTD share-price observations therefore have different observation dates and should not be treated as of the 14 October print time unless the chart explicitly says so. — [1.pdf, pp.1, 4-5, 8-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1)

#### Complete page-by-page content ledger

Because the three PDFs are duplicates, the page descriptions below apply to the same page number in all three files.

| Page | Material heading and complete relevant content | Data/status assessment |
|---:|---|---|
| 1 | **Ant Group Private Company Research / Outlook.** BI’s thesis is that AI, health care, payments, wealth management and agentic commerce can support long-term monetization while spending constrains near-term profit. BI gives a 2026 Ant net-profit range of RMB16-20bn and an Ant International value range of US$8-14bn. The page also says Ant International connects >150m merchants and >2bn user accounts through 300+ payment methods and that Chongqing Ant Consumer Finance has about RMB300bn of loans. — [1.pdf, p.1](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1) | BI outlook/estimate, not Bloomberg consensus. Ant International figures are global network reach; consumer-finance loans are on-balance-sheet loans of the licensed subsidiary, not Ant-facilitated credit. |
| 2 | **Industry Themes: Pressure Persists Through 2026.** Narrative on tighter lending-rate rules, weak credit demand and the Mainland cross-border brokerage restriction. A group chart compares 2024-25 actual and 2026E-27E revenue/net income for online lenders, online brokers, insurtech and a mixed “other fintech” basket. The basket definitions are: lenders = Lufax, Qifu, FinVolution, Lexin; brokers = Futu, Tiger; insurtech = ZhongAn, Waterdrop, Huize; others = Yeahka, Yixin, Beijing Fourth Paradigm, JF Wealth, Linklogis, Lianlian DigiTech, Youzan and OSL Group. It says the lender group’s 2026 earnings are expected to fall by more than 20%, Futu’s Mainland-related business is about one fifth of revenue, the present all-in rate threshold is 24%, and 12% by end-2027 is a possible downside scenario. — [1.pdf, p.2](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=2) | The grouped bar chart has no bar labels, so exact levels should not be reverse-engineered. The possible 12% cap is BI scenario language, not a documented enacted rule. |
| 3 | Continuation of online-lender theme: BI says banks are favoring hyperscalers such as Ant, JD.com and Douyin as facilitation partners; mandatory bank redirection increases onboarding friction; Lufax and Qifu provisions rose 31% and 47% in 2025 and Lexin’s rose 45% in 1Q. The page charts 2024-25 actual and 2026E-27E net income for Lufax, Qifu, FinVolution and Lexin, and illustrates customer segmentation by annual loan rate: bank personal/consumer loans 3-10%, credit cards 10-16%, and the four online lenders 16-24%. The note says loans above 24% are not allowed under China’s loan-facilitation rules. It also reports Futu added 225,000 new clients in 1Q26, equal to 28% of its full-year target; 75% of Tiger funded accounts came from Hong Kong and Singapore; and the brokers’ 2026 earnings may fall about 20% amid RMB2.3bn of penalties and loss of Mainland-client business. — [1.pdf, p.3](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=3) | The earnings bars have no data labels. The rate bands are schematic customer segmentation, not observed weighted APRs for each company. Futu/Tiger metrics are mostly offshore and cannot proxy Mainland fintech adoption. |
| 4 | **Chinese Non-Lending Fintechs’ Business Drivers.** Net-income bars for Futu, Tiger, Yeahka and ZhongAn plus qualitative drivers. **Listed Chinese Fintechs’ Share-Price Changes** gives YTD changes as of 3 July 2026: FinVolution -7.6%, Qifu -19.8%, Golden Dragon China Index -21.5%, Waterdrop -36.8%, Lexin -41.6%, Futu -42.1%, Lufax -45.3%, Tiger -52.1%, Huize -58.9%; Hang Seng TECH -18.4%, Linklogis -21.0%, Pax -27.1%, OSL -31.9%, JF SmartInvest -36.0%, Lianlian -36.2%, Yeahka -37.5%, Beijing Fourth Paradigm -39.0%, ZhongAn -40.5%, Youzan -40.6%, Yixin -43.4%. — [1.pdf, p.4](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=4) | Market-price snapshot, not operating performance; stale relative to the October print date. Net-income bars have no labels. |
| 5 | **Listed Chinese Fintech Valuations.** Blended forward P/E table with “current,” 12-month low and two-year average for five ADRs and six HK-listed names. The page begins a “dual-speed era” theme: Ant’s R&D/AI spending versus steadier Tencent FinTech & Business Services growth. It says Ant R&D rose 44% to RMB35bn in 2025 and contributed to a 60% profit drop; it also says Tencent’s segment is expected to post double-digit sales growth in 2026-27. — [1.pdf, p.5](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5) | P/E is an equity-market snapshot tied to the 7 July research date. Tencent’s segment includes more than payments/fintech. Ant R&D is reported; the causal contribution and earnings forecast are BI analysis. |
| 6 | **Ant’s Quarterly Profit, Tencent’s Fintech Revenue.** Ant profit is reconstructed from Alibaba’s share of profit; Tencent FinTech & Business Services revenue is shown for 2019-25 actual and 2026E-27E. A second chart gives exact consensus growth for a four-lender basket, two-broker basket and Golden Dragon China Index. BI says 2026 profit could contract 23-52% at Qifu, FinVolution and Lexin; Lufax could turn from loss; combined Futu/Tiger profit could fall 22%, followed by recovery in 2027. — [1.pdf, p.6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=6) | Ant totals are BI calculations, not direct Ant financial statements. Tencent 2026E-27E are forecasts. Basket methodology/weighting and estimate count are not disclosed. |
| 7 | **Hong Kong-Listed Fintechs Diverge in Earnings Path.** A table gives FY25 actual and FY26E-27E revenue/profit growth or profit/loss direction for Yeahka, China Youzan, Lianlian DigiTech, Pax, ZhongAn, Yixin, Linklogis, Beijing Fourth Paradigm, JF SmartInvest, OSL and Huobi Tech. It then discusses AI and offshore expansion and cites iResearch’s estimate that Chinese financial-sector AI investment could grow to about RMB58bn in 2030. — [1.pdf, p.7](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=7) | Mixed business models; not an apples-to-apples payments/lending panel. FY26E/FY27E are forecasts. |
| 8 | **China Fintechs’ AI Spending / Chart Book.** iResearch forecast of financial-institution AI investment from RMB14.4bn in 2025 to RMB57.92bn in 2030, with use categories. Ant company section discusses AI products and international reach; an exact quarterly Ant-profit chart runs from March 2021 through June 2025. — [1.pdf, p.8](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=8) | AI-spending forecast is not a fintech revenue or transaction series. Ant profit is BI reconstruction. |
| 9 | **R&D Investment to Fuel AI Development.** Charts Ant R&D, patents and joint laboratories and lists seven investments in AI/chips during April 2024-September 2025. It begins peer comparison and possible Ant International spinoff discussion. — [1.pdf, p.9](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=9) | Useful strategy context; no customer, transaction, AUM or loan-facilitation metric. R&D chart bars have no exact labels. |
| 10 | Completes peer discussion and charts quarterly Tencent segment gross profit versus Ant net profit through 1Q25. Begins **AI Monetization Clouds Outlook**, restating the RMB16-20bn 2026 Ant-profit range and US$8-14bn Ant International valuation. It says Alipay AI Pay and health app AQ each have more than 100m users, and Ah Bao connects to more than 10,000 services. — [1.pdf, p.10](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=10) | The chart is not labeled with exact values. Product-user figures are not payment-user counts and may overlap. |
| 11 | **Ant’s Quarterly Profit Contribution to Alibaba** gives exact quarterly Alibaba share-of-profit and BI-implied Ant totals through March 2026. **Ant Group Estimated Revenue, Profit (2023-25)** models “maximum” revenue of RMB212bn/235bn/350bn, R&D of RMB21bn/23bn/35bn, other costs RMB161bn/163bn/296bn, pretax profit RMB30bn/48bn/19bn, tax RMB6bn/10bn/4bn and net profit RMB24bn/38bn/15bn. The footnotes say revenue is an upper-bound estimate based on R&D being at least 10% of revenue, taxes are BI-estimated, and net profit is based on Alibaba disclosure. BI estimates 2026 net profit at RMB16-20bn and margin at 4-5%. — [1.pdf, p.11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=11) | Only R&D is directly sourced from Ant sustainability reporting; revenue, costs, tax and totals are BI modeling/reconstruction. Do not label the RMB350bn as reported 2025 revenue. |
| 12 | **Ant Group’s AI Products vs. China’s Top AI Agents.** Product table says Zhixiaobao, AQ/Ant A-Fu and Alipay AI Pay each have domestic MAU of 100m+, Maxiaocai 10m-50m+, while other products have “moderate,” backend-only or unavailable user metrics. **Comparables Value Ant International at US$8-US$14bn** says its 2025 revenue was US$3.7bn, that Asian payment peers trade at 2.2-3.7x trailing sales (3.2x average across 27 firms), and that Alipay+ links >2bn user accounts through 50 partners/300+ methods across >220 markets. — [1.pdf, p.12](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=12) | Product MAUs measure AI apps/features, not Alipay payment usage. Ant International reach is global and counts accounts across partner networks, not unique Mainland customers. Revenue is attributed to *The Information*, not a filed Ant statement. |
| 13 | **Ant International’s Valuation Calculated by BI.** US$3.75bn of 2025 revenue is multiplied by 2.2x, 3.2x, 3.5x and 3.7x to produce US$8.2bn, US$12.0bn, US$12.9bn and US$13.9bn values. **Ant Valuation Metrics, Segment Framework** shows peer forward P/E of 3.4x/9.6x/17.5x/21.4x and forward P/S of 1.1x/3.8x/2.8x/1.0x across four peer/index baskets. Text says parent P/E comparisons imply US$9-57bn and P/S US$54-180bn, versus a 2023 repurchase value of about US$79bn, demonstrating that comparables are too dispersed for a reliable parent valuation. It begins the Huabei/Jiebei consumer-finance subsection. — [1.pdf, p.13](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=13) | Valuation scenario, not market consensus. Peer baskets mix banks, payments, technology companies and an equity index. |
| 14 | **Loan Balance / Profit and Loss.** Chongqing Ant Consumer Finance gross loans rise from about RMB90bn in 2022 to RMB303bn in 2025. Text states 2025 profit was flat at RMB3.1bn despite a RMB6.4bn revenue increase; credit costs rose 56% to RMB15.9bn and were close to net interest income of RMB18.7bn. Ant owns 50% and consolidates the unit; Ant owns 30% of MYbank. The page repeats Ant International’s global reach, adds a US$1.2bn July-2026 Series A, and says Alipay and WeChat Pay account for “most market volume” without a number or denominator. — [1.pdf, p.14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=14) | Gross loan is a stock on the licensed subsidiary’s balance sheet. It is not the Ant platform’s facilitated balance, not originations and not a market share. “Most market volume” is qualitative and does not distinguish value from count. |
| 15 | Analyst contact page only. — [1.pdf, p.15](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=15) | No research evidence. |

#### Exact tables and labeled observations worth retaining

**Blended forward P/E, article dated 7 July 2026 (x):**

| Company | Current | 12-month low | 2-year average |
|---|---:|---:|---:|
| LexinFintech | 2.2 | 1.4 | 3.1 |
| FinVolution | 3.6 | 3.0 | 4.4 |
| Qifu Technology | 1.8 | 1.3 | 2.3 |
| Futu | 9.2 | 6.9 | 14.8 |
| Tiger Brokers | 7.3 | 4.5 | 13.0 |
| Yixin | 4.9 | 4.1 | 8.1 |
| Pax Global | 4.3 | 3.9 | 5.5 |
| Yeahka | 8.9 | 8.5 | 12.9 |
| ZhongAn | 9.5 | 8.8 | 18.7 |
| JF Wealth | 10.6 | 8.4 | 19.0 |
| Youzan | 10.8 | 10.0 | 38.9 |

Source: [1.pdf, p.5](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5).

**Exact 2026E/2027E basket growth (%):**

| Basket | Revenue growth 2026E | Revenue growth 2027E | Net-income growth 2026E | Net-income growth 2027E |
|---|---:|---:|---:|---:|
| Four lenders: Lufax, Qifu, FinVolution, Lexin | -8.7 | 3.4 | -21.1 | 34.2 |
| Two brokers: Futu, Tiger | 0.6 | 10.6 | -20.7 | 28.2 |
| Golden Dragon China Index | 13.5 | 9.5 | 8.5 | 30.9 |

Source: [1.pdf, p.6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=6). The chart is labeled “consensus,” but contributor count, estimate date range, weighting and index membership are not disclosed.

**Tencent FinTech & Business Services revenue (RMBbn):** 2019 101; 2020 128; 2021 172; 2022 177; 2023 204; 2024 212; 2025 229; 2026E 252; 2027E 275. — [1.pdf, p.6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=6)

**BI-implied Ant net profit by quarter (RMBbn):** Dec-2022 9.6; Mar-2023 13.2; Jun-2023 2.6; Sep-2023 0.2; Dec-2023 7.8; Mar-2024 11.9; Jun-2024 7.5; Sep-2024 13.6; Dec-2024 5.3; Mar-2025 4.7; Jun-2025 8.3; Sep-2025 1.2; Dec-2025 1.1; Mar-2026 4.7. The corresponding Alibaba-recognized shares are 3.2, 4.4, 0.8, 0.1, 2.6, 3.9, 2.5, 4.5, 1.8, 1.5, 2.7, 0.4, 0.4 and 1.6. — [1.pdf, pp.6, 11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=6)

**HK-listed fintech revenue/profit growth (% unless a loss-transition label appears):**

| Company | FY25 revenue | FY26E revenue | FY27E revenue | FY25 profit | FY26E profit | FY27E profit |
|---|---:|---:|---:|---:|---:|---:|
| Yeahka | 7.2 | 7.0 | 6.8 | 11.9 | 63.2 | 35.9 |
| China Youzan | 3.1 | 13.6 | 6.9 | 142.3 | 2.4 | 10.0 |
| Lianlian DigiTech | 31.9 | 24.5 | 25.7 | Loss to Profit | Profit to Loss | Loss to Profit |
| Pax Global | -3.0 | - | - | 5.5 | - | - |
| ZhongAn | 6.2 | 0.4 | 8.4 | 82.5 | 20.5 | 12.1 |
| Yixin | 16.9 | 15.4 | 13.5 | 32.8 | 10.9 | 20.7 |
| Linklogis | -4.7 | 30.2 | 22.9 | Loss to Narrow | Loss to Narrow | Loss to Profit |
| Beijing Fourth Paradigm | 35.6 | 40.1 | 35.8 | Loss to Profit | 892.9 | 361.9 |
| JF SmartInvest | 48.7 | 3.6 | 17.0 | 238.5 | 9.8 | 20.4 |
| OSL Group | 30.3 | 60.1 | 51.7 | Profit to Loss | Loss to Narrow | Loss to Profit |
| Huobi Tech | -43.4 | - | - | Loss to Narrow | - | - |

Source: [1.pdf, p.7](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=7). FY25 is historical; FY26E/FY27E are forecast. These companies span payments, insurance, auto finance, crypto, supply-chain finance and AI/data, so group comparisons need business-model controls.

### Inferences

- The user likely printed the same Bloomberg Intelligence page three times rather than exporting three different requested datasets. That explains why no conventional-bank panel or company-by-company operating KPI table arrived.
- Bloomberg Intelligence is being used here as a secondary analytical source. “Consensus,” “BI calculation” and “BI estimate” are different evidence classes and must remain separate in the final report.
- The attachments are most useful as an October-2026 qualitative/cycle overlay and valuation appendix, not as the core 2010-2026 empirical dataset.

### Gaps

- No terminal function name is printed. The layout is consistent with a Bloomberg Intelligence company-research page/export, but the exact launch command cannot be proven from the PDFs alone.
- The documents do not identify the estimate-contributor count, consensus cut-off time, basket weighting, FX translation method or whether forecast rows are median or mean.
- Several bar charts have axes but no data labels. Values should be described directionally or obtained from the underlying Bloomberg worksheet, not digitized from bar height.

## New evidence for the Mainland bank-versus-fintech analysis

### Takeaway

The most decision-useful new evidence is (1) an on-balance-sheet Ant consumer-finance loan and credit-cost series, (2) a reconstructed 2023-26 Ant earnings trajectory, (3) Tencent segment forecasts, (4) listed-fintech consensus revisions/valuations, and (5) global Ant International scale and valuation. The files add almost nothing to transaction-share history, Mainland payment-user history, TPV, AUM, facilitated balances, originations or risk-bearing splits.

### Cited Findings

#### 1. Credit: one valid loan-balance series, but no platform facilitation series

- Chongqing Ant Consumer Finance’s gross loans rose from roughly RMB90bn in 2022 to RMB303bn in 2025; the text describes the balance as having more than tripled. This is the Huabei/Jiebei licensed consumer-finance entity’s **on-balance-sheet gross loan stock**. — [1.pdf, pp.13-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=13)
- In 2025, that entity recorded RMB18.7bn net interest income, RMB15.9bn credit costs and RMB3.1bn net profit. Net profit was flat despite a RMB6.4bn revenue increase because credit costs rose 56%. Ant owns 50% and consolidates the entity. — [1.pdf, pp.13-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=13)
- The report explicitly warns that the subsidiary does not provide a complete read-through to Ant’s broader credit business, which increasingly earns credit-technology and loan-facilitation revenue. MYbank, of which Ant owns 30%, is separately noted and also does not solve the broader-platform disclosure gap. — [1.pdf, p.14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=14)
- The existing report’s June-2020 RMB2.154tn Ant enabled-credit balance is therefore not contradicted. It is a platform-enabled balance largely funded by partner financial institutions, while the Bloomberg RMB303bn is the licensed subsidiary’s funded gross-loan stock at end-2025. The two numbers require separate rows and labels. — [1.pdf, p.14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=14); [existing report, lines 14-19](file:///Users/agatbe/Claude%20Project/Claude%20Vibecode%20%28NiFi%29/reports/China%20banks%20and%20fintech.md#L14)

#### 2. Ant earnings: informative reconstruction, not audited private-company financials

- BI reconstructs Ant net profit at RMB24bn in 2023, RMB38bn in 2024 and RMB15bn in 2025 from Alibaba’s equity-accounting disclosure. The 2025 decline is about 60%, coinciding with reported Ant R&D rising to RMB35bn. — [1.pdf, pp.5, 11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5)
- The quarterly BI-implied series sums closely to those annual values: RMB23.8bn in 2023, RMB38.3bn in 2024 and RMB15.3bn in 2025; March-2026 was RMB4.7bn. This adds a credible direction-of-travel indicator to the current report, which otherwise stops at Ant’s 2019 disclosed financials. — [1.pdf, pp.6, 11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=6)
- BI’s RMB212bn/235bn/350bn “revenue estimates” for 2023-25 are explicitly **maximum revenue levels** derived from the assumption that R&D is at least 10% of revenue. They are not reported Ant revenue. The same table’s other expenses, pretax profit and tax are modeled. — [1.pdf, p.11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=11)
- BI estimates RMB16-20bn 2026 net profit and a 4-5% margin. This is a BI scenario/range, not Bloomberg consensus, and it should be segregated from actuals. — [1.pdf, pp.1, 10-11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1)

#### 3. Tencent and listed-fintech forecast cycle

- Tencent FinTech & Business Services revenue rises from RMB101bn in 2019 to RMB229bn in 2025, with BI-chart forecasts of RMB252bn in 2026E and RMB275bn in 2027E. The existing report already has the 2019-25 actual endpoints; the new information is the 2026E-27E trajectory. — [1.pdf, p.6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=6)
- The four-lender basket is forecast to contract 8.7% in revenue and 21.1% in net income in 2026E, then grow 3.4% and 34.2% in 2027E. The two-broker basket has 0.6% revenue growth and a 20.7% net-income decline in 2026E, then 10.6% and 28.2% growth in 2027E. — [1.pdf, p.6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=6)
- The lender downturn is tied to rate/fee constraints, weaker household credit demand, rising bank funding costs and provisioning. BI reports 2025 provision growth of 31% at Lufax and 47% at Qifu, with Lexin up 45% in 1Q26. — [1.pdf, pp.2-3](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=2)
- Valuations reflect the weak cycle: on the 7 July 2026 BI snapshot Qifu traded at 1.8x blended forward P/E, Lexin 2.2x and FinVolution 3.6x, all below their two-year averages of 2.3x, 3.1x and 4.4x. Futu at 9.2x and Tiger at 7.3x were also below two-year averages of 14.8x and 13.0x. — [1.pdf, p.5](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5)

#### 4. Ant International: useful but outside the Mainland denominator

- Ant International’s business lines are Alipay+, merchant acquirer Antom, SME service WorldFirst and embedded-finance unit Bettr. BI says it connects >150m merchants and >2bn user accounts across 300+ payment methods; a companion page specifies 50 partners and >220 markets. — [1.pdf, pp.1, 12, 14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1)
- BI/The Information uses US$3.75bn of 2025 revenue and 2.2-3.7x trailing sales comparables to infer US$8.2-13.9bn equity value; the simple three-basket average is US$12.0bn. A July-2026 Series A raised US$1.2bn. — [1.pdf, pp.12-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=12)
- These figures demonstrate international network reach and merchant-facing monetization but cannot be inserted into Mainland payment share, Mainland user penetration or China TPV tables. “User accounts” may be duplicated across wallets/partners and is not a unique active-user count. — [1.pdf, pp.12, 14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=12)

#### 5. Customer-use evidence

- The files reinforce a transaction-to-cross-sell model: payments lead into credit, wealth management, health and AI-agent commerce. However, the report supplies no Alipay TPV, wealth AUM, fund-sales volume or China payment MAU after 2020. — [1.pdf, pp.1, 10-12](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1)
- AI product reach is distinct from core payment usage: Zhixiaobao, AQ/Ant A-Fu and Alipay AI Pay are each stated at 100m+ domestic MAU; Maxiaocai is 10m-50m+; Ah Bao has no published MAU. These are product-level reach indicators, not unique Alipay customers and not transaction share. — [1.pdf, p.12](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=12)
- Futu/Tiger evidence confirms the existing report’s warning that digital brokers are not clean Mainland-user proxies: 75% of Tiger funded accounts cited on the page were from Hong Kong and Singapore, while Futu is responding to a Mainland cross-border brokerage exit. — [1.pdf, p.3](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=3)

#### Requested-metric coverage matrix

| Requested metric | Present? | Exact usable evidence | Correct interpretation |
|---|---|---|---|
| Conventional-bank financials/consensus | **No** | None | The package cannot complete the requested bank panel. |
| Bank-vs-fintech transaction share | **No** | Only qualitative statement that Alipay/WeChat Pay account for “most market volume” | No percentage, denominator, date series or value/count split; do not use as a share statistic. |
| Alipay/WeChat provider share | **No** | Same qualitative statement | Existing external 90-95% estimates remain stronger. |
| Users | **Partial** | Ant International global accounts/merchants; Ant AI product MAUs; Futu/Tiger client snippets | Global accounts and AI MAUs are not Mainland payment users. |
| TPV | **No** | None | No addition to the current RMB118tn Alipay 2020 TPV datapoint. |
| AUM/wealth holdings | **No** | Wealth management appears only in narrative | No addition to Ant/Tiantian/CMB distribution tables. |
| Loan balance | **Yes, one entity** | Chongqing Ant Consumer Finance gross loans RMB303bn, 2025 | On-balance-sheet funded stock of a licensed consumer-finance company. |
| Facilitated/enabled balance | **No** | None | Do not substitute the RMB303bn gross loan. |
| Originations | **No** | None | No flow metric. |
| Risk-bearing/capital-light share | **No** | None | No funding/risk split. |
| Revenue/profit | **Partial** | Tencent segment actual/forecast; BI-implied Ant profit; BI maximum-revenue model; mixed listed-fintech growth | Keep actual, BI calculation, consensus and scenario in separate columns. |
| Valuation | **Yes** | Listed-fintech blended forward P/E; Ant International P/S scenario; broad Ant comparable ranges | Observation-date and methodology caveats required. |

### Inferences

- The Ant consumer-finance figures strengthen the report’s core “co-opetition” thesis: platform-branded credit increasingly sits in a separately capitalized licensed entity, while broader platform economics depend on technology/facilitation income.
- The 2026 lender earnings contraction and 2027 rebound forecast make bank bargaining power visible in financial results. Lower traffic or originations alone are not the only issue; bank partner selection, funding costs and credit provisions determine platform earnings.
- Ant’s sharp 2025 profit decline while R&D rose suggests platform economics are shifting toward an investment phase, whereas Tencent’s more diversified segment shows steadier revenue growth. This is a forecast-cycle comparison, not proof that one payment franchise gained transaction share.
- Very low forward P/E can reflect cyclical/regulatory impairment rather than statistical cheapness. For lenders, the valuation denominator is particularly fragile when fee caps and funding-partner terms are changing.

### Gaps

- Bloomberg still has not supplied the requested bank annual/semiannual panel, bank mobile-user/wealth KPIs, or FY2026E-FY2028E bank consensus.
- No attachment provides Alipay/WeChat TPV, unique active payment users, provider market share by value/count, Ant InvestmentTech AUM, fund sales, facilitated credit balance, loan originations or risk-bearing split.
- No raw consensus metadata are supplied for the fintech forecasts, so the numbers are unsuitable for estimate-dispersion or revision analysis.

## Reconciliation, methodological traps and exact report changes

### Takeaway

The final report should add a short Bloomberg Intelligence update and a boxed Ant credit case study, not rebuild the transaction-share framework around these PDFs. The public-source market-share and banking-system evidence remains the core. Any new Bloomberg numbers must be tagged as company-reported, BI-calculated, BI-estimated or consensus, with geography and business perimeter preserved.

### Cited Findings

#### Methodological traps and inconsistencies

- **Duplicate-file trap:** Treating the three PDFs as three independent sources would falsely multiply the evidence. They are the same report printed minutes apart. — [1.pdf, p.1](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1); [2.pdf, p.1](file:///Users/agatbe/Downloads/chinafintech/2.pdf#page=1); [3.pdf, p.1](file:///Users/agatbe/Downloads/chinafintech/3.pdf#page=1)
- **Stock/flow/perimeter trap:** RMB303bn is Chongqing Ant Consumer Finance gross loans at end-2025. It is a stock, on balance sheet, and subsidiary-specific. It is not loan originations, the Huabei/Jiebei platform’s enabled balance, Ant Group total credit reach, or a bank-versus-fintech market share. — [1.pdf, pp.13-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=13)
- **Reported-versus-modeled trap:** The RMB350bn “2025 Ant revenue” is a BI upper-bound model inferred from R&D, not disclosed revenue. Net profit is reconstructed from Alibaba; 2026 profit is a BI range. These cannot sit in one unqualified historical-actual column. — [1.pdf, p.11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=11)
- **Segment trap:** Tencent “FinTech & Business Services” includes cloud/business services. The RMB229bn 2025 actual and RMB252bn/RMB275bn forecasts are not WeChat Pay revenue or TPV. — [1.pdf, pp.5-6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5)
- **Geography/user trap:** Ant International’s 2bn user accounts and 150m merchants are global network endpoints, not Mainland unique active users. Futu/Tiger client growth is increasingly Hong Kong/Singapore-led. — [1.pdf, pp.3, 12, 14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=3)
- **Consensus trap:** Some pages say “consensus,” other numbers are explicitly “BI calculation” or “BI estimate.” The report does not disclose estimate count or aggregation. Labeling the RMB16-20bn Ant forecast “Bloomberg consensus” would be incorrect. — [1.pdf, pp.1, 6, 11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=1)
- **Market-share trap:** “Alipay and WeChat Pay account for most market volume” lacks percentage, period and denominator and does not specify count versus value. It cannot replace the current report’s layered PBOC/third-party share framework. — [1.pdf, p.14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=14)
- **Valuation-date trap:** YTD price performance is explicitly as of 3 July 2026 and the forward-P/E table sits in research dated 7 July 2026, despite the PDFs being printed in October. Do not call these current October valuations. — [1.pdf, pp.4-5](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=4)
- **Scenario-versus-rule trap:** The current 24% all-in threshold is described as binding, but a possible move to 12% by end-2027 is BI’s forward risk scenario. It should not be inserted into the regulation timeline as enacted policy. — [1.pdf, pp.2-3](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=2)

#### Exact additions to make

1. **Add to the “Representative institutions” table after Ant/Alipay:**

   > **Chongqing Ant Consumer Finance (Huabei/Jiebei licensed entity):** end-2025 gross loans RMB303bn; net interest income RMB18.7bn; credit costs RMB15.9bn; net profit RMB3.1bn. Loans more than tripled from roughly RMB90bn in 2022, but 2025 profit was flat because credit costs rose 56%. Ant owns 50% and consolidates the unit. This is a funded subsidiary loan book, not Ant’s wider facilitated-credit balance. — [1.pdf, pp.13-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=13)

2. **Extend the Ant row, while keeping the current public/prospectus history:**

   > Bloomberg Intelligence, using Alibaba equity-accounting disclosures, estimates Ant net profit at about RMB24bn in 2023, RMB38bn in 2024 and RMB15bn in 2025; it forecasts RMB16-20bn for 2026 with a 4-5% margin. These are BI calculations/estimates, not Ant-audited results. Ant reported R&D of RMB35bn in 2025. — [1.pdf, pp.5, 11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5)

3. **Extend the Tencent row with forecasts only in an estimate-labelled sentence:**

   > BI’s chart puts Tencent FinTech & Business Services revenue at RMB252bn in 2026E and RMB275bn in 2027E, after RMB229bn in 2025. The segment includes cloud/business services and is not a pure WeChat Pay measure. — [1.pdf, p.6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=6)

4. **Add a short listed-fintech cycle/valuation subsection to “Investment returns”:**

   > July-2026 consensus in BI showed the four-lender basket’s revenue/net income falling 8.7%/21.1% in 2026E, versus 0.6%/-20.7% for Futu and Tiger, with both groups forecast to rebound in 2027E. Qifu, Lexin and FinVolution traded at 1.8x, 2.2x and 3.6x blended forward P/E on the 7 July snapshot, below two-year averages. The low multiples reflect regulatory/funding/credit-cost risk and should not be read as evidence of volume-share loss alone. — [1.pdf, pp.5-6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5)

5. **Add an Ant International box outside the Mainland market-share table:**

   > Ant International’s global network links more than 2bn user accounts and 150m merchants across 300+ payment methods, but these are global partner-network accounts rather than Mainland unique users. BI values the unit at US$8.2-13.9bn using US$3.75bn of 2025 revenue and 2.2-3.7x payment-peer sales multiples. — [1.pdf, pp.12-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=12)

6. **Add a source-status legend wherever Bloomberg data are incorporated:** `Reported` = company filing/sustainability disclosure; `BI calculation` = derived from Alibaba or chart arithmetic; `Consensus` = group forecast shown in BI; `BI estimate/scenario` = analyst model or range. The PDF itself demonstrates all four categories. — [1.pdf, pp.5-7, 11-14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5)

#### Replacements and caveats

- **Do not replace** the existing layered transaction-share estimates, user history, Alipay 2020 TPV, Ant InvestmentTech AUM or Q2-2026 listed-lender operating KPIs. The PDFs contain no superior series for those topics.
- **Do not add** RMB350bn as 2025 Ant revenue. If it appears at all, label it “BI-estimated maximum revenue capacity,” with the R&D-based methodology footnote. — [1.pdf, p.11](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=11)
- **Do not add** Ant International’s 2bn accounts to Mainland users or use them to calculate payment penetration. — [1.pdf, p.12](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=12)
- **Do not call** the Ant consumer-finance RMB303bn balance “loan facilitated,” “originations” or “Ant Group total loans.” Use “gross loans, licensed consumer-finance subsidiary.” — [1.pdf, p.14](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=14)
- **Do not treat** the Tencent segment as fintech-only, and do not compare its revenue directly with bank net interest income without noting the cloud/business-services scope. — [1.pdf, pp.5-6](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=5)
- **Do not present** the possible 12% rate cap as regulation already adopted. Use it only as a downside scenario cited to BI. — [1.pdf, p.2](file:///Users/agatbe/Downloads/chinafintech/1.pdf#page=2)

### Inferences

- These additions sharpen the report’s investment conclusion without changing its market-structure conclusion: transaction frequency remains fintech-led, while the balance sheet, funding and credit-cost burden sit increasingly inside licensed entities or partner banks.
- Ant’s consumer-finance case is a clean illustration of why “fintech loan outstanding” needs a legal-entity qualifier. Platform branding does not identify who funds the asset or bears losses.
- The best use of the BI forecasts is a 2026-27 earnings-cycle overlay: lenders are forecast to contract before rebounding, while payment/AI/international investments may increase long-term optionality but reduce near-term Ant earnings visibility.

### Gaps

- A complete research update still needs the Bloomberg bank panel and a non-duplicated listed-fintech KPI export with security, period, unit, actual/estimate flag, field mnemonic and definition.
- For loan facilitators, request company-specific `outstanding balance of loans facilitated/enabled`, `loan origination volume`, `on-balance-sheet gross loans`, `capital-light/technology share`, `guaranteed/risk-bearing balance`, DPD30/90 and funding-partner concentration. The current BI PDF does not contain them.
- For payments, request a provider-share dataset that explicitly states geography, transaction value versus count, denominator, source/provider, observation date and whether bank-funded wallet transactions are included. The current PDFs do not provide a usable number.
