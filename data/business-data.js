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
    lead: "Meet NiFi’s community in person and on Discord. We have run classes, bootcamps, meetups and #NiFiBerbagi charity activities, and can tailor an activation around your goals.",
    includes: [
      "Event and bootcamp sponsorship",
      "Community activations on Discord and at NiFi meetups",
      "A scope agreed up front: what NiFi runs and what your team provides",
    ],
  },
  {
    id: "academy",
    kind: "Service",
    title: "NiFi Academy",
    short: "Classes and bootcamps on investing, risk and valuation.",
    lead: "NiFi Academy runs classes and bootcamps on investing fundamentals, risk, valuation and equity research, with practitioners from the industry as speakers.",
    includes: [
      "Classes and webinars built with partners",
      "Speaker sessions with practitioners",
      "Bootcamp sponsorship",
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
