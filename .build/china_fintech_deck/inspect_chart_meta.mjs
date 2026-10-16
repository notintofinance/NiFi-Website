import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const deck = await PresentationFile.importPptx(await FileBlob.load(
  "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/.build/china_fintech_deck/template-sanitized.pptx",
));

for (const [si, slide] of deck.slides.items.entries()) {
  console.log(`SLIDE ${si + 1}`);
  for (const [ci, chart] of slide.charts.items.entries()) {
    console.log(JSON.stringify({
      index: ci + 1,
      type: chart.chartType,
      position: chart.position,
      title: chart.title,
      categories: chart.categories,
      series: chart.series.items.map((s) => ({
        name: s.name,
        values: s.values,
        xValues: s.xValues,
      })),
      hasLegend: chart.hasLegend,
      barOptions: chart.barOptions,
      doughnutOptions: chart.doughnutOptions,
    }, null, 2));
  }
}
