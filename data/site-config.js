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
    arthara: "https://www.arthara.id/",
    marketToday: "/market-today",
    newsletter: "https://notintofinance.beehiiv.com",
  },

  // Social profiles (shown in the footer). Leave a value empty to hide its
  // icon. Fill in Instagram / LinkedIn / TikTok when you have the URLs.
  socials: {
    x: "https://x.com/notintofinance",
    discord: "https://discord.gg/PzXJKTKPd4",
    beehiiv: "https://notintofinance.beehiiv.com",
    instagram: "https://instagram.com/notintofinance",
    linkedin: "https://www.linkedin.com/company/notintofinance",
    tiktok: "",
  },

  // Contact form (Web3Forms). Get a free access key at https://web3forms.com
  // by entering contact@notintofinance.com — submissions are emailed there.
  // Paste the key here, then commit + push. While empty, the form is disabled
  // with a note. (This key is meant to live in client code; it is not secret.)
  contactFormKey: "e29c53e7-d872-4806-b9bb-dd72c722d5d5",

  // Official contact address (used by the For Business "Discuss a
  // Collaboration" button and as the inbox behind the contact form).
  contactEmail: "contact@notintofinance.com",

  // Navigation. The site is two pages — Home and For Business — so the nav
  // carries a single link across to the business page.
  nav: [
    { label: "For Business", href: "/for-business" },
  ],
};
