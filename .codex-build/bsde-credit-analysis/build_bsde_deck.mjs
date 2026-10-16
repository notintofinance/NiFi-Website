import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const SKILL_DIR = "/Users/agatbe/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations";
const RUNTIME_PYTHON = "/Users/agatbe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const workspaceDir = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)";
const sourcePath = "/Users/agatbe/BCA Internship/Credit - Analysis/HRTA - Credit Analysis PPT.pptx";
const buildDir = path.join(workspaceDir, ".codex-build/bsde-credit-analysis/build");
const stagingDir = path.join(workspaceDir, ".codex-finalizer/bsde-credit-analysis");
const previewDir = path.join(buildDir, "preview");
const finalPath = path.join(workspaceDir, "output/BSDE - Credit Analysis PPT v3.pptx");
const candidatePath = path.join(stagingDir, "candidate.pptx");

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });

const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));

const annualDates = ["2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"];
const annual = {
  "Revenue": [6209574.0723,6602955.2794,10347343.1922,6628782.185,7084864.0386,6180589.0861,7654802.251,10235479.9557,11539141.2502,13796572.1488,12788452.3367],
  "Capital Expenditures": [-143094.7043,-129290.3486,-79649.1091,-42038.6942,-384767.0573,-132542.1418,-23182.5909,-198459.2147,-577124.8988,-822574.9411,-322805.879],
  "Net Income/Net Profit (Losses)": [2139496.5977,1796156.479,4920228.0553,1293850.2226,2791416.3264,281700.8887,1348623.0381,2433146.9054,1945467.4413,4359063.784,2545380.7191],
  "Total Assets": [36022148.4896,38536825.1802,45951188.4752,52190720.0081,54540978.398,60862926.5868,61469712.1657,64999403.4808,66827648.4864,76023348.8868,79268402.201],
  "Total Liabilities": [13925458.0063,14074217.8743,16754337.3859,21832718.5041,20915564.0993,26391824.1109,25575995.1518,26953967.353,25626062.2827,28704020.7328,26599497.5167],
  "Total Equity": [22096690.4833,24462607.3059,29196851.0892,30358001.5039,33625414.2987,34471102.4758,35893717.0138,38045436.1278,41201586.2037,47319328.154,52668904.6843],
  "Net Debt": [1132372.2885,3457406.1819,2520674.0488,3430445.2051,3184765.0044,1918687.6602,153731.6231,38630.0655,1025232.6556,3454295.1019,4614035.5486],
  "Cash From Operations": [-366494.0572,-605189.8948,4606851.2409,1125468.0912,2557655.4101,1103950.6901,2887014.8893,2816809.5983,1207984.6493,1046659.7066,-1351699.4876],
  "Free Cash Flow": [-509588.7615,-734480.2434,4527202.1318,1083429.397,2172888.3527,971408.5482,2863832.2984,2618350.3837,630859.7505,224084.7655,-1674505.3666],
  "Return on Assets": [6.6621,4.8181,11.6472,2.6367,5.2307,0.4882,2.2048,3.8478,2.9515,6.103,3.2782],
  "Return on Common Equity": [12.5124,9.0967,21.4005,5.0225,10.0758,0.9493,4.3804,7.4759,5.5499,11.2736,6.0117],
  "Profit Margin": [34.4548,27.2023,47.5506,19.5187,39.3997,4.5578,17.618,23.7717,16.8597,31.5953,19.9037],
  "Total Debt to Total Equity": [35.8646,31.304,31.0926,45.9566,39.872,49.6679,33.417,31.4832,28.7199,30.5526,31.1426],
  "Financial Leverage": [1.8781,1.888,1.8374,1.9048,1.9263,1.9446,1.9867,1.9429,1.8803,1.8472,1.8338],
  "Quick Ratio": [1.1282,0.809,0.9311,1.5144,1.6126,1.1338,1.0919,1.0695,0.9304,0.7754,1.2315],
};

