import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, Presentation, PresentationFile } from "@oai/artifact-tool";

process.env.RUNTIME_NODE_MODULES ??= "/Users/agatbe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";

const workspaceDir = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)";
const buildDir = path.join(workspaceDir, ".build/china_fintech_deck");
const previewDir = path.join(buildDir, "final_preview");
const stagingDir = path.join(buildDir, ".codex-finalizer");
const FINAL_PPTX = path.join(workspaceDir, "deliverables/China_Banks_vs_Fintech_Investment_Analysis_2026_FINAL.pptx");
const SKILL_DIR = "/Users/agatbe/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations";
const RUNTIME_PYTHON = "/Users/agatbe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const TEMPLATE_PATH = "/Users/agatbe/BCA Internship/Bonds x Mutual Fund/Market Update - 29 September 2026.pptx";
const TEMPLATE_SHA256 = "b7091b799d8638ce164d4e8ac2ba4530cdebd3693b372f373858cc102f29edc9";

const W = 1280;
const H = 720;
const FONT = "Calibri";
const C = {
  navy: "#002060",
  blue: "#0070C0",
  orange: "#E97132",
  charcoal: "#30343B",
  gray: "#595959",
  mid: "#7A838E",
  light: "#D9D9D9",
  pale: "#F3F5F7",
  paleBlue: "#EAF2F8",
  paleOrange: "#FCEDE5",
  white: "#FFFFFF",
  green: "#548235",
};

const presentation = Presentation.create({ slideSize: { width: W, height: H } });
presentation.theme.defaultFont = FONT;
presentation.theme.colorScheme = {
  name: "BCA Market Update Reference",
  themeColors: {
    accent1: C.navy,
    accent2: C.orange,
    accent3: C.blue,
    accent4: C.green,
    accent5: C.mid,
    accent6: C.light,
    bg1: C.white,
    bg2: C.pale,
    tx1: C.charcoal,
    tx2: C.gray,
    dk1: "#000000",
    dk2: C.navy,
    lt1: C.white,
    lt2: C.light,
    hlink: C.blue,
    folHlink: C.orange,
  },
};

function addText(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: opts.typeface ?? FONT,
    fontSize: opts.fontSize ?? 18,
    color: opts.color ?? C.charcoal,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "top",
    wrap: opts.wrap ?? "square",
    autoFit: opts.autoFit ?? "shrinkText",
    lineSpacing: opts.lineSpacing ?? 0.95,
    insets: opts.insets ?? 0,
  };
  return shape;
}

function addRect(slide, x, y, w, h, fill, line = C.light, radius = 0) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: line === "none" ? 0 : 1 },
    ...(radius ? { borderRadius: radius } : {}),
  });
}

function addLine(slide, x, y, w, h, color = C.light, width = 1, arrow = null) {
  return slide.shapes.add({
    geometry: "line",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: color, width, ...(arrow ? { endArrowType: arrow } : {}) },
  });
}

function addPanel(slide, x, y, w, h, opts = {}) {
  const panel = addRect(slide, x, y, w, h, opts.fill ?? C.white, opts.line ?? C.light, opts.radius ?? 4);
  if (opts.title) {
    addRect(slide, x, y, w, 27, opts.banner ?? C.navy, opts.banner ?? C.navy, 0);
    addText(slide, opts.title, x + 10, y + 3, w - 20, 20, {
      fontSize: 12,
      color: C.white,
      bold: true,
      valign: "middle",
    });
  }
  return panel;
}

function addHeader(slide, section, title, subtitle, slideNo, sourceShort) {
  slide.background.fill = C.white;
  addText(slide, section.toUpperCase(), 70, 28, 320, 20, {
    fontSize: 11.5,
    color: C.mid,
    bold: true,
  });
  addText(slide, title, 70, 51, 1135, 47, {
    fontSize: title.length > 58 ? 30 : 33,
    color: C.navy,
    bold: true,
    lineSpacing: 0.92,
  });
  addText(slide, subtitle, 70, 103, 1135, 31, {
    fontSize: 16.5,
    color: C.charcoal,
    bold: true,
    italic: true,
  });
  addText(slide, `Source: ${sourceShort}`, 70, 686, 1030, 17, {
    fontSize: 9.2,
    color: C.mid,
  });
  addText(slide, String(slideNo), 1180, 682, 30, 18, {
    fontSize: 11,
    color: C.mid,
    align: "right",
  });
}

function notes(slide, lines) {
  slide.speakerNotes.text = [
    "China Banks vs Fintech — investment analysis",
    "",
    ...lines,
  ];
  slide.speakerNotes.setVisible(true);
}

function axisStyle({ min, max, majorUnit, percent = false } = {}) {
  return {
    visible: true,
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
    ...(majorUnit !== undefined ? { majorUnit } : {}),
    ...(percent ? { numberFormatCode: "0%" } : {}),
    textStyle: { fill: C.mid, fontSize: 10.5 },
    line: { style: "solid", fill: C.light, width: 1 },
    majorGridlines: { style: "solid", fill: C.light, width: 1 },
  };
}

function addChartLabel(slide, text, x, y, w, color = C.navy) {
  addText(slide, text.toUpperCase(), x, y, w, 18, { fontSize: 11.5, color, bold: true });
}

function addKpi(slide, x, y, w, h, value, label, color = C.navy, fill = C.pale) {
  addRect(slide, x, y, w, h, fill, "none", 4);
  addText(slide, value, x + 12, y + 8, w - 24, 34, { fontSize: 26, color, bold: true });
  addText(slide, label, x + 12, y + 42, w - 24, Math.max(14, h - 48), { fontSize: 11.5, color: C.gray, bold: true });
}

function addShareRow(slide, y, label, detail, share, primary, secondary, primaryColor, secondaryColor) {
  const xLabel = 70;
  const xBar = 340;
  const barW = 720;
  addText(slide, label, xLabel, y - 4, 245, 25, { fontSize: 17, color: C.navy, bold: true });
  addText(slide, detail, xLabel, y + 23, 245, 30, { fontSize: 11, color: C.mid });
  addRect(slide, xBar, y, barW, 38, C.pale, "none", 0);
  addRect(slide, xBar, y, barW * share, 38, primaryColor, "none", 0);
  addRect(slide, xBar + barW * share, y, barW * (1 - share), 38, secondaryColor, "none", 0);
  addText(slide, `${(share * 100).toFixed(1)}% ${primary}`, xBar + 10, y + 8, Math.max(150, barW * share - 20), 20, {
    fontSize: 13,
    color: C.white,
    bold: true,
    valign: "middle",
  });
  if (1 - share > 0.12) {
    addText(slide, secondary, xBar + barW * share + 8, y + 8, barW * (1 - share) - 16, 20, {
      fontSize: 11,
      color: C.white,
      bold: true,
      valign: "middle",
    });
  }
  addText(slide, `${(share * 100).toFixed(1)}%`, 1085, y - 2, 125, 40, {
    fontSize: 27,
    color: primaryColor,
    bold: true,
    align: "right",
  });
}

