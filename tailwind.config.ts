import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cold: {
          // Landing-page tokens (kept for backwards compatibility)
          bg: "#0f0e0c",
          bg2: "#141210",
          paperdark: "#9a8f78",
          // Case Room design system
          black: "#0f0e0c",
          dark: "#141210",
          surface: "#1a1814",
          border: "#2a2620",
          text: "#f0e8d8",
          muted: "#7a6e5a",
          gold: "#e8c97a",
          red: "#c0392b",
          blood: "#c0392b",
          paper: "#f4f0e4",
          ink: "#1a1810",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        type: ["var(--font-elite)", "Courier New", "monospace"],
        body: ["var(--font-dmsans)", "system-ui", "sans-serif"],
        courier: ["var(--font-courier)", "Courier New", "monospace"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulsered: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        pulsered: "pulsered 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
