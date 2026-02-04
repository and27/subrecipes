import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        surface: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        primary: "var(--color-primary)",
        "primary-contrast": "var(--color-primary-contrast)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
      },
    },
  },
  plugins: [],
};

export default config;