const quarterDates = ["4Q23","1Q24","2Q24","3Q24","4Q24","1Q25","2Q25","3Q25","4Q25","1Q26","2Q26"];
const quarter = {
  "Revenue": [4230823.246,3774499.9302,3572133.0286,2720373.5997,3729565.5903,2700904.0149,3689852.4685,2372024.7321,4025671.1212,2368795.9704,2382857.1253],
  "Capital Expenditures": [-234074.8642,-112485.0727,-107952.646,-304506.7348,-297630.4876,-95354.4687,-87216.8876,-78447.6843,-61865.5295,-40092.1894,-67771.2597],
  "Net Income/Net Profit (Losses)": [176421.4468,1436953.1803,896097.2525,368868.0291,1657145.3221,305874.2582,982173.6425,75523.3454,1181809.473,277628.6476,326267.3773],
  "Total Assets": [66827648.4864,67653911.8028,67862665.4221,68466170.2821,76023348.8868,75916736.8085,76641008.5958,77400079.5584,79268402.201,80125884.8966,81942880.5838],
  "Total Liabilities": [25626062.2827,24935494.6977,24310502.8588,24632854.2778,28704020.7328,27469342.346,25905271.5313,26075586.0912,26599497.5167,27257461.8815,28788877.3358],
  "Total Equity": [41201586.2037,42718417.105,43552162.5633,43833316.0044,47319328.154,48447394.4625,50735737.0644,51324493.4672,52668904.6843,52868423.0151,53154003.248],
  "Net Debt": [1025232.6556,1263661.3173,1329674.014,2194292.9687,3454295.1019,3741557.7763,1746344.9947,4162834.4183,4614035.5486,6250118.9962,8761255.2528],
  "Cash From Operations": [410737.0745,-27801.7575,899529.551,449588.7399,-274656.8268,-491662.1206,-472830.8513,-362085.7854,-25120.7303,-816556.7214,-554186.5045],
  "Free Cash Flow": [176662.2103,-140286.8302,791576.905,145082.0051,-572287.3144,-587016.5893,-560047.7388,-440533.4697,-86986.2599,-856648.9108,-621957.7642],
  "Return on Assets": [2.9515,3.6833,4.5429,4.1243,6.103,4.4967,4.5868,4.1418,3.2782,3.2262,2.3473],
  "Return on Common Equity": [5.5499,6.8436,8.2816,7.6518,11.2736,8.1219,8.1411,7.3811,6.0117,5.8567,4.2605],
  "Profit Margin": [4.1699,38.07,25.0858,13.5595,44.4327,11.3249,26.6182,3.1839,29.3568,11.7202,13.6923],
  "Total Debt to Total Equity": [28.7199,28.8212,27.7784,26.514,30.5526,28.3662,25.2642,29.1462,31.1426,33.0495,35.1641],
  "Financial Leverage": [1.9023,1.8085,1.7656,1.7466,1.8049,1.8426,1.8129,1.8078,1.8117,1.8077,1.8174],
  "Quick Ratio": [0.9304,0.9117,0.872,0.7252,0.7754,0.7991,0.9412,0.985,1.2315,1.2829,1.0829],
};

const rowLabels = [
  "Revenue", "Capital Expenditures", "Net Income/Net Profit (Losses)",
  "Total Assets", "Total Liabilities", "Total Equity", "Net Debt",
  "Cash From Operations", "Free Cash Flow", "Return on Assets",
  "Return on Common Equity", "Profit Margin", "Total Debt to Total Equity",
  "Financial Leverage", "Quick Ratio", "Profit Margin",
];
const ratioRows = new Set([
  "Return on Assets", "Return on Common Equity", "Profit Margin",
  "Total Debt to Total Equity", "Financial Leverage", "Quick Ratio",
]);
const flowRows = new Set([
  "Revenue", "Capital Expenditures", "Net Income/Net Profit (Losses)",
  "Cash From Operations", "Free Cash Flow",
]);

