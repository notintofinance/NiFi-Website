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

  // Contact form (Web3Forms). Get a free access key at https://web3forms.com
  // by entering notintofinance.id@gmail.com — submissions are emailed there.
  // Paste the key here, then commit + push. While empty, the form is disabled
  // with a note. (This key is meant to live in client code; it is not secret.)
  contactFormKey: "",

  // Navigation. Hash links resolve on the home page from any route.
  nav: [
    { label: "About", href: "/#about" },
    { label: "What We Do", href: "/#services" },
    { label: "Research", href: "/research" },
    { label: "Articles", href: "/article" },
    { label: "Contact", href: "/contact" },
  ],
};
