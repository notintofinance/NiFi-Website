import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const source = "/Users/agatbe/BCA Internship/Credit - Analysis/HRTA - Credit Analysis PPT.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(source));

for (let i = 0; i < presentation.slides.items.length; i++) {
  const slide = presentation.slides.getItem(i);
  console.log(`SLIDE ${i + 1}`);
  console.log(`charts=${slide.charts.items.length} tables=${slide.tables.items.length}`);
  for (let j = 0; j < slide.charts.items.length; j++) {
    const c = slide.charts.items[j];
    const series = [];
    for (let k = 0; k < c.series.items.length; k++) {
      const s = c.series.items[k];
      series.push({name:s.name, categories:s.categories, values:s.values});
    }
    console.log(JSON.stringify({chart:j,title:c.title,chartType:c.chartType,categories:c.categories,series}, null, 2));
  }
  for (let j = 0; j < slide.tables.items.length; j++) {
    const t = slide.tables.items[j];
    const values = [];
    const colCount = (i === 1 && j === 0) ? 12 : 13;
    for (let r = 0; r < t.rows.length; r++) {
      const row = [];
      for (let c = 0; c < colCount; c++) row.push(t.getCell(r,c).value);
      values.push(row);
    }
    console.log(JSON.stringify({table:j,rows:t.rows.length,cols:colCount,values}, null, 2));
  }
}
