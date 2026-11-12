import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // Warm editorial fashion palette (ref: Figma styling app).
        cream: "#FAF6F0",
        sand: "#F1E9DD",
        linen: "#EBE0D1",
        ink: "#2A2320",
        cocoa: "#4A3F36",
        muted: "#8A7E72",
        line: "#E6DBCC",
        clay: "#B56A43", // primary accent (terracotta)
        clayDark: "#9A5636",
        olive: "#6E6B4F",
        paypalGold: "#FFC439",
      },
      boxShadow: {
        card: "0 1px 2px rgba(42,35,32,0.04), 0 8px 24px rgba(42,35,32,0.06)",
        drawer: "-8px 0 40px rgba(42,35,32,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
