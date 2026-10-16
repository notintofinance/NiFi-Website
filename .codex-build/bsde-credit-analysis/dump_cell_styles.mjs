import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const source = "/Users/agatbe/BCA Internship/Credit - Analysis/HRTA - Credit Analysis PPT.pptx";
const p = await PresentationFile.importPptx(await FileBlob.load(source));
const s = p.slides.getItem(1);
for (let ti=0; ti<2; ti++) {
  const t=s.tables.items[ti];
  for (const [r,c] of [[0,0],[0,1],[1,1],[1,10],[2,1],[3,1],[8,1],[12,1]]) {
    const cell=t.getCell(r,c);
    console.log(JSON.stringify({ti,r,c,value:cell.value,fill:cell.fill,textStyle:cell.text?.style,margins:cell.margins,anchor:cell.anchor},null,2));
  }
}
