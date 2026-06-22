// =============================================================
//  Research Library — single source of truth
// -------------------------------------------------------------
//  To publish a new report:
//    1. Drop the PDF into  /public/research/
//    2. Add a new object to the array below.
//
//  Fields:
//    id       — unique slug (used as the React key)
//    title    — display title of the report
//    category — short tag shown on the card (e.g. "Equity", "Macro")
//    date     — ISO date "YYYY-MM-DD" (formatted automatically in the UI)
//    summary  — one-line description shown on the card
//    file     — path to the PDF inside /public  (must start with "/research/")
//    cover    — path to the cover-slide image shown as the card preview
//               (a JPG of the PDF's first page in /public/research/covers/)
// =============================================================

export const researchReports = [
  {
    id: "indonesiawit-palm-oil",
    title: "The Greatest of Indonesiawit",
    category: "Commodities",
    date: "2026-05-11",
    summary:
      "A closer look at Indonesia's palm oil (sawit) sector, the country's commodity powerhouse, and the case for it.",
    file: "/research/indonesiawit-palm-oil.pdf",
    cover: "/research/covers/indonesiawit-palm-oil.jpg",
  },
  {
    id: "new-alternative-energy",
    title: "The New Alternative Energy",
    category: "Energy",
    date: "2026-05-20",
    summary:
      "A look at the next wave of alternative and renewable energy, and where the opportunity may be heading.",
    file: "/research/new-alternative-energy.pdf",
    cover: "/research/covers/new-alternative-energy.jpg",
  },
  {
    id: "lpck-lippo-cikarang",
    title: "LPCK: Lippo Cikarang",
    category: "Property",
    date: "2026-04-12",
    summary:
      "An equity deep dive into Lippo Cikarang (LPCK), the industrial-estate and property developer.",
    file: "/research/lpck-lippo-cikarang.pdf",
    cover: "/research/covers/lpck-lippo-cikarang.jpg",
  },
  {
    id: "amman-aku-kamu-amman",
    title: "Aku, Kamu, AMMAN",
    category: "Mining",
    date: "2026-03-24",
    summary:
      "Inside Amman Mineral (AMMN), Indonesia's copper and gold giant, and the long-term thinking behind it.",
    file: "/research/amman-aku-kamu-amman.pdf",
    cover: "/research/covers/amman-aku-kamu-amman.jpg",
  },
  {
    id: "pbrx-garment-giant",
    title: "PBRX: The Comeback of The Garment Giant",
    category: "Manufacturing",
    date: "2026-03-19",
    summary:
      "Pan Brothers (PBRX): can the garment manufacturer stage a turnaround? The full equity research breakdown.",
    file: "/research/pbrx-garment-giant.pdf",
    cover: "/research/covers/pbrx-garment-giant.jpg",
  },
];

// Optional helper: returns the list sorted newest-first.
export const getReportsByDate = () =>
  [...researchReports].sort((a, b) => new Date(b.date) - new Date(a.date));