function addDot(slide, cx, cy, r, fill, line = fill) {
  return slide.shapes.add({
    geometry: "ellipse",
    position: { left: cx - r, top: cy - r, width: 2 * r, height: 2 * r },
    fill,
    line: { style: "solid", fill: line, width: 1 },
  });
}

// Slide 1 — cover
{
  const slide = presentation.slides.add();
  slide.background.fill = C.white;
  addText(slide, "INVESTMENT RESEARCH", 70, 56, 270, 20, { fontSize: 12, color: C.mid, bold: true });
  addRect(slide, 70, 116, 7, 330, C.orange, C.orange, 0);
  addText(slide, "China Banks\nvs Fintech", 104, 172, 525, 145, {
    fontSize: 48,
    color: C.navy,
    bold: true,
    lineSpacing: 0.9,
  });
  addText(slide, "Who owns the click, the money and the risk — 2010 to H1 2026", 106, 335, 500, 60, {
    fontSize: 19,
    color: C.charcoal,
    bold: true,
    italic: true,
  });
  addText(slide, "14 October 2026  |  Indonesia / China Financials", 106, 418, 480, 22, {
    fontSize: 12,
    color: C.mid,
  });

  addRect(slide, 700, 92, 490, 500, C.pale, "none", 5);
  addText(slide, "THE TWO-SPEED EQUILIBRIUM", 735, 126, 420, 20, { fontSize: 12, color: C.mid, bold: true });
  addText(slide, "80.6%", 735, 182, 255, 76, { fontSize: 56, color: C.orange, bold: true });
  addText(slide, "non-bank share of\ncombined transaction count", 738, 260, 220, 58, { fontSize: 16, color: C.gray, bold: true });
  addLine(slide, 735, 334, 410, 0, C.light, 2);
  addText(slide, "91.5%", 735, 368, 255, 76, { fontSize: 56, color: C.navy, bold: true });
  addText(slide, "bank share of\ncombined transaction value", 738, 446, 220, 58, { fontSize: 16, color: C.gray, bold: true });
  addText(slide, "2025 mechanical PBOC index", 738, 542, 255, 22, { fontSize: 11, color: C.mid });
  addText(slide, "1", 1180, 682, 30, 18, { fontSize: 11, color: C.mid, align: "right" });
  notes(slide, [
    "Headline data are a mechanical comparison of overlapping PBOC bank-electronic and non-bank network-payment series, not a mutually exclusive ownership share.",
    "Sources: PBOC 2025 payment-system figures reproduced in Cuiwei filing (28 Mar 2026), https://static.cninfo.com.cn/finalpage/2026-03-28/1225042491.PDF",
    `Reference design: ${TEMPLATE_PATH}`,
  ]);
}

