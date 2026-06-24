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
//    brief    — short paragraph shown in the click-to-preview popup
//    authors  — analyst names (shown as a byline)
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
    brief:
      "A deep dive into Indonesia's palm oil (sawit) industry, one of the country's commodity heavyweights. The report walks through how the sector works, the forces that move prices, and why it matters for the broader economy, all in plain language.",
    authors: ["Pandu Maulana Anwari", "Ahmad W. Aryana"],
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
    brief:
      "An accessible introduction to the next wave of alternative and renewable energy. The report maps the key technologies and trends shaping the space, and explores where the opportunities, and the risks, might be heading.",
    authors: ["Taufan Fadhillah", "Daffa Abiyyan"],
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
    brief:
      "An equity deep dive into Lippo Cikarang (LPCK), an industrial-estate and property developer. The report covers the company's landbank and business model, and frames the investment case in language anyone can follow.",
    authors: ["Taufan Fadhillah", "Agatbe Thymoty"],
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
    brief:
      "A deep dive into Amman Mineral (AMMN), one of Indonesia's largest copper and gold producers. The report walks through the company's assets, the long-term demand story behind the metals it mines, and the thinking that makes it worth following.",
    authors: ["Alief Randhinka Putra", "Agatbe Thymoty", "Ahmad W. Aryana"],
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
    brief:
      "The story of Pan Brothers (PBRX), one of Indonesia's largest garment manufacturers, and the question of whether it can stage a comeback. The report examines the business, the challenges it faces, and the turnaround thesis behind it.",
    authors: ["Taufan Fadhillah", "Agatbe Thymoty", "Ahmad W. Aryana"],
    file: "/research/pbrx-garment-giant.pdf",
    cover: "/research/covers/pbrx-garment-giant.jpg",
  },
];

// Optional helper: returns the list sorted newest-first.
export const getReportsByDate = () =>
  [...researchReports].sort((a, b) => new Date(b.date) - new Date(a.date));
