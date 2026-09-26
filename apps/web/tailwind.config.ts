import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          900: "#080c1d",
          800: "#0F1633",
          700: "#182352",
          600: "#223171",
        },
        paper: {
          DEFAULT: "var(--paper)",
          100: "#FFFFFF",
          200: "#F3F5FA",
          300: "#E5E9F2",
          400: "#D3D9E6",
        },
        ultramarine: {
          DEFAULT: "var(--ultramarine)",
          light: "#5467FF",
          dark: "#1A2FD9",
        },
        signal: {
          DEFAULT: "var(--signal)",
          light: "#FF8174",
          dark: "#E03B2A",
        },
        verify: {
          DEFAULT: "var(--verify)",
          light: "#3DD4AA",
          dark: "#148B6D",
        },
        caution: {
          DEFAULT: "var(--caution)",
          light: "#FFBE54",
          dark: "#D18610",
        },
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        devanagari: ["var(--font-noto-sans-devanagari)", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shield-float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