// Slide 2 — executive market split
{
  const slide = presentation.slides.add();
  addHeader(slide, "Executive thesis", "Fintech owns frequency; banks still own value", "The same payment can be fintech-initiated, bank-funded and bank-settled", 2, "PBOC; company filing reproduction; author calculations");
  addPanel(slide, 70, 158, 1140, 420, { title: "2025 MECHANICAL ACTIVITY INDEX — OVERLAPPING SERIES" });
  slide.charts.add("bar", {
    position: { left: 140, top: 220, width: 1000, height: 270 },
    categories: ["Transaction count", "Transaction value"],
    series: [
      { name: "Banks", values: [19.4, 91.5], fill: C.navy },
      { name: "Non-bank payment institutions", values: [80.6, 8.5], fill: C.orange },
    ],
    barOptions: { direction: "bar", grouping: "stacked", gapWidth: 55, overlap: 100 },
    hasLegend: true,
    legend: { position: "bottom", overlay: false, textStyle: { fill: C.gray, fontSize: 12 } },
    xAxis: { visible: false, min: 0, max: 100, majorGridlines: null },
    yAxis: { visible: true, textStyle: { fill: C.charcoal, fontSize: 14, bold: true }, line: { style: "solid", fill: C.white, width: 0 }, majorGridlines: null },
    dataLabels: { showValue: true, position: "center", numberFormatCode: "0.0\"%\"", textStyle: { fill: C.white, fontSize: 16, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addText(slide, "VALUE", 88, 262, 60, 18, { fontSize: 11, color: C.navy, bold: true, align: "right" });
  addText(slide, "COUNT", 88, 363, 60, 18, { fontSize: 11, color: C.navy, bold: true, align: "right" });
  addRect(slide, 130, 520, 1020, 38, C.paleOrange, "none", 3);
  addText(slide, "Do not add these series into a de-duplicated market share: definitions overlap by design.", 150, 529, 980, 20, { fontSize: 13, color: C.orange, bold: true, align: "center" });
  addKpi(slide, 70, 600, 360, 64, "80.0%", "Non-bank count share — H1 2026 actual", C.orange, C.paleOrange);
  addKpi(slide, 460, 600, 360, 64, "92.4%", "Bank value share — H1 2026 actual", C.navy, C.paleBlue);
  addKpi(slide, 850, 600, 360, 64, "≈95%", "Alipay + WeChat retail mobile volume — 2026", C.blue, C.pale);
  notes(slide, [
    "2025: banks 19.4% of combined count and 91.5% of combined value; non-bank institutions 80.6% and 8.5%.",
    "H1 2026 actual: non-bank 80.0% of combined count; banks 92.4% of combined value. H1 is not annualised.",
    "The PBOC explicitly notes scope overlap between bank electronic payments and non-bank network payments.",
    "Sources: PBOC 2023 payment-system report footnotes 11–13, https://www.pbc.gov.cn/zhifujiesuansi/128525/128545/128643/e65053157ab14b9abf06bc9b18badb3a/2024032815235914509.pdf ; 2025 data reproduced by Cuiwei, https://static.cninfo.com.cn/finalpage/2026-03-28/1225042491.PDF ; 2026 Q1/Q2 reproduction, https://www.mpaypass.com.cn/download/202609/03145833.html ; IMF 2026, https://www.elibrary.imf.org/view/journals/005/2026/009/article-A001-en.xml",
  ]);
}

// Slide 3 — layered shares
{
  const slide = presentation.slides.add();
  addHeader(slide, "Market structure", "Share depends on which layer you measure", "Interface, activity, clearing and settlement answer different questions", 3, "PBOC; AMRO; IMF; NetsUnion / UnionPay reproductions");
  addShareRow(slide, 170, "Customer interface", "2024 mobile-payment estimate", 0.94, "Alipay + WeChat", "Other", C.orange, C.light);
  addShareRow(slide, 280, "Activity count", "2025 PBOC mechanical index", 0.806, "Non-bank", "Bank", C.orange, C.navy);
  addShareRow(slide, 390, "Clearing count", "2025 clearing-rail activity", 0.759, "NetsUnion", "UnionPay", C.blue, C.navy);
  addShareRow(slide, 500, "Activity value", "2025 PBOC mechanical index", 0.915, "Bank", "Non-bank", C.navy, C.orange);
  addRect(slide, 70, 625, 1140, 36, C.pale, "none", 2);
  addText(slide, "One transaction can appear across all four layers — provider share is not funding share.", 90, 633, 1100, 20, { fontSize: 13, color: C.gray, bold: true, align: "center" });
  notes(slide, [
    "Interface estimate: Alipay plus WeChat/Tenpay around 94% in 2024 and close to 95% in 2026.",
    "Clearing share: NetsUnion carried 75.9% of count and 68.2% of value in 2025.",
    "Activity series overlap and do not represent mutually exclusive ownership.",
    "Sources: AMRO AFSR 2025, https://amro-asia.org/wp-content/uploads/2025/10/AMRO-AFSR-2025-Full-Report-Web.pdf ; IMF 2026, https://www.elibrary.imf.org/view/journals/005/2026/009/article-A001-en.xml ; PBOC / Cuiwei reproduction, https://static.cninfo.com.cn/finalpage/2026-03-28/1225042491.PDF ; NetsUnion / UnionPay report copy, https://www.fxbaogao.com/detail/5282328",
  ]);
}

// Slide 4 — transaction growth
{
  const slide = presentation.slides.add();
  addHeader(slide, "Comparable growth", "Both systems digitised at exponential speed", "Indexed growth isolates momentum; channel definitions still differ", 4, "PBOC annual payment-system reports; 2013 = 100");
  addPanel(slide, 70, 165, 550, 455, { title: "TRANSACTION COUNT INDEX" });
  addPanel(slide, 660, 165, 550, 455, { title: "TRANSACTION VALUE INDEX" });
  const years = ["2013", "2015", "2017", "2019", "2021", "2023", "2025"];
  slide.charts.add("line", {
    position: { left: 100, top: 220, width: 490, height: 330 },
    categories: years,
    series: [
      { name: "Bank mobile", values: [100, 827, 2243, 6060, 9034, 11060, 13827], line: { style: "solid", fill: C.navy, width: 3 }, marker: { symbol: "circle", size: 6, fill: C.navy } },
      { name: "Non-bank network", values: [100, 536, 1869, 4694, 6704, 8020, 8642], line: { style: "solid", fill: C.orange, width: 3 }, marker: { symbol: "circle", size: 6, fill: C.orange } },
    ],
    hasLegend: true,
    legend: { position: "bottom", textStyle: { fill: C.gray, fontSize: 11 } },
    xAxis: { visible: true, textStyle: { fill: C.mid, fontSize: 10 }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: 0, max: 15000, majorUnit: 3000 }),
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  slide.charts.add("line", {
    position: { left: 690, top: 220, width: 490, height: 330 },
    categories: years,
    series: [
      { name: "Bank mobile", values: [100, 1123, 2105, 3601, 5467, 5761, 5933], line: { style: "solid", fill: C.navy, width: 3 }, marker: { symbol: "circle", size: 6, fill: C.navy } },
      { name: "Non-bank network", values: [100, 537, 1554, 2710, 3855, 3690, 3664], line: { style: "solid", fill: C.orange, width: 3 }, marker: { symbol: "circle", size: 6, fill: C.orange } },
    ],
    hasLegend: true,
    legend: { position: "bottom", textStyle: { fill: C.gray, fontSize: 11 } },
    xAxis: { visible: true, textStyle: { fill: C.mid, fontSize: 10 }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: 0, max: 6500, majorUnit: 1300 }),
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addKpi(slide, 110, 570, 230, 62, "138×", "Bank mobile count vs 2013", C.navy, C.paleBlue);
  addKpi(slide, 350, 570, 230, 62, "86×", "Non-bank count vs 2013", C.orange, C.paleOrange);
  addKpi(slide, 700, 570, 230, 62, "59×", "Bank mobile value vs 2013", C.navy, C.paleBlue);
  addKpi(slide, 940, 570, 230, 62, "37×", "Non-bank value vs 2013", C.orange, C.paleOrange);
  notes(slide, [
    "Series are indexed to 2013=100. Bank mobile payments are a bank-channel subset; non-bank network payments are payment-institution transactions. They should not be added into a unique total.",
    "Underlying actuals for 2013–2025 are from PBOC annual payment-system reports and reproductions. Methodology breaks occurred in 2014, 2015, 2018 and 2023.",
    "Source examples: PBOC 2013, https://www.gov.cn/gzdt/att/att/site1/20140217/782bcb8883ce146be61101.pdf ; PBOC 2023, https://www.pbc.gov.cn/zhifujiesuansi/128525/128545/128643/e65053157ab14b9abf06bc9b18badb3a/2024032815235914509.pdf ; 2025 Cuiwei reproduction, https://static.cninfo.com.cn/finalpage/2026-03-28/1225042491.PDF",
  ]);
}

// Slide 5 — users and wallet concentration
{
  const slide = presentation.slides.add();
  addHeader(slide, "User adoption", "Payment usage reached mass-market saturation", "User growth broadened the market; interface share remained concentrated", 5, "CNNIC; Analysys; iResearch; AMRO; IMF");
  addPanel(slide, 70, 165, 470, 445, { title: "NETWORK-PAYMENT USERS — MILLION" });
  slide.charts.add("bar", {
    position: { left: 115, top: 225, width: 380, height: 270 },
    categories: ["2011", "2024"],
    series: [{ name: "Users", values: [166.76, 1029], fill: C.navy, points: [{ idx: 0, fill: C.blue }, { idx: 1, fill: C.navy }] }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 70 },
    hasLegend: false,
    xAxis: { visible: true, textStyle: { fill: C.gray, fontSize: 12, bold: true }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: 0, max: 1200, majorUnit: 300 }),
    dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0", textStyle: { fill: C.charcoal, fontSize: 13, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addKpi(slide, 110, 515, 175, 68, "32.5%", "Internet-user penetration — 2011", C.blue, C.paleBlue);
  addKpi(slide, 300, 515, 195, 68, "92.8%", "Internet-user penetration — 2024", C.navy, C.paleBlue);

  addPanel(slide, 580, 165, 630, 445, { title: "ALIPAY + TENPAY / WECHAT PAY — COMBINED SHARE" });
  slide.charts.add("line", {
    position: { left: 620, top: 225, width: 550, height: 310 },
    categories: ["2015", "2016", "2017", "2018", "1Q19", "2Q20", "2024", "2026"],
    series: [{
      name: "Combined wallet share",
      values: [90.3, 91.1, 92.5, 92.7, 92.6, 94.0, 94.0, 95.0],
      line: { style: "solid", fill: C.orange, width: 4 },
      marker: { symbol: "circle", size: 7, fill: C.orange },
    }],
    hasLegend: false,
    xAxis: { visible: true, textStyle: { fill: C.mid, fontSize: 10 }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: 88, max: 100, majorUnit: 3 }),
    dataLabels: { showValue: true, position: "top", numberFormatCode: "0.0\"%\"", textStyle: { fill: C.orange, fontSize: 10.5, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addRect(slide, 640, 548, 510, 35, C.paleOrange, "none", 2);
  addText(slide, "The market expanded six-fold while the wallet duopoly held above 90%.", 655, 556, 480, 19, { fontSize: 12.5, color: C.orange, bold: true, align: "center" });
  notes(slide, [
    "CNNIC network-payment users: 166.76m (32.5% of internet users) in 2011; 1.029bn (92.8%) in 2024.",
    "Wallet shares use source-specific mobile-payment definitions and should be read as a range. 2015–2019 are Analysys observations; 2Q20 is around 94%; 2024 AMRO estimate 94%; 2026 IMF assessment close to 95%.",
    "Sources: CNNIC 2012, https://www.cnnic.cn/NMediaFile/old_attach/P020120723477451202474.pdf ; CNNIC 2025, https://www3.cnnic.cn/NMediaFile/2025/0313/MAIN17418452848150SDUMQZGSU.pdf ; Bloomberg Intelligence 5.pdf pp.2; AMRO 2025; IMF 2026.",
  ]);
}

// Slide 6 — bank scale and returns
{
  const slide = presentation.slides.add();
  addHeader(slide, "Banking economics", "Bank balance sheets compounded; returns did not", "Funding scale survived fintech disruption, but margin and capital intensity diluted ROE", 6, "CBRC / NFRA; NBS; author calculations");
  addPanel(slide, 70, 165, 690, 455, { title: "BANKING SYSTEM BALANCE SHEET — RMB TRILLION" });
  slide.charts.add("line", {
    position: { left: 110, top: 220, width: 610, height: 335 },
    categories: ["2010", "2015", "2020", "2025"],
    series: [
      { name: "Assets", values: [95.3, 199.3, 319.7, 480.0], line: { style: "solid", fill: C.navy, width: 4 }, marker: { symbol: "circle", size: 7, fill: C.navy } },
      { name: "Deposits", values: [73.3, 139.8, 218.4, 336.1], line: { style: "solid", fill: C.blue, width: 3 }, marker: { symbol: "circle", size: 6, fill: C.blue } },
      { name: "Loans", values: [50.9, 99.3, 178.4, 275.7], line: { style: "solid", fill: C.orange, width: 3 }, marker: { symbol: "circle", size: 6, fill: C.orange } },
    ],
    hasLegend: true,
    legend: { position: "bottom", textStyle: { fill: C.gray, fontSize: 11 } },
    xAxis: { visible: true, textStyle: { fill: C.gray, fontSize: 11 }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: 0, max: 520, majorUnit: 100 }),
    dataLabels: { showValue: true, position: "top", numberFormatCode: "0.0", textStyle: { fill: C.charcoal, fontSize: 9.5 } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });

  addPanel(slide, 790, 165, 420, 250, { title: "SECTOR ROE — %" });
  slide.charts.add("line", {
    position: { left: 830, top: 220, width: 340, height: 155 },
    categories: ["2010", "2020", "2023", "2024", "2025"],
    series: [{ name: "ROE", values: [17.5, 9.48, 8.93, 8.10, 7.78], line: { style: "solid", fill: C.orange, width: 4 }, marker: { symbol: "circle", size: 7, fill: C.orange } }],
    hasLegend: false,
    xAxis: { visible: true, textStyle: { fill: C.mid, fontSize: 9.5 }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: 0, max: 20, majorUnit: 5 }),
    dataLabels: { showValue: true, position: "top", numberFormatCode: "0.0\"%\"", textStyle: { fill: C.orange, fontSize: 9.5, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });

  addPanel(slide, 790, 440, 420, 180, { title: "2010–2025 CAGR" });
  slide.charts.add("bar", {
    position: { left: 820, top: 492, width: 360, height: 105 },
    categories: ["Assets", "Deposits", "Loans", "Profit"],
    series: [{ name: "CAGR", values: [11.4, 10.7, 11.9, 6.8], fill: C.navy, points: [{ idx: 3, fill: C.orange }] }],
    barOptions: { direction: "bar", grouping: "clustered", gapWidth: 45 },
    hasLegend: false,
    xAxis: { visible: false, min: 0, max: 14, majorGridlines: null },
    yAxis: { visible: true, textStyle: { fill: C.gray, fontSize: 9.5 }, line: { style: "solid", fill: C.white, width: 0 }, majorGridlines: null },
    dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0\"%\"", textStyle: { fill: C.charcoal, fontSize: 9.5, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addKpi(slide, 70, 630, 220, 42, "1.42%", "2025 sector NIM", C.orange, C.paleOrange);
  addKpi(slide, 310, 630, 220, 42, "0.60%", "2025 sector ROA", C.navy, C.paleBlue);
  addKpi(slide, 550, 630, 220, 42, "RMB2.4tn", "2025 net profit", C.navy, C.pale);
  notes(slide, [
    "Banking assets rose from RMB95.3tn in 2010 to RMB480.0tn in 2025; deposits from RMB73.3tn to RMB336.1tn; loans from RMB50.9tn to RMB275.7tn.",
    "ROE fell from 17.5% to 7.78%; 2025 ROA 0.60%, NIM 1.42%.",
    "Sources: CBRC 2010 annual report, https://www.nfra.gov.cn/chinese/subject/subject/nianbao2010/english/1.pdf ; NFRA 2025, https://www.nfra.gov.cn/en/view/pages/ItemDetail.html?docId=1251267&itemId=980 ; NBS 2025 communiqué, https://www.stats.gov.cn/english/PressRelease/202602/t20260228_1962661.html",
  ]);
}

// Slide 7 — customer jobs matrix
{
  const slide = presentation.slides.add();
  addHeader(slide, "Customer perspective", "The same customer uses both stacks", "Fintech wins context and discovery; licensed institutions retain money, product and risk", 7, "Company filings; PBOC structure; author framework");
  const x0 = 70;
  const y0 = 168;
  const rowH = 54;
  const cols = [430, 660, 890, 1120];
  addRect(slide, x0, y0, 1140, 42, C.navy, C.navy, 0);
  addText(slide, "CUSTOMER JOB", x0 + 14, y0 + 10, 320, 20, { fontSize: 12, color: C.white, bold: true });
  addText(slide, "BANK FRONT DOOR", cols[0], y0 + 10, 190, 20, { fontSize: 12, color: C.white, bold: true, align: "center" });
  addText(slide, "FINTECH FRONT DOOR", cols[1], y0 + 10, 190, 20, { fontSize: 12, color: C.white, bold: true, align: "center" });
  addText(slide, "LICENSED RISK / CUSTODY", cols[2], y0 + 10, 230, 20, { fontSize: 12, color: C.white, bold: true, align: "center" });

  const rows = [
    ["Merchant pay / P2P / bills", 2, 3, 3],
    ["Salary and deposits", 3, 1, 3],
    ["Funds and wealth", 2, 3, 3],
    ["Securities investment", 2, 3, 3],
    ["Short unsecured credit", 1, 3, 3],
    ["Mortgage", 3, 1, 3],
    ["SME finance", 3, 2, 3],
    ["Corporate / wholesale", 3, 1, 3],
  ];
  for (let i = 0; i < rows.length; i++) {
    const y = y0 + 42 + i * rowH;
    addRect(slide, x0, y, 1140, rowH, i % 2 === 0 ? C.white : C.pale, C.light, 0);
    addText(slide, rows[i][0], x0 + 14, y + 16, 330, 22, { fontSize: 14, color: C.charcoal, bold: true });
    for (let j = 1; j <= 3; j++) {
      const level = rows[i][j];
      const color = j === 2 ? C.orange : C.navy;
      const cx = cols[j - 1] + 95;
      const r = level === 3 ? 12 : level === 2 ? 8 : 4;
      addDot(slide, cx, y + 27, r, level === 1 ? C.light : color, color);
    }
  }
  addText(slide, "PRIMARY", 840, 647, 65, 16, { fontSize: 9.5, color: C.mid, bold: true, align: "right" });
  addDot(slide, 920, 655, 9, C.navy);
  addText(slide, "SECONDARY", 950, 647, 82, 16, { fontSize: 9.5, color: C.mid, bold: true, align: "right" });
  addDot(slide, 1047, 655, 6, C.navy);
  addText(slide, "LIMITED", 1080, 647, 58, 16, { fontSize: 9.5, color: C.mid, bold: true, align: "right" });
  addDot(slide, 1154, 655, 4, C.light, C.navy);
  notes(slide, [
    "This is a qualitative structural map, not a quantified market-share table.",
    "Customer multi-homing is the core observation: platforms own convenience and discovery, while banks, brokers, fund managers, consumer-finance companies and custodians retain regulated liabilities and risk.",
    "Early evidence already showed multi-homing: 79.2% of surveyed online-payment users used third-party account balances and 75.7% used online banking in 2012. Source: CNNIC, https://www3.cnnic.cn/n4/2022/0401/c119-1026.html",
  ]);
}

// Slide 8 — digital banks
{
  const slide = presentation.slides.add();
  addHeader(slide, "Licensed hybrids", "Digital banks bridge interface and balance sheet", "WeBank and MYbank converted ecosystem traffic into regulated deposits, loans and fees", 8, "Bloomberg Intelligence 5.pdf; company disclosures");
  addPanel(slide, 70, 165, 600, 455, { title: "LOAN BALANCE — RMB BILLION" });
  slide.charts.add("bar", {
    position: { left: 110, top: 225, width: 520, height: 325 },
    categories: ["WeBank", "MYbank"],
    series: [
      { name: "2018", values: [120, 48], fill: C.blue },
      { name: "2024", values: [436, 298.5], fill: C.navy },
    ],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 55 },
    hasLegend: true,
    legend: { position: "bottom", textStyle: { fill: C.gray, fontSize: 11 } },
    xAxis: { visible: true, textStyle: { fill: C.charcoal, fontSize: 12, bold: true }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: 0, max: 500, majorUnit: 100 }),
    dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { fill: C.charcoal, fontSize: 11, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addKpi(slide, 110, 565, 250, 54, "3.6×", "WeBank loan growth — 2018 to 2024", C.navy, C.paleBlue);
  addKpi(slide, 375, 565, 250, 54, "6.2×", "MYbank loan growth — 2018 to 2024", C.orange, C.paleOrange);

  addPanel(slide, 710, 165, 500, 205, { title: "2018 LOAN-TO-DEPOSIT RATIO" });
  slide.charts.add("bar", {
    position: { left: 750, top: 220, width: 420, height: 120 },
    categories: ["WeBank", "MYbank"],
    series: [{ name: "LDR", values: [78, 111], fill: C.navy, points: [{ idx: 1, fill: C.orange }] }],
    barOptions: { direction: "bar", grouping: "clustered", gapWidth: 42 },
    hasLegend: false,
    xAxis: { visible: true, min: 0, max: 130, majorUnit: 25, textStyle: { fill: C.mid, fontSize: 9 }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: { style: "solid", fill: C.light, width: 1 } },
    yAxis: { visible: true, textStyle: { fill: C.gray, fontSize: 10.5 }, line: { style: "solid", fill: C.white, width: 0 }, majorGridlines: null },
    dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0\"%\"", textStyle: { fill: C.charcoal, fontSize: 10.5, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addPanel(slide, 710, 395, 500, 225, { title: "2018 NET FEES / REVENUE" });
  slide.charts.add("bar", {
    position: { left: 750, top: 450, width: 420, height: 140 },
    categories: ["WeBank", "MYbank"],
    series: [{ name: "Fee mix", values: [44, 26], fill: C.navy, points: [{ idx: 1, fill: C.orange }] }],
    barOptions: { direction: "bar", grouping: "clustered", gapWidth: 42 },
    hasLegend: false,
    xAxis: { visible: true, min: 0, max: 50, majorUnit: 10, textStyle: { fill: C.mid, fontSize: 9 }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: { style: "solid", fill: C.light, width: 1 } },
    yAxis: { visible: true, textStyle: { fill: C.gray, fontSize: 10.5 }, line: { style: "solid", fill: C.white, width: 0 }, majorGridlines: null },
    dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0\"%\"", textStyle: { fill: C.charcoal, fontSize: 10.5, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  notes(slide, [
    "WeBank/MYbank are licensed banks, not non-bank fintechs.",
    "2018: WeBank loans RMB120bn, deposits RMB154bn, LDR 78%, net fees RMB4.424bn and fee/revenue 44%; MYbank loans RMB48bn, deposits RMB43bn, interbank funding RMB35bn, LDR 111%, net fees RMB1.635bn and fee/revenue 26%.",
    "2024 loans: WeBank RMB436bn; MYbank RMB298.5bn.",
    "Sources: Bloomberg Intelligence 5.pdf pp.3–5 in /Users/agatbe/Downloads/chinafintech/5.pdf ; company disclosures cited in the underlying research report.",
  ]);
}

// Slide 9 — listed peer economics
{
  const slide = presentation.slides.add();
  addHeader(slide, "Listed comparables", "The market pays for return density", "Banks screen cheap and income-rich; platforms screen higher-return and higher-multiple", 9, "Bloomberg workbook TIM - 11.xlsx; 2025Q4 medians");
  const metrics = [
    { x: 70, y: 170, title: "COMMON ROE", bank: 9.68, fin: 14.78, max: 18, fmt: "0.0\"%\"" },
    { x: 360, y: 170, title: "ROA", bank: 0.65, fin: 5.86, max: 7, fmt: "0.0\"%\"" },
    { x: 650, y: 170, title: "PRICE / BOOK", bank: 0.67, fin: 3.34, max: 4, fmt: "0.00\"x\"" },
    { x: 940, y: 170, title: "TRAILING P / E", bank: 7.35, fin: 17.29, max: 20, fmt: "0.0\"x\"" },
  ];
  for (const m of metrics) {
    addPanel(slide, m.x, m.y, 270, 360, { title: m.title });
    slide.charts.add("bar", {
      position: { left: m.x + 30, top: m.y + 62, width: 210, height: 240 },
      categories: ["Median"],
      series: [
        { name: "Banks", values: [m.bank], fill: C.navy },
        { name: "Fintech / platforms", values: [m.fin], fill: C.orange },
      ],
      barOptions: { direction: "column", grouping: "clustered", gapWidth: 70 },
      hasLegend: false,
      xAxis: { visible: false, majorGridlines: null },
      yAxis: axisStyle({ min: 0, max: m.max, majorUnit: m.max / 4 }),
      dataLabels: { showValue: true, position: "outEnd", numberFormatCode: m.fmt, textStyle: { fill: C.charcoal, fontSize: 11, bold: true } },
      chartFill: C.white,
      plotAreaFill: C.white,
      chartLine: { style: "solid", fill: C.white, width: 0 },
    });
    addRect(slide, m.x + 30, m.y + 310, 10, 10, C.navy, C.navy, 0);
    addText(slide, "Banks", m.x + 48, m.y + 304, 72, 18, { fontSize: 10.5, color: C.gray, bold: true });
    addRect(slide, m.x + 120, m.y + 310, 10, 10, C.orange, C.orange, 0);
    addText(slide, "Fintech", m.x + 138, m.y + 304, 78, 18, { fontSize: 10.5, color: C.gray, bold: true });
  }
  addKpi(slide, 160, 560, 430, 76, "4.20%", "Bank median dividend yield", C.navy, C.paleBlue);
  addKpi(slide, 690, 560, 430, 76, "3.48%", "Fintech / platform median dividend yield", C.orange, C.paleOrange);
  notes(slide, [
    "Audit-cleaned 2025Q4 sample: 10 banks and 9 unique fintech/platform names.",
    "Banks: median ROA 0.65%, common ROE 9.68%, P/B 0.67x, trailing P/E 7.35x, dividend yield 4.20%.",
    "Fintech/platforms: median ROA 5.86%, common ROE 14.78%, P/B 3.34x (n=6), trailing P/E 17.29x (n=6), dividend yield 3.48%.",
    "Source: user-provided Bloomberg workbook /Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx; audit notes in research_notes/China banks fintech Bloomberg/workbook_audit.md.",
  ]);
}

// Slide 10 — H1 2026 divergence
{
  const slide = presentation.slides.add();
  addHeader(slide, "2026 earnings", "H1 2026 exposed business-model dispersion", "Capital-market platforms accelerated; loan facilitators absorbed funding and credit pressure", 10, "Bloomberg workbook; H1 2026 actual, not annualised");
  addPanel(slide, 70, 165, 1140, 405, { title: "H1 2026 YEAR-ON-YEAR GROWTH — %" });
  slide.charts.add("bar", {
    position: { left: 115, top: 220, width: 1050, height: 305 },
    categories: ["Tencent", "East Money", "Qfin", "Lexin", "FinVolution"],
    series: [
      { name: "Revenue", values: [10.1, 53.2, -25.6, -2.9, -6.3], fill: C.navy },
      { name: "Net income", values: [10.3, 44.8, -63.5, -67.9, -42.6], fill: C.orange },
    ],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 45 },
    hasLegend: true,
    legend: { position: "bottom", textStyle: { fill: C.gray, fontSize: 11 } },
    xAxis: { visible: true, textStyle: { fill: C.charcoal, fontSize: 11, bold: true }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: -80, max: 60, majorUnit: 20 }),
    dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0\"%\"", textStyle: { fill: C.charcoal, fontSize: 10, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addKpi(slide, 70, 595, 350, 66, "+8.4%", "Bank median asset growth", C.navy, C.paleBlue);
  addKpi(slide, 465, 595, 350, 66, "9.47%", "Bank median common ROE", C.navy, C.paleBlue);
  addKpi(slide, 860, 595, 350, 66, "−28.3%", "Fintech median net-income change", C.orange, C.paleOrange);
  notes(slide, [
    "H1 2026 actual: Tencent revenue/net income +10.1%/+10.3%; East Money +53.2%/+44.8%; Qfin -25.6%/-63.5%; Lexin -2.9%/-67.9%; FinVolution -6.3%/-42.6%.",
    "Bank peer medians: asset growth +8.4% YoY, loans +5.7%, deposits +3.9%, H1 operating field +6.1%, T12 NIM 1.38%, ROA 0.63%, common ROE 9.47%, NPL 1.27%.",
    "Source: /Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx; normalized panel in research_notes/China banks fintech Bloomberg/workbook_audit.md.",
  ]);
}

// Slide 11 — Ant credit perimeter
{
  const slide = presentation.slides.add();
  addHeader(slide, "Credit economics", "Ant shows why enabled credit is not a loan book", "Platform distribution scaled first; regulation pushed more economics onto licensed balance sheets", 11, "Ant prospectus; Bloomberg Intelligence 1.pdf");
  addPanel(slide, 70, 165, 540, 455, { title: "JUNE 2020 ENABLED CREDIT — FUNDING SHARE" });
  slide.charts.add("bar", {
    position: { left: 115, top: 250, width: 450, height: 155 },
    categories: ["RMB2.154tn enabled credit"],
    series: [
      { name: "Partner institutions / securitisation", values: [98], fill: C.navy },
      { name: "Ant / related balance sheet", values: [2], fill: C.orange },
    ],
    barOptions: { direction: "bar", grouping: "stacked", gapWidth: 70, overlap: 100 },
    hasLegend: true,
    legend: { position: "bottom", textStyle: { fill: C.gray, fontSize: 10.5 } },
    xAxis: { visible: false, min: 0, max: 100, majorGridlines: null },
    yAxis: { visible: true, textStyle: { fill: C.charcoal, fontSize: 11.5, bold: true }, line: { style: "solid", fill: C.white, width: 0 }, majorGridlines: null },
    dataLabels: { showValue: true, position: "center", numberFormatCode: "0\"%\"", textStyle: { fill: C.white, fontSize: 13, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addKpi(slide, 140, 470, 400, 92, "≈98%", "Funded or underwritten by partners / securitisation", C.navy, C.paleBlue);

  addPanel(slide, 650, 165, 560, 455, { title: "ANT CONSUMER FINANCE — 2025 RMB BILLION" });
  addKpi(slide, 700, 212, 460, 74, "RMB303bn", "On-balance-sheet gross loans", C.navy, C.paleBlue);
  slide.charts.add("bar", {
    position: { left: 700, top: 320, width: 460, height: 230 },
    categories: ["Net interest income", "Credit costs", "Net profit"],
    series: [{
      name: "RMBbn",
      values: [18.7, -15.9, 3.1],
      fill: C.navy,
      points: [{ idx: 1, fill: C.orange }, { idx: 2, fill: C.blue }],
    }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 45 },
    hasLegend: false,
    xAxis: { visible: true, textStyle: { fill: C.charcoal, fontSize: 10.5, bold: true }, line: { style: "solid", fill: C.light, width: 1 }, majorGridlines: null },
    yAxis: axisStyle({ min: -20, max: 25, majorUnit: 10 }),
    dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { fill: C.charcoal, fontSize: 11, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
  });
  addRect(slide, 720, 565, 420, 34, C.paleOrange, "none", 2);
  addText(slide, "Credit costs absorbed ~85% of NII", 735, 573, 390, 18, { fontSize: 12.5, color: C.orange, bold: true, align: "center" });
  notes(slide, [
    "June 2020: Ant enabled RMB2.154tn of consumer and SME credit; partner institutions or securitisation funded/underwrote about 98%.",
    "2025 Chongqing Ant Consumer Finance: gross loans RMB303bn, NII RMB18.7bn, credit costs RMB15.9bn, net profit RMB3.1bn.",
    "The periods and entities differ. The comparison illustrates perimeter shift, not a continuous share bridge.",
    "Sources: Ant IPO prospectus, https://wynthia.com/wp-content/uploads/2020/09/ant-draft-ipo-prospectus-2020-08-read.pdf ; Bloomberg Intelligence Ant Group Private Company Research 1.pdf pp.13–14 in /Users/agatbe/Downloads/chinafintech/1.pdf.",
  ]);
}

// Slide 12 — regulation timeline
{
  const slide = presentation.slides.add();
  addHeader(slide, "Regulatory reset", "Regulation moved risk back inside the perimeter", "The interface survived; the economics and accountability changed", 12, "PBOC; NFRA; State Council; HKEX; BIS");
  const yLine = 340;
  addLine(slide, 115, yLine, 1050, 0, C.navy, 3);
  const events = [
    { x: 125, year: "2010", title: "PAYMENT\nLICENCES", above: true },
    { x: 325, year: "2017–19", title: "NETSUNION +\n100% RESERVES", above: false },
    { x: 535, year: "2020", title: "ANT IPO HALT +\nP2P CLOSURE", above: true },
    { x: 745, year: "2021", title: "30% CO-LENDING\nCAPITAL", above: false },
    { x: 945, year: "2024", title: "NEW PAYMENT\nREGULATION", above: true },
    { x: 1145, year: "2025–26", title: "COST + MARKETING\nDISCLOSURE", above: false },
  ];
  for (const e of events) {
    addDot(slide, e.x, yLine, 10, e.year === "2020" || e.year === "2021" ? C.orange : C.navy);
    const cardY = e.above ? 185 : 390;
    addRect(slide, e.x - 82, cardY, 164, 110, e.above ? C.paleBlue : C.pale, "none", 4);
    addText(slide, e.year, e.x - 68, cardY + 12, 136, 25, { fontSize: 18, color: e.year === "2020" || e.year === "2021" ? C.orange : C.navy, bold: true, align: "center" });
    addText(slide, e.title, e.x - 70, cardY + 48, 140, 48, { fontSize: 12, color: C.charcoal, bold: true, align: "center", valign: "middle" });
    addLine(slide, e.x, e.above ? cardY + 110 : yLine, 0, e.above ? yLine - (cardY + 110) : cardY - yLine, C.light, 1);
  }
  addRect(slide, 150, 555, 450, 52, C.paleOrange, "none", 3);
  addText(slide, "PLATFORM AUTONOMY  ↓", 170, 569, 410, 25, { fontSize: 18, color: C.orange, bold: true, align: "center" });
  addRect(slide, 680, 555, 450, 52, C.paleBlue, "none", 3);
  addText(slide, "LICENSED-OWNER RESPONSIBILITY  ↑", 700, 569, 410, 25, { fontSize: 18, color: C.navy, bold: true, align: "center" });
  addText(slide, "Result: regulated co-opetition, not bank-versus-fintech displacement", 220, 630, 840, 25, { fontSize: 15, color: C.gray, bold: true, italic: true, align: "center" });
  notes(slide, [
    "2010–11: payment licensing formalised platforms. 2017–19: QR rules, UnionPay/NetsUnion routing and 100% centralisation of customer reserves. 2020: Ant IPO suspended and operating P2P platforms closed. 2021: co-lenders required at least 30% contribution, plus partner and exposure limits. 2024: new non-bank payment regulation. 2025–26: loan-assistance, all-in cost and online-marketing rules.",
    "Sources: PBOC licensing, https://www.pbc.gov.cn/english/130733/2025080815071811497/index.html ; BIS China fintech supervision, https://www.bis.org/speeches/20201222-fintech-developments-challenges-supervision-china ; HKEX Ant suspension, https://www1.hkexnews.hk/listedco/listconews/sehk/2020/1103/2020110302285.pdf ; 2021 co-lending rule, https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2021/art_b3faa0277ac64fefa328864628d4292c.html ; State Council Decree 768, https://www.pbc.gov.cn/tiaofasi/144941/144953/5174993/index.html ; NFRA 2025/2026 rules, https://www.nfra.gov.cn/en/view/pages/ItemDetail.html?docId=1252542&itemId=981",
  ]);
}

// Slide 13 — investment positioning
{
  const slide = presentation.slides.add();
  addHeader(slide, "Investment conclusion", "Own the hybrid: context + licence + funding", "The best franchises control at least two of the three", 13, "Author assessment based on sector evidence and Bloomberg comparables");
  const gx = 145;
  const gy = 180;
  const gw = 840;
  const gh = 430;
  addRect(slide, gx, gy, gw, gh, C.white, C.light, 0);
  addRect(slide, gx + gw / 2, gy, gw / 2, gh / 2, C.paleBlue, "none", 0);
  addText(slide, "PREFERRED ZONE", gx + gw / 2 + 18, gy + 18, 180, 20, { fontSize: 11, color: C.navy, bold: true, align: "left" });
  addLine(slide, gx + gw / 2, gy, 0, gh, C.light, 1);
  addLine(slide, gx, gy + gh / 2, gw, 0, C.light, 1);
  addText(slide, "LOW", gx - 10, gy + gh + 17, 60, 18, { fontSize: 10, color: C.mid });
  addText(slide, "INTERFACE / CUSTOMER CONTEXT", gx + 270, gy + gh + 17, 300, 18, { fontSize: 11, color: C.gray, bold: true, align: "center" });
  addText(slide, "HIGH", gx + gw - 40, gy + gh + 17, 60, 18, { fontSize: 10, color: C.mid, align: "right" });
  addText(slide, "FUNDING +\nLICENCE\nCONTROL", 70, gy + 145, 66, 100, { fontSize: 10.5, color: C.gray, bold: true, align: "center", valign: "middle", lineSpacing: 0.9 });

  const bubbles = [
    { x: 0.30, y: 0.82, r: 33, label: "Large\nbanks", fill: C.navy },
    { x: 0.72, y: 0.84, r: 32, label: "CMB", fill: C.blue },
    { x: 0.86, y: 0.88, r: 38, label: "WeBank /\nMYbank", fill: C.navy },
    { x: 0.75, y: 0.66, r: 31, label: "East\nMoney", fill: C.blue },
    { x: 0.90, y: 0.46, r: 38, label: "Tencent /\nAnt", fill: C.orange },
    { x: 0.62, y: 0.19, r: 36, label: "Loan\nfacilitators", fill: C.orange },
  ];
  for (const b of bubbles) {
    const cx = gx + b.x * gw;
    const cy = gy + (1 - b.y) * gh;
    addDot(slide, cx, cy, b.r, b.fill);
    addText(slide, b.label, cx - b.r + 4, cy - 20, 2 * b.r - 8, 40, { fontSize: 11.5, color: C.white, bold: true, align: "center", valign: "middle", lineSpacing: 0.9 });
  }

  addRect(slide, 1015, 185, 195, 120, C.paleBlue, "none", 4);
  addText(slide, "PREFER", 1035, 200, 155, 22, { fontSize: 13, color: C.navy, bold: true });
  addText(slide, "CMB\nDigital banks\nEast Money", 1035, 230, 155, 62, { fontSize: 15, color: C.charcoal, bold: true, lineSpacing: 0.92 });
  addRect(slide, 1015, 325, 195, 120, C.pale, "none", 4);
  addText(slide, "SELECTIVE", 1035, 340, 155, 22, { fontSize: 13, color: C.blue, bold: true });
  addText(slide, "Tencent / Ant\nLarge banks", 1035, 370, 155, 55, { fontSize: 15, color: C.charcoal, bold: true, lineSpacing: 0.92 });
  addRect(slide, 1015, 465, 195, 120, C.paleOrange, "none", 4);
  addText(slide, "CAUTIOUS", 1035, 480, 155, 22, { fontSize: 13, color: C.orange, bold: true });
  addText(slide, "Pure loan\nfacilitators", 1035, 510, 155, 55, { fontSize: 15, color: C.charcoal, bold: true, lineSpacing: 0.92 });
  addRect(slide, 145, 640, 1065, 28, C.navy, C.navy, 0);
  addText(slide, "Barbell: bank funding resilience + licensed, high-engagement digital distribution", 165, 645, 1025, 18, { fontSize: 13, color: C.white, bold: true, align: "center" });
  notes(slide, [
    "Qualitative analytical positioning, not a price target or quantified score. The axes represent structural control of customer context and control of licensed funding/risk/product ownership.",
    "Preferred examples combine at least two advantages: CMB (deposit funding + mobile/wealth engagement), WeBank/MYbank (ecosystem + banking licence), East Money (information traffic + regulated brokerage/distribution).",
    "Tencent/Ant retain interface optionality but segment transparency and regulatory capital are weaker. Large banks offer cheap valuations and income but face NIM pressure. Pure loan facilitators have the weakest bargaining position under 2025–26 partner, cost and disclosure rules.",
    "Underlying sources: user-provided Bloomberg workbook /Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx; NFRA/PBOC evidence; Bloomberg Intelligence PDFs 1.pdf, 4.pdf and 5.pdf; full research report at /Users/agatbe/Claude Project/Claude Vibecode (NiFi)/reports/China banks fintech Bloomberg.md.",
  ]);
}

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });
await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const candidatePath = path.join(stagingDir, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const { finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href);
const requirements = {
  explicitTotalSlideCount: 13,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [2, 4, 5, 6, 8, 9, 10, 11],
  requiredEmbeddedWorkbookChartOwnerSlides: [],
  materializeLiteralChartWorkbooks: true,
};
const fontPolicy = {
  basis: "reference",
  families: ["Calibri"],
  referencePath: TEMPLATE_PATH,
  referenceSha256: TEMPLATE_SHA256,
};
const expectedSlideSizeEmu = "12192000,6858000";

const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", expectedSlideSizeEmu,
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, `${path.basename(FINAL_PPTX)}.validation.json`),
});

const finalDeck = await PresentationFile.importPptx(await FileBlob.load(FINAL_PPTX));
for (const [index, slide] of finalDeck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  const png = await finalDeck.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(previewDir, `${stem}.png`), new Uint8Array(await png.arrayBuffer()));
}

console.log(JSON.stringify({ finalPath: FINAL_PPTX, candidatePath, previewDir, finalizer: result }, null, 2));