function formatNumber(value, isRatio = false) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  if (isRatio) return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const abs = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `(${abs})` : abs;
}
function sumLastTwo(values) { return values.at(-2) + values.at(-1); }
function h1Value(label) {
  if (flowRows.has(label)) return sumLastTwo(quarter[label]);
  if (label === "Profit Margin") {
    return 100 * sumLastTwo(quarter["Net Income/Net Profit (Losses)"]) / sumLastTwo(quarter["Revenue"]);
  }
  return quarter[label].at(-1);
}
function titleCaseSeries(series, name, categories, values) {
  series.name = name;
  series.categories = [...categories];
  series.values = values.map(value => Math.round(value * 100) / 100);
}
function findChart(slide, title) {
  const chart = slide.charts.items.find(item => item.title === title);
  if (!chart) throw new Error(`Chart not found: ${title}`);
  return chart;
}

const snap = await presentation.inspect({ kind: "textbox", maxChars: 50000 });
const records = snap.ndjson.trim().split("\n").filter(Boolean).map(JSON.parse);
const textRecord = (slide, name) => {
  const rec = records.find(r => r.kind === "textbox" && r.slide === slide && r.name === name);
  if (!rec) throw new Error(`Textbox not found: slide ${slide} ${name}`);
  return rec;
};

for (const rec of records.filter(r => r.kind === "textbox" && r.textPreview?.includes("Hartadinata Abadi"))) {
  const shape = presentation.resolve(rec.id);
  shape.text.replace("Hartadinata Abadi", "Bumi Serpong Damai");
  shape.text.replace("idA+", "idAA");
}

const narrative = presentation.resolve(textRecord(1, "TextBox 8").id);
narrative.text.set([
  [{ run: "Profitability:", textStyle: { bold: true, italic: true, fontSize: "16pt", typeface: "Aptos", color: "#FFFFFF" } }],
  { bulletCharacter: "•", marginLeft: 22 * 12700, indent: -12 * 12700, runs: [{ run: "FY25 revenue turun 7,3% menjadi Rp12,79 triliun dan laba bersih turun 41,6% menjadi Rp2,55 triliun. FY24 mencakup bargain purchase gain Rp1,55 triliun, sehingga penurunan laba underlying diperkirakan sekitar 9,5%. Pada 1H26, revenue turun 25,6% dan laba bersih turun 53,1%, tetapi gross margin naik dari 63,5% menjadi 66,5% dan recurring revenue tumbuh 19%.", textStyle: { fontSize: "14pt", typeface: "Aptos", color: "#FFFFFF" } }] },
  [{ run: "Solvency:", textStyle: { bold: true, italic: true, fontSize: "16pt", typeface: "Aptos", color: "#FFFFFF" } }],
  { bulletCharacter: "•", marginLeft: 22 * 12700, indent: -12 * 12700, runs: [{ run: "Net debt meningkat dari Rp4,61 triliun pada FY25 menjadi Rp8,76 triliun pada 1H26. Debt-to-Equity naik dari 31,1% menjadi 35,2% dan net debt-to-equity mencapai 16,4%. Quick ratio turun menjadi 1,08x, tetapi current ratio masih 3,56x. PEFINDO mempertahankan rating idAA dengan outlook stabil, meski debt-to-EBITDA FY25 naik menjadi 3,5x.", textStyle: { fontSize: "14pt", typeface: "Aptos", color: "#FFFFFF" } }] },
  [{ run: "Free Cash Flow:", textStyle: { bold: true, italic: true, fontSize: "16pt", typeface: "Aptos", color: "#FFFFFF" } }],
  { bulletCharacter: "•", marginLeft: 22 * 12700, indent: -12 * 12700, runs: [{ run: "Free cash flow turun dari positif Rp224 miliar pada FY24 menjadi negatif Rp1,67 triliun pada FY25 dan negatif Rp1,48 triliun pada 1H26. Penerimaan pelanggan naik 15%, tetapi pembelian lahan mencapai Rp2,51 triliun. Marketing sales Rp5,12 triliun telah memenuhi 51% target FY26. Revenue recognition dan stabilisasi net debt menjadi indikator utama 2H26.", textStyle: { fontSize: "14pt", typeface: "Aptos", color: "#FFFFFF" } }] },
]);
narrative.text.style = { typeface: "Aptos", color: "#FFFFFF", autoFit: "shrinkText" };

