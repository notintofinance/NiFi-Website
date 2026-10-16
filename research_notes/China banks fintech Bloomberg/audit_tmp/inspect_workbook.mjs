import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/agatbe/Downloads/chinafintech/TIM - 11.xlsx";
const outPath = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/research_notes/China banks fintech Bloomberg/audit_tmp/artifact_summary.json";

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheetInspect = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 10000,
});

const overview = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 20000,
  tableMaxRows: 8,
  tableMaxCols: 10,
  tableMaxCellChars: 120,
});

const summaries = [];
for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange(false);
  const values = used?.values ?? [];
  const formulas = used?.formulas ?? [];
  let valueCells = 0;
  let formulaCells = 0;
  let errorCells = 0;
  const formulaSamples = [];
  for (let r = 0; r < values.length; r += 1) {
    for (let c = 0; c < (values[r]?.length ?? 0); c += 1) {
      const value = values[r][c];
      const formula = formulas[r]?.[c];
      if (value !== null && value !== "" && value !== undefined) valueCells += 1;
      if (typeof value === "string" && value.startsWith("#")) errorCells += 1;
      if (formula) {
        formulaCells += 1;
        if (formulaSamples.length < 15) formulaSamples.push({ row: r + 1, col: c + 1, formula, value });
      }
    }
  }
  summaries.push({
    name: sheet.name,
    sheetId: sheet.sheetId,
    usedRangeAddress: used?.address ?? null,
    rows: values.length,
    cols: Math.max(0, ...values.map((row) => row?.length ?? 0)),
    valueCells,
    formulaCells,
    errorCells,
    formulaSamples,
  });
}

await fs.writeFile(outPath, JSON.stringify({ sheetInspect: sheetInspect.ndjson, overview: overview.ndjson, summaries }, null, 2));
console.log(JSON.stringify({ outPath, summaries }, null, 2));
