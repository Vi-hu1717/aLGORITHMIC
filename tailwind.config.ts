import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A1428",
          900: "#0F1F3D",
          800: "#152B52",
          700: "#1D3A6E",
          600: "#28508F",
          500: "#3868AF",
        },
        gold: {
          600: "#B8860B",
          500: "#D4A017",
          400: "#E8BE3F",
          300: "#F2D87A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
