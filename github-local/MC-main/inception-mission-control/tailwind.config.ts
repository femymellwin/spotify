import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bloomberg: {
          bg: "#0a0a0a",
          surface: "#111111",
          header: "#000000",
          border: "#1e1e1e",
          accent: "#ff6600",
          "accent-dim": "#cc5200",
          cyan: "#00bfff",
          text: "#c8c8c8",
          muted: "#555555",
          "muted-light": "#888888",
          positive: "#00d084",
          negative: "#ff3333",
          warning: "#ffd700",
          "status-working": "#ff6600",
          "status-stuck": "#ff3333",
          "status-waiting": "#ffd700",
          "status-progress": "#00bfff",
          "status-not-started": "#555555",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Consolas",
          "Courier New",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      animation: {
        "pulse-live": "pulse-live 1.5s ease-in-out infinite",
        "cursor-blink": "cursor-blink 1s step-end infinite",
        "fade-in": "fade-in 0.3s ease-in",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        "cursor-blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
