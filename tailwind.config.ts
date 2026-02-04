import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surface: "var(--color-surface)",
        accent: "var(--color-accent)",
        "accent-2": "var(--color-accent-2)",
      },
    },
  },
  plugins: [],
};

export default config;
