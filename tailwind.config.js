const tokens = require("./design-tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./data/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark / Navy fintech palette
        navy: {
          950: "#070b1a", // deepest background
          900: "#0a0f24", // primary background
          800: "#0f1733", // section background
          700: "#162043", // card background
          600: "#1f2c54", // borders / hover
        },
        accent: {
          DEFAULT: "#3b82f6", // electric blue
          bright: "#60a5fa",
          mint: "#34d399", // high-contrast secondary
        },
        // Brand palette — NiFi deep navy (sampled from the logo) on a light,
        // editorial canvas. Navy is the single brand color; the rest are neutrals.
        brand: {
          DEFAULT: "#16294A", // NiFi navy — ink, headings, primary buttons
          hover: "#1f3a68",
          soft: "#EEF1F6", // faint navy tint for surfaces
        },
        // Colours below come from design-tokens.js (shared with the 3D scene).
        ink: tokens.ink,
        // Single cool accent — a lifted tint of the NiFi navy so it reads on
        // black. Used sparingly for emphasis, never as a large fill.
        cool: {
          DEFAULT: tokens.cool,
          deep: tokens.navy, // the brand navy itself, for panels
        },
        // Playground hues (headline marker, hero topic cards, section accents).
        play: tokens.play,
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(59, 130, 246, 0.45)",
        card: "0 8px 30px -12px rgba(0, 0, 0, 0.6)",
        soft: "0 10px 40px -18px rgba(22, 41, 74, 0.22)",
        lift: "0 20px 60px -24px rgba(22, 41, 74, 0.28)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.12), transparent 60%)",
      },
      // Partner logo marquee: the track holds two copies of the list, so
      // shifting by half its width loops seamlessly.
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 50s linear infinite",
      },
    },
  },
  plugins: [],
};
