// =============================================================
//  The Coal Paradox (NiFi Research, published 19 August 2026)
// -------------------------------------------------------------
//  Daily closing prices supplied by NiFi: AADI (Rupiah per share)
//  and the Jakarta Composite Index (JCI), from the day the report
//  was published (19 Aug 2026) to 9 Sep 2026. The Home research
//  section draws both lines indexed to the publication-day close.
//  Each row: [date, AADI close, JCI close].
// =============================================================

export const coalReport = {
  id: "coal-paradox",
  title: "The Coal Paradox",
  subtitle: "Demand, Supply, and the New Economics of Indonesian Thermal Coal",
  date: "2026-08-19",
  cover: "/research/covers/coal-paradox.jpg",
  authors: ["Taufan Fadhillah", "Agatbe Thymoty", "Rafael Dominico", "Annisa Rahayu"],
};

export const PUBLISHED = "2026-08-19";

export const prices = [
  ["2026-08-19", 9725, 6394.125],
  ["2026-08-20", 9900, 6501.585],
  ["2026-08-21", 9800, 6525.69],
  ["2026-08-24", 10250, 6501.667],
  ["2026-08-26", 10000, 6405.685],
  ["2026-08-27", 10125, 6521.75],
  ["2026-08-28", 10225, 6518.121],
  ["2026-08-31", 10825, 6525.478],
  ["2026-09-01", 10875, 6599.943],
  ["2026-09-02", 10650, 6595.776],
  ["2026-09-03", 11175, 6667.891],
  ["2026-09-04", 11250, 6636.475],
  ["2026-09-07", 11700, 6619.673],
  ["2026-09-08", 11750, 6686.442],
  ["2026-09-09", 12450, 6678.201],
];
