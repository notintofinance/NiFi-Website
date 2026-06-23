// =============================================================
//  Site-wide configuration — edit links & copy in one place.
// =============================================================

export const siteConfig = {
  name: "Not Into Finance",
  shortName: "NiFi",

  // Primary call-to-action links (used by the Action Hub & navbar).
  // Replace the "#" placeholders when the real URLs are ready.
  links: {
    community: "https://discord.gg/PzXJKTKPd4",
    arthara: "https://arthara.id",
    newsletter: "https://notintofinance.beehiiv.com",
  },

  // Navigation. Hash links resolve on the home page from any route.
  nav: [
    { label: "About", href: "/#about" },
    { label: "What We Do", href: "/#services" },
    { label: "Research", href: "/research" },
    { label: "Articles", href: "/article" },
  ],
};
