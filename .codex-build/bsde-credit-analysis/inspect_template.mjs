import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const source = "/Users/agatbe/BCA Internship/Credit - Analysis/HRTA - Credit Analysis PPT.pptx";
const outDir = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/.codex-build/bsde-credit-analysis/template-inspect";
await fs.mkdir(outDir, { recursive: true });
const presentation = await PresentationFile.importPptx(await FileBlob.load(source));

const snapshot = await presentation.inspect({
  kind: "deck,slide,textbox,shape,image,table,chart,notes,layout",
  include: "id,slide,name,title,text,textPreview,bbox,bboxUnit,rows,cols,chartType,alt,isPlaceholder,placeholders",
  maxChars: 100000,
});
await fs.writeFile(path.join(outDir, "inspect.ndjson"), snapshot.ndjson);

const montage = await presentation.export({ format: "png", montage: true, scale: 1.5 });
await fs.writeFile(path.join(outDir, "montage.png"), new Uint8Array(await montage.arrayBuffer()));

for (let i = 0; i < presentation.slides.items.length; i++) {
  const slide = presentation.slides.getItem(i);
  const preview = await slide.export({ format: "png", scale: 2 });
  await fs.writeFile(path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await preview.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.layout.json`), await layout.text());
}

console.log(JSON.stringify({ slideCount: presentation.slides.items.length, outDir }));
