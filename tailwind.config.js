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
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.12), transparent 60%)",
      },
    },
  },
  plugins: [],
};
