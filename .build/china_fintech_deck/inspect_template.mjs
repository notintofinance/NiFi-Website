import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const sourcePath = "/Users/agatbe/BCA Internship/Bonds x Mutual Fund/Market Update - 29 September 2026.pptx";
const importPath = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/.build/china_fintech_deck/template-sanitized.pptx";
const outputDir = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/.build/china_fintech_deck/template_inspection";

async function saveBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

await fs.mkdir(outputDir, { recursive: true });
const sourceBytes = await fs.readFile(sourcePath);
const sourceSha256 = crypto.createHash("sha256").update(sourceBytes).digest("hex");
const presentation = await PresentationFile.importPptx(await FileBlob.load(importPath));

const content = await presentation.inspect({
  select: "$.slides[*]",
  include: [
    "id", "index", "layout", "title", "position",
    "elements.id", "elements.kind", "elements.name", "elements.text",
    "elements.position", "elements.style", "elements.paragraphs",
    "notes.text",
  ],
});
await fs.writeFile(path.join(outputDir, "template-content.ndjson"), content.ndjson, "utf8");

const layout = await presentation.inspect({
  select: "$.slides[*]",
  include: ["id", "index", "layout", "position", "elements.id", "elements.kind", "elements.name", "elements.position", "elements.style"],
});
await fs.writeFile(path.join(outputDir, "template-layout.ndjson"), layout.ndjson, "utf8");

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await saveBlob(path.join(outputDir, `${stem}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
  const detail = await slide.export({ format: "layout", detail: "full" });
  await fs.writeFile(path.join(outputDir, `${stem}.layout.json`), await detail.text(), "utf8");
}

await saveBlob(path.join(outputDir, "template-montage.webp"), await presentation.export({ format: "webp", montage: true, scale: 1 }));

const masters = presentation.masters.items.map((master) => ({
  id: master.id,
  name: master.name,
}));
const layouts = presentation.layouts.items.map((item) => ({
  id: item.id,
  name: item.name,
  placeholders: item.placeholders.summary(),
}));

const summary = {
  sourcePath,
  importPath,
  sourceSha256,
  slideCount: presentation.slides.items.length,
  masters,
  layouts,
  contentRecordCount: content.recordCount,
  layoutRecordCount: layout.recordCount,
};
await fs.writeFile(path.join(outputDir, "template-summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
