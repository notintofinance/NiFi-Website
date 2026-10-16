import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

process.on("uncaughtException", (error) => {
  console.error(`${error?.name || "Error"}: ${error?.message || error}`);
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.error(`${error?.name || "Error"}: ${error?.message || error}`);
  process.exit(1);
});

const workspaceDir = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)";
const skillDir = "/Users/agatbe/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations";
const runtimePython = "/Users/agatbe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const templatePath = path.join(workspaceDir, ".build/china_fintech_deck/template-sanitized.pptx");
const referencePath = "/Users/agatbe/BCA Internship/Bonds x Mutual Fund/Market Update - 29 September 2026.pptx";
const coverPath = path.join(workspaceDir, ".build/china_fintech_deck/assets/china_bank_fintech_cover.png");
const stagingDir = path.join(workspaceDir, ".codex-finalizer-china-fintech-exact");
const candidatePath = path.join(stagingDir, "candidate.pptx");
const finalPath = path.join(workspaceDir, "deliverables/China_Banks_vs_Fintech_Exact_Template_2026_v2.pptx");
const expectedSlideSizeEmu = "12192000,6858000";

const deck = await PresentationFile.importPptx(await FileBlob.load(templatePath));
console.log("stage: imported");

function setText(id, value) {
  const shape = deck.resolve(id);
  shape.text = value;
  return shape;
}

function clearText(ids) {
  for (const id of ids) setText(id, "");
}

function styleSeries(series, fill, lineWidth = 2.2) {
  // Imported template charts keep their original series styling and palette.
  void series;
  void fill;
  void lineWidth;
}

function hideSeries(series, length) {
  series.name = "";
  series.values = Array(length).fill(null);
}

function setBarOptions(chart, options) {
  for (const [key, value] of Object.entries(options)) chart.barOptions[key] = value;
}

function addBubble(slide, { left, top, width, height, text, fill, line, fontSize = 13, textColor = "#002060", bold = true }) {
  return slide.shapes.add({
    geometry: "ellipse",
    position: { left, top, width, height },
    fill,
    line: { style: "solid", fill: line, width: 1.5 },
    text: {
      text,
      style: {
        typeface: "Calibri",
        fontSize,
        bold,
        fill: textColor,
        alignment: "center",
        verticalAlignment: "middle",
        insets: 4,
        autoFit: "shrinkText",
      },
    },
  });
}

function setSlideNotes(slide, title, sources, caveat = "") {
  slide.speakerNotes.text = [
    title,
    "",
    "Sources:",
    ...sources.map((source) => `- ${source}`),
    caveat ? `\nMethodology / caveat:\n${caveat}` : "",
  ].filter(Boolean).join("\n");
}

// Slide 1 — preserve the cover layout and replace only its copy and square image.
setText("sh/7qp4be9c", "China Banks vs Fintech");
setText("sh/65g3298r", "The interface moved, the balance sheet stayed | 2010 to H1 2026");
const coverImage = deck.resolve("im/7itgrq9k");
const coverBytes = await fs.readFile(coverPath);
const coverBuffer = coverBytes.buffer.slice(coverBytes.byteOffset, coverBytes.byteOffset + coverBytes.byteLength);
const oldFrame = coverImage.frame;
const oldCrop = coverImage.crop;
const oldFit = coverImage.fit;
coverImage.replace({ blob: coverBuffer, contentType: "image/png", alt: "China bank and fintech coexistence illustration", fit: oldFit || "cover" });
coverImage.frame = oldFrame;
if (oldCrop) coverImage.crop = oldCrop;
setSlideNotes(deck.slides.items[0], "China Banks vs Fintech", [
  "Cover illustration generated for this presentation; no company logos or documentary claims.",
]);
console.log("stage: slide1");

// Slide 2 — exact three-chart macro layout, now used for transaction frequency and value.
setText("sh/9072xkry", "MARKET STRUCTURE");
setText("sh/ozy1ofad", "Fintech Owns Frequency; Banks Still Own Value");
setText("sh/b29kza94", "The same transaction can be platform-initiated, bank-funded and bank-settled.");
setText("sh/a10jqpsj", "Sources: PBOC payment-system statistics; 2025 figures reproduced by Cuiwei; internal calculations. Bank and non-bank series overlap and are not ownership shares.");
setText("sh/q5wjelsz", "TRANSACTION COUNT INDEX");
setText("sh/9wnqhczy", "");
setText("sh/wjy9sry9", "TRANSACTION VALUE INDEX");
setText("sh/76twva5c", "2025 ACTIVITY SPLIT");
clearText(["sh/bip8jmho", "sh/cnupgny5", "sh/do3q9szq", "sh/hcvy14ne", "sh/gbmxszmt"]);

