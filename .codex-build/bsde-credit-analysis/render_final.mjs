import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const source = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/output/BSDE - Credit Analysis PPT v3.pptx";
const outDir = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/.codex-build/bsde-credit-analysis/final-render-v3";
await fs.mkdir(outDir, { recursive: true });
const p = await PresentationFile.importPptx(await FileBlob.load(source));
const snap = await p.inspect({kind:"deck,slide,textbox,table,chart,notes",maxChars:100000});
await fs.writeFile(path.join(outDir,"inspect.ndjson"),snap.ndjson);
const montage=await p.export({format:"png",montage:true,scale:1.5});
await fs.writeFile(path.join(outDir,"montage.png"),new Uint8Array(await montage.arrayBuffer()));
for(let i=0;i<p.slides.items.length;i++){
  const png=await p.slides.getItem(i).export({format:"png",scale:2});
  await fs.writeFile(path.join(outDir,`slide-${String(i+1).padStart(2,"0")}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log(JSON.stringify({slideCount:p.slides.items.length,outDir}));
