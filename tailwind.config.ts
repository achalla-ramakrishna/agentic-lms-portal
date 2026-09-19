import type { Config } from "tailwindcss";

// GitHub dark-mode inspired palette (approximated from GitHub's primer
// dark theme) — see docs/adr/0003-github-dark-theme.md for why.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#0d1117",
          subtle: "#161b22",
          inset: "#010409",
        },
        line: {
          DEFAULT: "#30363d",
          muted: "#21262d",
        },
        fg: {
          DEFAULT: "#e6edf3",
          muted: "#8b949e",
          subtle: "#6e7681",
        },
        accent: {
          DEFAULT: "#58a6ff",
          emphasis: "#1f6feb",
        },
        success: {
          fg: "#3fb950",
          subtle: "#122117",
          emphasis: "#238636",
          "emphasis-hover": "#2ea043",
        },
        attention: {
          fg: "#d29922",
          subtle: "#211f14",
        },
        danger: {
          fg: "#f85149",
          subtle: "#22151a",
        },
        done: {
          fg: "#a371f7",
          subtle: "#1e1a2e",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