const slide2 = presentation.slides.getItem(1);
presentation.resolve(textRecord(2, "TextBox 9").id).text = "Yearly Performance";
presentation.resolve(textRecord(2, "TextBox 10").id).text = "Quarterly Performance";
const yearlyTable = slide2.tables.items[0];
const quarterlyTable = slide2.tables.items[1];
yearlyTable.getCell(0, 0).value = "Dates";
annualDates.forEach((date, c) => { yearlyTable.getCell(0, c + 1).value = date; });
rowLabels.forEach((label, r) => {
  yearlyTable.getCell(r + 1, 0).value = label;
  annual[label].forEach((value, c) => {
    yearlyTable.getCell(r + 1, c + 1).value = formatNumber(value, ratioRows.has(label));
  });
});
quarterlyTable.getCell(0, 0).value = "Dates";
[...quarterDates, "1H26"].forEach((date, c) => { quarterlyTable.getCell(0, c + 1).value = date; });
rowLabels.forEach((label, r) => {
  quarterlyTable.getCell(r + 1, 0).value = label;
  quarter[label].forEach((value, c) => {
    quarterlyTable.getCell(r + 1, c + 1).value = formatNumber(value, ratioRows.has(label));
  });
  quarterlyTable.getCell(r + 1, 12).value = formatNumber(h1Value(label), ratioRows.has(label));
});

const annualChartCategories = ["2017","2018","2019","2020","2021","2022","2023","2024","2025","1H26"];
const annualSlice = label => annual[label].slice(2);
const bn = values => values.map(v => v / 1000);
const tn = values => values.map(v => v / 1_000_000);

const slide1 = presentation.slides.getItem(0);
let chart = findChart(slide1, "Net Income");
chart.title = "Net Income (IDR Bn)";
titleCaseSeries(chart.series.items[0], "Net Income", annualChartCategories,
  [...bn(annualSlice("Net Income/Net Profit (Losses)")), h1Value("Net Income/Net Profit (Losses)") / 1000]);
chart = findChart(slide1, "Net Debt (IDR Bn)");
titleCaseSeries(chart.series.items[0], "Net Debt", annualChartCategories,
  [...bn(annualSlice("Net Debt")), h1Value("Net Debt") / 1000]);
chart = findChart(slide1, "Free Cash Flow (IDR Bn)");
titleCaseSeries(chart.series.items[0], "Free Cash Flow", annualChartCategories,
  [...bn(annualSlice("Free Cash Flow")), h1Value("Free Cash Flow") / 1000]);

const slide3 = presentation.slides.getItem(2);
presentation.resolve(textRecord(3, "TextBox 6").id).text = "Scale Metrics";
chart = findChart(slide3, "Production Volume (Kg)");
chart.title = "Revenue (IDR Tn)";
titleCaseSeries(chart.series.items[0], "Revenue", annualChartCategories,
  [...tn(annualSlice("Revenue")), h1Value("Revenue") / 1_000_000]);
chart = findChart(slide3, "Utilization Rate");
chart.title = "Total Assets (IDR Tn)";
titleCaseSeries(chart.series.items[0], "Total Assets", annualChartCategories,
  [...tn(annualSlice("Total Assets")), h1Value("Total Assets") / 1_000_000]);
chart = findChart(slide3, "Jewellery & Gold Bar Sales (Pure Gold Tonnes)");
chart.title = "Capital Structure (IDR Tn)";
titleCaseSeries(chart.series.items[0], "Total Equity", annualChartCategories,
  [...tn(annualSlice("Total Equity")), h1Value("Total Equity") / 1_000_000]);
titleCaseSeries(chart.series.items[1], "Total Liabilities", annualChartCategories,
  [...tn(annualSlice("Total Liabilities")), h1Value("Total Liabilities") / 1_000_000]);