const years = ["2013", "2015", "2017", "2019", "2021", "2023", "2025"];
deck.delete(["ch/g3ah4zql", "ch/p83y1472", "ch/etgn2xwz"]);
const slide2 = deck.slides.items[1];
slide2.charts.add("line", {
  position: { left: 72.96, top: 167.04, width: 1134.72, height: 245.76 },
  title: "PBOC transaction count index, 2013 = 100",
  titleTextStyle: { typeface: "Calibri", fontSize: 12, bold: true, fill: "#30343B" },
  categories: years,
  series: [
    { name: "Bank electronic", values: [100, 827, 2243, 6060, 9034, 11060, 13827], line: { style: "solid", fill: "#002060", width: 2.4 }, marker: { symbol: "circle", size: 5, fill: "#002060" } },
    { name: "Non-bank network", values: [100, 536, 1869, 4694, 6704, 8020, 8642], line: { style: "solid", fill: "#E97132", width: 2.4 }, marker: { symbol: "circle", size: 5, fill: "#E97132" } },
  ],
  hasLegend: true,
  legend: { position: "bottom", overlay: false, textStyle: { typeface: "Calibri", fontSize: 10, fill: "#595959" } },
  xAxis: { textStyle: { typeface: "Calibri", fontSize: 9, fill: "#595959" }, majorGridlines: null },
  yAxis: { min: 0, numberFormatCode: "0", textStyle: { typeface: "Calibri", fontSize: 9, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
slide2.charts.add("line", {
  position: { left: 72.96, top: 474.24, width: 581.76, height: 168.96 },
  title: "PBOC transaction value index, 2013 = 100",
  titleTextStyle: { typeface: "Calibri", fontSize: 10.5, bold: true, fill: "#30343B" },
  categories: years,
  series: [
    { name: "Bank electronic", values: [100, 1123, 2105, 3601, 5467, 5761, 5933], line: { style: "solid", fill: "#002060", width: 2.2 }, marker: { symbol: "circle", size: 4, fill: "#002060" } },
    { name: "Non-bank network", values: [100, 537, 1554, 2710, 3855, 3690, 3664], line: { style: "solid", fill: "#E97132", width: 2.2 }, marker: { symbol: "circle", size: 4, fill: "#E97132" } },
  ],
  hasLegend: true,
  legend: { position: "bottom", overlay: false, textStyle: { typeface: "Calibri", fontSize: 8.5, fill: "#595959" } },
  xAxis: { textStyle: { typeface: "Calibri", fontSize: 8, fill: "#595959" }, majorGridlines: null },
  yAxis: { min: 0, numberFormatCode: "0", textStyle: { typeface: "Calibri", fontSize: 8, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
slide2.charts.add("bar", {
  position: { left: 710.4, top: 474.24, width: 497.28, height: 168.96 },
  title: "Combined-series activity split, 2025 (%)",
  titleTextStyle: { typeface: "Calibri", fontSize: 10.5, bold: true, fill: "#30343B" },
  categories: ["Bank count", "Non-bank count", "Bank value", "Non-bank value"],
  series: [{ name: "Share", values: [19.4, 80.6, 91.5, 8.5], fill: "#002060", points: [{ idx: 1, fill: "#E97132" }, { idx: 3, fill: "#E97132" }] }],
  hasLegend: false,
  barOptions: { direction: "column", grouping: "clustered", gapWidth: 55, varyColors: true },
  dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 9, bold: true, fill: "#30343B" } },
  xAxis: { textStyle: { typeface: "Calibri", fontSize: 8, fill: "#595959" }, majorGridlines: null },
  yAxis: { min: 0, max: 100, majorUnit: 25, numberFormatCode: "0", textStyle: { typeface: "Calibri", fontSize: 8, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
setSlideNotes(deck.slides.items[1], "Fintech Owns Frequency; Banks Still Own Value", [
  "PBOC 2013 payment-system report: https://www.gov.cn/gzdt/att/att/site1/20140217/782bcb8883ce146be61101.pdf",
  "PBOC 2023 definitions and overlap footnotes: https://www.pbc.gov.cn/zhifujiesuansi/128525/128545/128643/e65053157ab14b9abf06bc9b18badb3a/2024032815235914509.pdf",
  "2025 data reproduced in Cuiwei filing: https://static.cninfo.com.cn/finalpage/2026-03-28/1225042491.PDF",
], "The displayed shares combine overlapping PBOC bank-electronic and non-bank network-payment series. They are a mechanical activity index, not mutually exclusive ownership shares.");
console.log("stage: slide2");

// Slide 3 — exact large-left/two-right layout for the four layers of market share.
setText("sh/cza94vmx", "FOUR-LAYER MARKET");
setText("sh/d0jax03i", "China Finance Splits Across Four Layers");
setText("sh/298ryl4v", "Interface, activity, clearing and settlement produce different winners.");
setText("sh/3ah8rqlg", "Sources: AMRO; IMF; PBOC; NetsUnion statistics; NBS; internal calculations. Each layer uses a different denominator.");
setText("sh/n6ls3alk", "LEADING SHARE BY LAYER");
setText("sh/943mhgre", "");
setText("sh/a5c3ql8z", "2025 ACTIVITY COUNT");
clearText(["sh/e10f2twf", "sh/f29gbyx0"]);
setText("sh/6d0fytg3", "AVERAGE TICKET");
setText("sh/sfix03y9", "Bank channels move larger-value money; wallets win daily frequency.");

deck.delete(["ch/7idk7y9c", "ch/h8v2d8re", "ch/r2ho32tg"]);
const slide3 = deck.slides.items[2];
slide3.charts.add("bar", {
  position: { left: 72.96, top: 167.04, width: 658.56, height: 476.16 },
  title: "Leading share by market layer, 2024–2025 (%)",
  titleTextStyle: { typeface: "Calibri", fontSize: 12, bold: true, fill: "#30343B" },
  categories: ["Wallet interface¹", "Non-bank activity count²", "NetsUnion clearing count³", "Bank activity value²"],
  series: [{ name: "Leading share", values: [94.0, 80.6, 75.9, 91.5], fill: "#002060", points: [{ idx: 0, fill: "#E97132" }, { idx: 1, fill: "#E97132" }, { idx: 2, fill: "#7A838E" }] }],
  barOptions: { direction: "bar", grouping: "clustered", gapWidth: 55, varyColors: true },
  hasLegend: false,
  dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 10, bold: true, fill: "#30343B" } },
  xAxis: { min: 0, max: 100, majorUnit: 25, numberFormatCode: "0", textStyle: { typeface: "Calibri", fontSize: 9, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  yAxis: { textStyle: { typeface: "Calibri", fontSize: 10, fill: "#30343B" }, majorGridlines: null },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
slide3.charts.add("bar", {
  position: { left: 787.2, top: 167.04, width: 420.48, height: 165.12 },
  title: "Bank vs non-bank count share (%)",
  titleTextStyle: { typeface: "Calibri", fontSize: 10.5, bold: true, fill: "#30343B" },
  categories: ["2025"],
  series: [{ name: "Bank", values: [19.4], fill: "#002060" }, { name: "Non-bank", values: [80.6], fill: "#E97132" }],
  barOptions: { direction: "bar", grouping: "stacked", gapWidth: 75, overlap: 100 },
  hasLegend: true,
  legend: { position: "bottom", overlay: false, textStyle: { typeface: "Calibri", fontSize: 8.5, fill: "#595959" } },
  dataLabels: { showValue: true, position: "center", numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 9, bold: true, fill: "#FFFFFF" } },
  xAxis: { min: 0, max: 100, visible: false, majorGridlines: null },
  yAxis: { textStyle: { typeface: "Calibri", fontSize: 9, fill: "#595959" }, majorGridlines: null },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
slide3.charts.add("bar", {
  position: { left: 787.2, top: 393.6, width: 420.48, height: 201.6 },
  title: "Average transaction ticket, 2025 (RMB '000)",
  titleTextStyle: { typeface: "Calibri", fontSize: 10.5, bold: true, fill: "#30343B" },
  categories: ["Bank electronic", "Non-bank network"],
  series: [{ name: "RMB '000", values: [11.332, 0.255], fill: "#002060", points: [{ idx: 1, fill: "#E97132" }] }],
  barOptions: { direction: "bar", grouping: "clustered", gapWidth: 60, varyColors: true },
  hasLegend: false,
  dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.000", textStyle: { typeface: "Calibri", fontSize: 9, bold: true, fill: "#30343B" } },
  xAxis: { min: 0, numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 8, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  yAxis: { textStyle: { typeface: "Calibri", fontSize: 9, fill: "#30343B" }, majorGridlines: null },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
setSlideNotes(deck.slides.items[2], "China Finance Splits Across Four Layers", [
  "AMRO 2025: https://amro-asia.org/wp-content/uploads/2025/10/AMRO-AFSR-2025-Full-Report-Web.pdf",
  "PBOC/Cuiwei 2025 activity data: https://static.cninfo.com.cn/finalpage/2026-03-28/1225042491.PDF",
  "NBS 2025 communiqué: https://www.stats.gov.cn/english/PressRelease/202602/t20260228_1962661.html",
], "1 Alipay plus WeChat Pay estimate. 2 Mechanical combined-series index. 3 Clearing-rail share. Denominators differ and must not be summed.");
console.log("stage: slide3");

// Slide 4 — preserve the two-chart plus balance-sheet-capacity layout.
setText("sh/1cj2d8b6", "BANKING CAPACITY");
setText("sh/0ba143al", "Banks Still Own the Balance Sheet");
setText("sh/rm1k7yt4", "Assets quintupled while ROE halved and margins compressed.");
setText("sh/ql8jytsj", "Sources: CBRC/CBIRC/NFRA; NBS; Bloomberg workbook; internal calculations. 2025 values are full-year actuals.");
setText("sh/ih8ju9sn", "ASSET SCALE");
setText("sh/i94r6xgz", "2010–2025 CAGR: 11.4%");
setText("sh/x8vaxsfe", "PROFITABILITY");
setText("sh/h4fa9wfy", "2025 BALANCE-SHEET CAPACITY");
setText("sh/2xkrih8b", "Deposits and loans");
setText("sh/1wbapc7q", "RMB tn, end-2025");
setText("sh/fu9sn2p0", "Deposits");
setText("sh/et0reh8f", "336.1");
setText("sh/sri9s7q9", "Loans");
setText("sh/ilwf69kv", "275.7");
setText("sh/jm5gze1g", "RMB2.4tn");
setText("sh/knex8j21", "sector profit");
setText("sh/5ony1oj6", "Net interest margin");
setText("sh/axcf29kj", "2025");
setText("sh/xknyx4ja", "1.42%");
setText("sh/nulw7u18", "ROA 0.60%");
setText("sh/fm5c3q54", "7.78%");
setText("sh/elwba54j", "sector ROE");
setText("sh/18nu50nu", "Capital adequacy ratio");
setText("sh/0netcvm9", "2025");
setText("sh/dknu10ny", "15.46%");
setText("sh/3elcv65w", "NPL 1.50%");
setText("sh/idcb2lob", "4.9x");
setText("sh/8jq9c72t", "assets vs 2010");
setText("sh/tkjq5c3e", "2026 H1");
setText("sh/6x8rahk3", "latest system snapshot");
setText("sh/7ih83mlo", "RMB498tn");
setText("sh/gna9gr25", "total banking assets");

deck.delete(["ch/4vilwfe5", "ch/upg3qlw3"]);
const slide4 = deck.slides.items[3];
slide4.charts.add("bar", {
  position: { left: 72.96, top: 167.04, width: 539.52, height: 192 },
  title: "Banking-system assets (RMB tn)",
  titleTextStyle: { typeface: "Calibri", fontSize: 11, bold: true, fill: "#30343B" },
  categories: ["2010", "2015", "2020", "2025"],
  series: [{ name: "Assets", values: [95.3, 199.3, 319.7, 480.0], fill: "#002060" }],
  barOptions: { direction: "column", grouping: "clustered", gapWidth: 55 },
  hasLegend: false,
  dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 9, bold: true, fill: "#30343B" } },
  xAxis: { textStyle: { typeface: "Calibri", fontSize: 9, fill: "#595959" }, majorGridlines: null },
  yAxis: { min: 0, numberFormatCode: "0", textStyle: { typeface: "Calibri", fontSize: 8.5, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
slide4.charts.add("bar", {
  position: { left: 668.16, top: 167.04, width: 539.52, height: 192 },
  title: "Sector ROE (%)",
  titleTextStyle: { typeface: "Calibri", fontSize: 11, bold: true, fill: "#30343B" },
  categories: ["2010", "2020", "2023", "2024", "2025"],
  series: [{ name: "ROE", values: [17.5, 9.48, 8.93, 8.10, 7.78], fill: "#E97132" }],
  barOptions: { direction: "column", grouping: "clustered", gapWidth: 55 },
  hasLegend: false,
  dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 8.5, bold: true, fill: "#30343B" } },
  xAxis: { textStyle: { typeface: "Calibri", fontSize: 9, fill: "#595959" }, majorGridlines: null },
  yAxis: { min: 0, max: 20, majorUnit: 5, numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 8.5, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
setSlideNotes(deck.slides.items[3], "Banks Still Own the Balance Sheet", [
  "CBRC 2010 annual report: https://www.nfra.gov.cn/chinese/subject/subject/nianbao2010/english/1.pdf",
  "NFRA 2025 sector data: https://www.nfra.gov.cn/en/view/pages/ItemDetail.html?docId=1251267&itemId=980",
  "NBS 2025 communiqué: https://www.stats.gov.cn/english/PressRelease/202602/t20260228_1962661.html",
  "NFRA 2026 H1/Q2: https://www.nfra.gov.cn/en/view/pages/ItemDetail.html?docId=1270720",
]);
console.log("stage: slide4");

// Slide 5 — keep the template's wide top panel, but replace the chart with an editable bubble diagram.
setText("sh/dgbulwnm", "CLIENT JOURNEY");
setText("sh/cf2tcr61", "Clients Use Both Stacks");
setText("sh/z2tcnm5s", "Platforms own context; licensed institutions hold deposits, custody and most credit risk.");
setText("sh/yhkbe1o7", "Sources: CNNIC; NBS; Ant prospectus; WeBank and MYbank reports; Bloomberg Intelligence. Diagram is a functional map, not market share.");
setText("sh/m5kbi1oj", "CLIENT FUNCTION MAP");
deck.delete(["ch/g761grip", "sh/x4vedgvm", "sh/ahkvi1cb", "sh/v2twb6dw", "sh/k7mxovud", "sh/58vehgvy", "sh/i54fmlc7", "sh/j6dwfqds"]);
const slide5 = deck.slides.items[4];
addBubble(slide5, { left: 145, top: 210, width: 430, height: 180, text: "BANK\nDeposits • custody • settlement\nLong-term / corporate credit", fill: "#002060/12", line: "#002060", fontSize: 12.5 });
addBubble(slide5, { left: 535, top: 210, width: 430, height: 180, text: "FINTECH\nDaily UX • discovery\nData • distribution", fill: "#E97132/15", line: "#E97132", fontSize: 12.5, textColor: "#9E3F13" });
addBubble(slide5, { left: 500, top: 238, width: 140, height: 82, text: "PAYMENTS", fill: "#FFFFFF/96", line: "#7A838E", fontSize: 10.5 });
addBubble(slide5, { left: 470, top: 305, width: 130, height: 70, text: "WEALTH", fill: "#FFFFFF/96", line: "#7A838E", fontSize: 10.5 });
addBubble(slide5, { left: 585, top: 305, width: 145, height: 70, text: "SHORT CREDIT", fill: "#FFFFFF/96", line: "#7A838E", fontSize: 10.5 });
addBubble(slide5, { left: 990, top: 240, width: 165, height: 110, text: "LICENSED\nHYBRID\nWeBank • MYbank", fill: "#7A838E/12", line: "#7A838E", fontSize: 11 });

setText("sh/hgrmpwj2", "DIGITAL BANK LOAN SCALE");
setText("sh/fe94nm1w", "");
deck.delete(["ch/0vm1sba1"]);
slide5.charts.add("bar", {
  position: { left: 72.96, top: 468.48, width: 485.76, height: 140.16 },
  title: "Reported loan balance (RMB bn)",
  titleTextStyle: { typeface: "Calibri", fontSize: 10.5, bold: true, fill: "#30343B" },
  categories: ["WeBank 2018", "WeBank 2024", "MYbank 2018", "MYbank 2024"],
  series: [{ name: "Loans", values: [120, 436, 48, 298.5], fill: "#002060", points: [{ idx: 1, fill: "#0070C0" }, { idx: 2, fill: "#7A838E" }, { idx: 3, fill: "#E97132" }] }],
  barOptions: { direction: "column", grouping: "clustered", gapWidth: 45, varyColors: true },
  hasLegend: false,
  dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 8.5, bold: true, fill: "#30343B" } },
  xAxis: { textStyle: { typeface: "Calibri", fontSize: 7.8, fill: "#595959" }, majorGridlines: null },
  yAxis: { min: 0, max: 500, majorUnit: 100, numberFormatCode: "0", textStyle: { typeface: "Calibri", fontSize: 8, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});

setText("sh/4ji5kbid", "HYBRID MODEL, 2024");
setText("sh/5o7mhcju", "WeBank");
setText("sh/kny587i9", "436bn");
setText("sh/atcjidg7", "loans");
setText("sh/vu5kbihc", "424m");
setText("sh/wve1knyx", "retail clients");
setText("sh/xwn2dszi", "MYbank");
setText("sh/ihw3mxg3", "299bn");
setText("sh/ji5kf2ho", "loans");
setText("sh/kjelony9", "MYbank clients");
setText("sh/5kn2hszu", "68m+");
setText("sh/e1sjatgz", "cumulative SMEs");
setText("sh/zmlk3yhk", "Client functions overlap; funding, custody and final risk-bearing remain concentrated in licensed institutions.");
setSlideNotes(slide5, "Clients Use Both Stacks", [
  "CNNIC historical multi-homing: https://www3.cnnic.cn/n4/2022/0401/c119-1026.html",
  "Ant prospectus: https://wynthia.com/wp-content/uploads/2020/09/ant-draft-ipo-prospectus-2020-08-read.pdf",
  "WeBank 2024 report: https://tctp.tctpwebankcdn.net/owb-admin/data/appsystems/owb-admin/1756804158938-13423.pdf",
  "MYbank 2024 report: https://qxb-pdf-osscache.qixin.com/AnBaseinfo/7f4fb677abdf6a905d911992520c8b93.pdf",
  "Bloomberg Intelligence, China fintech report, Nov 2019 (user-provided PDF 5).",
], "Reported digital-bank loan balances are company-filing / Bloomberg Intelligence figures. They are not comparable with platform-enabled origination volumes without a funding and risk-bearing bridge.");
console.log("stage: slide5");

// Slide 6 — preserve the two wide charts and the template's central sequence.
setText("sh/yhg7epsj", "PUBLIC-MARKET LENS");
setText("sh/zi98nu94", "The Market Prices Business Models, Not Categories");
setText("sh/87ipkzal", "Banks trade at a discount; platform returns command a premium; facilitators weakened in H1 2026.");
setText("sh/98rqt4r6", "Source: Bloomberg workbook supplied by user; internal cleaning and calculations. Valuation and ROE are 2025Q4 medians; earnings growth is H1 2026 actual.");
setText("sh/pc76hkr2", "VALUATION AND RETURNS");
setText("sh/w32twb6l", "FUNDING");
setText("sh/v2tcn650", "Banks");
setText("sh/5svutgni", "INTERFACE");
setText("sh/47mt0b6x", "Platforms");
setText("sh/i54bylor", "RISK / RULES");
setText("sh/twfux0ne", "Facilitators");
setText("sh/svmt4v6t", "");
setText("sh/qpwnet0b", "H1 2026 EARNINGS DISPERSION");

deck.delete(["ch/xoz218ry", "ch/ryp436hc"]);
const slide6 = deck.slides.items[5];
slide6.charts.add("bar", {
  position: { left: 72.96, top: 167.04, width: 1134.72, height: 174.72 },
  title: "2025Q4 median ROE (%) and trailing P/E (x)",
  titleTextStyle: { typeface: "Calibri", fontSize: 11, bold: true, fill: "#30343B" },
  categories: ["Banks ROE", "Fintech ROE", "Banks P/E", "Fintech P/E"],
  series: [{ name: "Median", values: [9.68, 14.78, 7.35, 17.29], fill: "#002060", points: [{ idx: 1, fill: "#E97132" }, { idx: 3, fill: "#E97132" }] }],
  barOptions: { direction: "column", grouping: "clustered", gapWidth: 55, varyColors: true },
  hasLegend: false,
  dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 9, bold: true, fill: "#30343B" } },
  xAxis: { textStyle: { typeface: "Calibri", fontSize: 9, fill: "#595959" }, majorGridlines: null },
  yAxis: { min: 0, max: 20, majorUnit: 5, numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 8.5, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
slide6.charts.add("bar", {
  position: { left: 72.96, top: 451.2, width: 1134.72, height: 192 },
  title: "Net income growth, H1 2026 (% YoY)",
  titleTextStyle: { typeface: "Calibri", fontSize: 11, bold: true, fill: "#30343B" },
  categories: ["Tencent", "East Money", "Qfin", "Lexin", "FinVolution"],
  series: [{ name: "Growth", values: [10.3, 44.8, -63.5, -67.9, -42.6], fill: "#E97132", points: [{ idx: 0, fill: "#002060" }, { idx: 1, fill: "#0070C0" }] }],
  barOptions: { direction: "column", grouping: "clustered", gapWidth: 50, varyColors: true },
  hasLegend: false,
  dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.0", textStyle: { typeface: "Calibri", fontSize: 9, bold: true, fill: "#30343B" } },
  xAxis: { textStyle: { typeface: "Calibri", fontSize: 9, fill: "#595959" }, majorGridlines: null },
  yAxis: { min: -80, max: 60, majorUnit: 20, numberFormatCode: "0", textStyle: { typeface: "Calibri", fontSize: 8.5, fill: "#595959" }, majorGridlines: { style: "solid", fill: "#D9D9D9", width: 1 } },
  chartFill: "transparent", chartLine: { style: "solid", fill: "transparent", width: 0.1 }, plotAreaFill: "transparent", plotAreaLine: { style: "solid", fill: "transparent", width: 0.1 },
});
setSlideNotes(deck.slides.items[5], "The Market Prices Business Models, Not Categories", [
  "User-provided Bloomberg workbook: TIM - 11.xlsx, Bank 1 and Fin sheets.",
  "Bank peer medians exclude the workbook's mislabeled 601995 / CICC block. Fintech valuation medians use names with populated fields.",
], "The fintech sample is heterogeneous and includes platforms, digital brokers, insurers and loan facilitators. Medians describe the supplied listed sample, not the whole sector.");
console.log("stage: slide6");

// Slide 7 — preserve the exact three-column template; replace dense holdings lists with bubble clusters.
setText("sh/cb2tkvap", " BUSINESS MODELS");
setText("sh/dcbud0ra", "Three Business Models; Three Different Risk Profiles");
setText("sh/ydkbm5sv", "Funding control and interface control determine the investment case.");
setText("sh/zedcfa9g", "Source: company filings; Bloomberg workbook; regulatory chronology; internal synthesis. Bubble size is qualitative, not market share.");
setText("sh/baxkjqlk", "BALANCE SHEET");
setText("sh/a9ojq5kz", "Large banks / CMB");
setText("sh/xcz2l03q", "Cheap valuation | yield | policy exposure");
setText("sh/obitsrup", "HYBRID");
setText("sh/betc36tg", "WeBank / MYbank / East Money");
setText("sh/adkbu1cv", "Preferred structure | two or more advantages");
setText("sh/14zytsfq", "PLATFORM");
setText("sh/0jqx0ne5", "Tencent / Ant / loan facilitators");
setText("sh/je1g3mx4", "Selective | transparency and funding matter");

const slide7Delete = [
  "ch/0vqt0je5","sh/n6x0fqlo","sh/25ojml43","sh/p8fih03e","sh/o761ov2t","sh/f2d0b6lc","sh/eh4jil4r","sh/id4ju1oz","sh/jedkn654","sh/4fm1wb6p","sh/50v2pgna","sh/q143ylov","sh/r2dkrq5g","sh/s3ml0v61","sh/d4f2t0nm","sh/e5o32lor","sh/f6xkvq5c","sh/p0zmlk7u","sh/ozq5szq9","sh/nyh4jupo","sh/2x8nqp83","sh/x4j6p47q","sh/c3a5wzq5","sh/b2h4nupk","sh/a18nup8z","sh/lsj6t47m","sh/kra50jqh","sh/wneps3ap","sh/honq18ru","sh/ulc7qdsj","sh/vm58zi94","sh/8jupo3ad","sh/9k3qx8ry","sh/mxc7mts7","sh/7yl8vy9s","sh/sfy907ah","sh/tg7q9sr2","sh/na9sz6tk","sh/290bq1cz",
  "ch/lcvu9o7i","sh/cf2twbu1","sh/ripsrmtc","sh/6hgbihcr","sh/uponm90b","sh/vah4fehw","sh/gbq5ojih","sh/hczmhoz2","sh/6loni90f","sh/7mx4buh0","sh/8n65kzil","sh/tofmd4z6","sh/yh4nep0j","sh/jix47uho","sh/1c3qdsj6","sh/0bupkn21","sh/fal8bi1g","sh/e9c7ixkv","sh/d8jq9sja","sh/s7apgn2p","sh/r6187i14","sh/q5s7edkj","sh/54jq58je","sh/4japc32t","sh/gj2doje1","sh/hkvuxovm","sh/uhkvm9wv","sh/fitcvedg","sh/4nmdsjux","sh/povu1ovi","sh/2l4vqtc7","sh/3mdczydc","sh/cb6dw3u9","sh/dcfe58vu","sh/n6hgv2xw","sh/m58f2xwb","sh/98zyxcf2","sh/o7qx47eh","sh/zixgr2xk",
  "ch/6xsri58j","sh/v258jm1o","sh/u1wrqh03","sh/h4nqlwju","sh/w3e9sri9","sh/j6p8nm1k","sh/i5wruh0f","sh/587apwjq","sh/47y9wri5","sh/zal8b21g","sh/y9crix0v","sh/ofa5s3yt","sh/pgj6l8ze","sh/2d8nqtgn","sh/nehojyh8","sh/0bq5ojyx","sh/1cz6hoz2","sh/e98nm9gr","sh/fahofehc","sh/k7up0ny1","sh/l836tszm","sh/t4z6d8rq","sh/83q5knq5","sh/72hobi9k","sh/61onid8z","sh/l0f698re","sh/kz65g3q9","sh/jyxo7y9o","sh/yxonet83","sh/xwf65ori","sh/wv65c3qx","sh/m1k36pov","sh/n2dkfupg","sh/o3ml8z61","sh/94v2h476","sh/edk32poj",
  "sh/zetkbup4","sh/0z2l4z6p","sh/10b2dk7a","sh/q903y5on","sh/ra9k7ap8","sh/jmtgjqto","sh/i1kzalsj","sh/5ovilgru","sh/4n2hcva9"
];
deck.delete(slide7Delete);
const slide7 = deck.slides.items[6];
addBubble(slide7, { left: 105, top: 260, width: 165, height: 165, text: "FUNDING", fill: "#002060/15", line: "#002060", fontSize: 14 });
addBubble(slide7, { left: 230, top: 315, width: 120, height: 120, text: "LICENCE", fill: "#7A838E/15", line: "#7A838E", fontSize: 12 });
addBubble(slide7, { left: 150, top: 405, width: 115, height: 95, text: "INTERFACE", fill: "#E97132/12", line: "#E97132", fontSize: 9.5, textColor: "#9E3F13" });
addBubble(slide7, { left: 525, top: 270, width: 135, height: 135, text: "FUNDING", fill: "#002060/14", line: "#002060", fontSize: 12.5 });
addBubble(slide7, { left: 635, top: 300, width: 135, height: 135, text: "LICENCE", fill: "#7A838E/14", line: "#7A838E", fontSize: 12.5 });
addBubble(slide7, { left: 575, top: 405, width: 135, height: 135, text: "INTERFACE", fill: "#E97132/14", line: "#E97132", fontSize: 12, textColor: "#9E3F13" });
addBubble(slide7, { left: 925, top: 255, width: 175, height: 175, text: "INTERFACE", fill: "#E97132/16", line: "#E97132", fontSize: 14, textColor: "#9E3F13" });
addBubble(slide7, { left: 1055, top: 330, width: 115, height: 115, text: "REGULATION\n+ FUNDING", fill: "#7A838E/14", line: "#7A838E", fontSize: 10.5 });
addBubble(slide7, { left: 970, top: 420, width: 105, height: 105, text: "LICENCE", fill: "#002060/10", line: "#002060", fontSize: 11 });
setSlideNotes(slide7, "Three Business Models; Three Different Risk Profiles", [
  "Bloomberg workbook supplied by user for listed bank and fintech valuation/financial comparisons.",
  "WeBank and MYbank company reports; Ant prospectus; Tencent and East Money filings.",
  "NFRA/PBOC 2020–2026 regulatory chronology.",
], "Bubble size is a qualitative depiction of relative business-model emphasis, not a quantitative market-share or valuation measure.");
console.log("stage: slide7");

// Slide 8 — preserve the original minimalist close.
const closeTitle = setText("sh/ri9g7uhw", "Thank you");
closeTitle.text.style = { typeface: "Calibri" };
const closeSubtitle = setText("sh/6h0fypgb", "China banks vs fintech | 2010 to H1 2026");
closeSubtitle.text.style = { typeface: "Calibri" };
setSlideNotes(deck.slides.items[7], "Thank you", [
  "Analysis based on PBOC, NFRA/CBRC/CBIRC, NBS, company filings, Bloomberg Intelligence PDFs and the user-provided Bloomberg workbook.",
]);
console.log("stage: slide8");

await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });
await (await PresentationFile.exportPptx(deck)).save(candidatePath);
console.log("stage: exported candidate");

const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
const requirements = {
  explicitTotalSlideCount: 8,
  requiredNativeChartOwnerSlides: [2, 3, 4, 5, 6],
  requiredNativeTableOwnerSlides: [],
  materializeLiteralChartWorkbooks: true,
};
const fontPolicy = {
  basis: "reference",
  families: ["Calibri"],
  referencePath,
  referenceSha256: "b7091b799d8638ce164d4e8ac2ba4530cdebd3693b372f373858cc102f29edc9",
};
const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", expectedSlideSizeEmu,
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "China_Banks_vs_Fintech_Exact_Template_2026_v2.validation.json"),
});

console.log(JSON.stringify({ finalPath, result }, null, 2));
