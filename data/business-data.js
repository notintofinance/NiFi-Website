// =============================================================
//  For Business — single source of truth for services & partners
// -------------------------------------------------------------
//  Used by the Home services preview and the For Business page so
//  the two never drift apart.
//
//  Sources: NIFI Partnership Deck 2026 (output/pptx, output/pdf) —
//  "Place Your Brand Inside Research-Led Finance Content", the
//  tailored-package line (content series, classes & webinars,
//  community activations, event & bootcamp sponsorship), the track
//  record slide, and the industry-connections slide. Arthara's
//  description follows arthara.id. Prices and audience metrics in
//  the deck are intentionally NOT published here.
// =============================================================

export const services = [
  {
    id: "brand-placement",
    kind: "Service",
    title: "Brand Placement",
    short: "Your brand inside research-led content on NiFi’s channels.",
    lead: "Place your brand inside research-led finance content. Every placement is written and designed by the NiFi team in our research-led style, then published on NiFi’s channels.",
    includes: [
      "An Instagram feed post and a post on X, with copy and design by the NiFi team",
      "A short video on Instagram Reels, TikTok and X plus an Instagram feed post — scripted, filmed and edited by NiFi",
      "A brand mention and tag in the caption",
      "Optional paid promotion on top of our organic reach",
    ],
  },
  {
    id: "events",
    kind: "Service",
    title: "Event & Community Activation",
    short: "Sponsor NiFi events, bootcamps and community activations.",
    lead: "Meet NiFi’s community online, in person and on Discord. We run #NiFiBerbagi online class sessions and charity activities, bootcamps and meetups, and can tailor an activation around your goals.",
    includes: [
      "Event and bootcamp sponsorship",
      "Co-hosting or sponsoring an online class session",
      "Community activations on Discord and at NiFi meetups",
      "A scope agreed up front: what NiFi runs and what your team provides",
    ],
  },
  {
    id: "academy",
    kind: "Service",
    title: "NiFi Academy",
    short: "Online classes and an equity research incubation program.",
    lead: "NiFi Academy runs online class sessions led by practitioners, and an incubation program that trains students to write equity research for competitions, with mentors from the finance industry.",
    includes: [
      "Classes and webinars built with partners",
      "Speaker sessions with practitioners",
      "Sponsoring the Academy incubation program",
      "Hosting a company visit for Academy participants",
    ],
  },
  {
    id: "arthara",
    kind: "Platform",
    title: "Arthara",
    short: "NiFi’s stock analysis platform for Indonesian equities.",
    lead: "Arthara is NiFi’s stock analysis platform for Indonesian equities. It follows who is buying, selling and holding each IDX stock, alongside company filings and the macro picture.",
    includes: [],
  },
];

// Previous partnerships. White monochrome logos live in public/partners/mono
// (generated from the approved logos in public/partners). `relation` is only
// specific where the deck documents the relationship; otherwise it stays
// neutral, matching the deck's "Not Into Finance Partners" list.
export const partners = [
  // Partnership confirmed by NiFi (logo supplied by NiFi).
  { name: "Sucorwave", file: "sucorwave.png", w: 640, h: 127, relation: "Partner" },
  { name: "Ajaib", file: "ajaib.png", w: 267, h: 84, relation: "Partner" },
  { name: "Bitget Wallet", file: "bitget.png", w: 688, h: 116, relation: "Partner" },
  {
    name: "Samuel Sekuritas",
    file: "samuel-sekuritas.png",
    w: 252,
    h: 100,
    relation: "NiFi Academy keynote speaker",
  },
  {
    name: "Syailendra Capital",
    file: "syailendra.png",
    w: 196,
    h: 20,
    relation: "NiFi Academy keynote speaker",
  },
  { name: "Doo Financials", file: "doo-financials.png", w: 250, h: 69, relation: "Partner" },
  { name: "finplan.id", file: "finplan.png", w: 316, h: 90, relation: "Partner" },
  { name: "ICMSS UI", file: "icmss-ui.png", w: 220, h: 218, relation: "Partner" },
];

// NiFi Academy material (posters supplied by NiFi). The incubation program
// ran Oct 2025 – Feb 2026; class sessions are #NiFiBerbagi online classes,
// newest first. Posters live in public/content/academy.
export const academyIncubation = {
  title: "NiFi Academy Incubation: Research to Win",
  period: "2025–2026",
  summary:
    "A program for Indonesian undergraduates focused on writing equity research papers for competitions, with mentors from the finance industry.",
  steps: ["Open recruitment", "Incubation with mentors", "Company visit", "Graduation"],
  file: "academy-incubation-2025.jpg",
  w: 900,
  h: 1086,
};

export const academyClasses = [
  { title: "From Market View to Investment Thesis", speaker: "Yulianni Liyuwardi", date: "Oct 2026", file: "class-market-view-to-investment-thesis.jpg", w: 720, h: 886 },
  { title: "The System Behind Your Investment", speaker: "Hany Gungoro, CFA", date: "Oct 2026", file: "class-system-behind-your-investment.jpg", w: 720, h: 890 },
  { title: "Market Neutral Portfolio Construction", speaker: "Bagus P. Perdana", date: "Sep 2026", file: "class-market-neutral-portfolio.jpg", w: 720, h: 889 },
  { title: "The Current Market Outlook: After New Policy & MSCI", speaker: "Handi Erawan", date: "Jun 2026", file: "class-market-outlook.jpg", w: 720, h: 889 },
  { title: "Smart Entry Strategy: VWAP", speaker: "@lilbromainsaham", date: "Apr 2026", file: "class-vwap-entry-strategy.jpg", w: 720, h: 885 },
  { title: "Introduction to Smart Money Concept", speaker: "Jamie Runcandell", date: "Feb 2026", file: "class-smart-money-concept.jpg", w: 720, h: 889 },
  { title: "Basic Technical Analysis", speaker: "@dedewizard", date: "Feb 2026", file: "class-basic-technical-analysis.jpg", w: 720, h: 951 },
];