chart = findChart(slide3, "Profit Margin (%)");
titleCaseSeries(chart.series.items[0], "Profit Margin (%)", annualChartCategories,
  [...annualSlice("Profit Margin"), h1Value("Profit Margin")]);
chart = findChart(slide3, "Return on Equity (%)");
titleCaseSeries(chart.series.items[0], "Return on Equity (%)", annualChartCategories,
  [...annualSlice("Return on Common Equity"), h1Value("Return on Common Equity")]);
chart = findChart(slide3, "Return on Assets (%)");
titleCaseSeries(chart.series.items[0], "Return on Assets (%)", annualChartCategories,
  [...annualSlice("Return on Assets"), h1Value("Return on Assets")]);

const slide4 = presentation.slides.getItem(3);
chart = findChart(slide4, "Quick Ratio (X)");
titleCaseSeries(chart.series.items[0], "Quick Ratio (X)", annualChartCategories,
  [...annualSlice("Quick Ratio"), h1Value("Quick Ratio")]);
chart = findChart(slide4, "Debt to Equity (%)");
titleCaseSeries(chart.series.items[0], "Debt to Equity (%)", annualChartCategories,
  [...annualSlice("Total Debt to Total Equity"), h1Value("Total Debt to Total Equity")]);
chart = findChart(slide4, "Financial Leverage (X)");
titleCaseSeries(chart.series.items[0], "Financial Leverage (X)", annualChartCategories,
  [...annualSlice("Financial Leverage"), h1Value("Financial Leverage")]);
chart = findChart(slide4, "Operating Cash Flow (IDR Bn)");
titleCaseSeries(chart.series.items[0], "Operating Cash Flow", annualChartCategories,
  [...bn(annualSlice("Cash From Operations")), h1Value("Cash From Operations") / 1000]);
chart = findChart(slide4, "Free Cash Flow (IDR Bn)");
titleCaseSeries(chart.series.items[0], "Free Cash Flow", annualChartCategories,
  [...bn(annualSlice("Free Cash Flow")), h1Value("Free Cash Flow") / 1000]);
chart = findChart(slide4, "Capital Expanditure (IDR Bn)");
chart.title = "Capital Expenditure (IDR Bn)";
titleCaseSeries(chart.series.items[0], "Capital Expenditure", annualChartCategories,
  [...bn(annualSlice("Capital Expenditures")), h1Value("Capital Expenditures") / 1000]);

slide1.speakerNotes.textFrame.setText([
  "Sources: /Users/agatbe/Downloads/TIM - 3.xlsx; BSDE Annual Report 2025; BSDE 1H26 Financial Statements and press release; PEFINDO Rating Summary dated 18 March 2026.",
  "https://www.bsdcity.com/app/uploads/2026/04/BSDE-Annual-Report-2025.pdf",
  "https://www.bsdcity.com/app/uploads/2026/07/BSDE-LK-Q2-2026.pdf",
  "https://cms.sinarmasland.com/uploads/BSDE_Press_Release_31_07_2026_8ec616fbb1.pdf",
]);
slide2.speakerNotes.textFrame.setText("Source: /Users/agatbe/Downloads/TIM - 3.xlsx. Figures are in IDR million unless stated otherwise. The 1H26 column aggregates 1Q26 and 2Q26 for P&L and cash flow items and uses 2Q26 ending balances for balance-sheet and ratio items.");
slide3.speakerNotes.textFrame.setText("Source: /Users/agatbe/Downloads/TIM - 3.xlsx. Annual data are FY figures; 1H26 revenue and profit margin are cumulative, while total assets, liabilities, equity, ROA and ROE use the latest 2Q26 workbook values.");
slide4.speakerNotes.textFrame.setText([
  "Source: /Users/agatbe/Downloads/TIM - 3.xlsx.",
  "Company-defined 1H26 capital expenditure was IDR3.25tn including IDR2.51tn of land purchases. The workbook capital-expenditure series excludes land purchases, which property developers classify in operating cash flow.",
  "https://cms.sinarmasland.com/uploads/BSDE_Press_Release_31_07_2026_8ec616fbb1.pdf",
]);

