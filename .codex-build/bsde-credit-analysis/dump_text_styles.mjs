import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const source = "/Users/agatbe/BCA Internship/Credit - Analysis/HRTA - Credit Analysis PPT.pptx";
const p = await PresentationFile.importPptx(await FileBlob.load(source));
const snap = await p.inspect({kind:"textbox",maxChars:20000});
for (const line of snap.ndjson.trim().split("\n")) {
  const rec=JSON.parse(line);
  if (rec.slide===1 && rec.name==="TextBox 8") {
    const sh=p.resolve(rec.id);
    console.log(JSON.stringify({id:rec.id,style:sh.text.style,frame:sh.frame,text:sh.text.toString?.() ?? sh.text},null,2));
  }
}
