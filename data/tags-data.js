// =============================================================
//  Shared tag registry — single source of truth for cross-content
//  tagging by sector, ticker, or theme.
// -------------------------------------------------------------
//  Import the ones you need into research-data.js / article-data.js /
//  newsletter-data.js / carousel-data.js and reference them in an
//  item's `tags` array. Reusing the same tag object across content
//  types is what makes them surface together on /tag/[slug].
//
//  Fields:
//    name — display label
//    slug — used in the /tag/[slug] URL (keep it URL-safe, lowercase)
//    type — "sector" | "ticker" | "theme"
// =============================================================

export const TAGS = {
  palmOil: { name: "Palm Oil", slug: "palm-oil", type: "sector" },
  commodities: { name: "Commodities", slug: "commodities", type: "sector" },
  energy: { name: "Energy", slug: "energy", type: "sector" },
  property: { name: "Property", slug: "property", type: "sector" },
  mining: { name: "Mining", slug: "mining", type: "sector" },
  metals: { name: "Metals", slug: "metals", type: "sector" },
  textile: { name: "Textile", slug: "textile", type: "sector" },
  gold: { name: "Gold", slug: "gold", type: "sector" },
  macro: { name: "Macro", slug: "macro", type: "theme" },

  lpck: { name: "LPCK", slug: "lpck", type: "ticker" },
  ammn: { name: "AMMN", slug: "ammn", type: "ticker" },
  pbrx: { name: "PBRX", slug: "pbrx", type: "ticker" },
  msti: { name: "MSTI", slug: "msti", type: "ticker" },
  inco: { name: "INCO", slug: "inco", type: "ticker" },
};