await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

// The reference deck stores chart values as caches but omits source workbooks.
// Convert cache-backed references to explicit literals so the finalizer can
// attach fresh, complete workbook snapshots for the updated BSDE data.
{
  const zip = await JSZip.loadAsync(await fs.readFile(candidatePath));
  const chartPaths = Object.keys(zip.files).filter(name => /^ppt\/slides\/charts\/chart\d+\.xml$/u.test(name));
  for (const chartPath of chartPaths) {
    let xml = await zip.file(chartPath).async("string");
    xml = xml.replace(
      /<c:strRef>\s*<c:f>[\s\S]*?<\/c:f>\s*<c:strCache>([\s\S]*?)<\/c:strCache>\s*<\/c:strRef>/gu,
      "<c:strLit>$1</c:strLit>",
    );
    xml = xml.replace(
      /<c:numRef>\s*<c:f>[\s\S]*?<\/c:f>\s*<c:numCache>([\s\S]*?)<\/c:numCache>\s*<\/c:numRef>/gu,
      "<c:numLit>$1</c:numLit>",
    );
    xml = xml.replace(
      /<c:tx>\s*<c:strLit>[\s\S]*?<c:pt\s+idx="0">\s*<c:v>([\s\S]*?)<\/c:v>\s*<\/c:pt>[\s\S]*?<\/c:strLit>\s*<\/c:tx>/gu,
      "<c:tx><c:v>$1</c:v></c:tx>",
    );
    if (xml.includes("<a:t>Total Assets (IDR Tn)</a:t>")) {
      xml = xml.replace(/<c:numFmt formatCode="0%" sourceLinked="0"\s*\/>/gu, '<c:numFmt formatCode="0.0" sourceLinked="0" />');
    }
    if (xml.includes("Operating Cash Flow (IDR Bn)") || xml.includes("Free Cash Flow (IDR Bn)")) {
      xml = xml.replace(/<c:numFmt formatCode="[^"]*" sourceLinked="0"\s*\/>/gu, '<c:numFmt formatCode="#,##0" sourceLinked="0" />');
      if (!/<c:dLbls>\s*<c:numFmt/gu.test(xml)) {
        xml = xml.replace("<c:dLbls>", '<c:dLbls><c:numFmt formatCode="#,##0" sourceLinked="0" />');
      }
      xml = xml.replace(/(<c:dLbls>[\s\S]*?<a:defRPr) sz="1000"/u, '$1 sz="800"');
    }
    zip.file(chartPath, xml);
  }
  await fs.writeFile(candidatePath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

for (let i = 0; i < presentation.slides.items.length; i++) {
  const slide = presentation.slides.getItem(i);
  const png = await slide.export({ format: "png", scale: 2 });
  await fs.writeFile(path.join(previewDir, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await png.arrayBuffer()));
}
const montage = await presentation.export({ format: "png", montage: true, scale: 1.5 });
await fs.writeFile(path.join(previewDir, "montage.png"), new Uint8Array(await montage.arrayBuffer()));

const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
const { finalizePresentation } = await import(pathToFileURL(
  path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs"),
).href);

const requirements = {
  explicitTotalSlideCount: 4,
  requiredNativeTableOwnerSlides: [2],
  requiredNativeChartOwnerSlides: [1, 3, 4],
  nativeChartTargetApplication: "portable",
  materializeLiteralChartWorkbooks: true,
};
const fontPolicy = {
  basis: "reference",
  families: ["Aptos", "Calibri"],
  referencePath: sourcePath,
  referenceSha256: sourceSha256,
};

const tableOwners = requirements.requiredNativeTableOwnerSlides;
const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    ...tableOwners.flatMap(number => ["--require-native-table-slide", String(number)]),
  ],
  requiredNativeTableOwnerSlides: tableOwners,
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, `${path.basename(finalPath)}.validation.json`),
});

console.log(JSON.stringify({ finalPath, candidatePath, previewDir, result }, null, 2));
