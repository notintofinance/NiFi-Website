import fs from "node:fs/promises";
import path from "node:path";

const chartsDir = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/.build/china_fintech_deck/template_unpacked/ppt/charts";
const files = (await fs.readdir(chartsDir)).filter((name) => /^chart\d+\.xml$/.test(name));
let replacements = 0;

for (const name of files) {
  const filePath = path.join(chartsDir, name);
  const source = await fs.readFile(filePath, "utf8");
  const updated = source.replace(/<(c:(?:axId|crossAx)) val="-(\d+)"\/>/g, (_, tag, digits) => {
    const unsigned = 4294967296n - BigInt(digits);
    replacements += 1;
    return `<${tag} val="${unsigned}"/>`;
  });
  if (updated !== source) await fs.writeFile(filePath, updated, "utf8");
}

console.log(JSON.stringify({ files: files.length, replacements }));
