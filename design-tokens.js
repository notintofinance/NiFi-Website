// =============================================================
//  Design tokens — the one place to change NiFi's colours.
// -------------------------------------------------------------
//  Read by tailwind.config.js (utility classes like bg-ink-950,
//  text-cool, bg-play-violet) and by the 3D hero scene, so both
//  always agree. CommonJS so the Tailwind config can require it.
// =============================================================

const tokens = {
  // Dark, high-contrast canvas (black / charcoal).
  ink: {
    950: "#08090B", // page background
    900: "#0D0F12", // alternate section
    800: "#14171B", // raised surface / cards
    700: "#1D2127", // stronger surface
  },
  // NiFi navy (sampled from the logo) and its lifted tint for dark UI.
  navy: "#16294A",
  cool: "#8FAEFF",
  // Playground hues — the same four used by the headline marker. Each topic
  // card in the hero takes one of these.
  play: {
    blue: "#3B82F6",
    violet: "#8B5CF6",
    pink: "#EC4899",
    cyan: "#06B6D4",
  },
};

module.exports = tokens;
