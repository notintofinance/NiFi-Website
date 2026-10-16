import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const p=await PresentationFile.importPptx(await FileBlob.load("/Users/agatbe/BCA Internship/Credit - Analysis/HRTA - Credit Analysis PPT.pptx"));
const s=p.slides.getItem(0);
const c=s.charts.items[0];
function chain(obj){const out=[];let cur=obj;for(let i=0;cur&&i<5;i++,cur=Object.getPrototypeOf(cur)){out.push(Object.getOwnPropertyNames(cur));}return out;}
console.log(JSON.stringify({charts:chain(s.charts),chart:chain(c),slideShapes:chain(s.shapes)},null,2));
