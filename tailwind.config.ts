import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        "primary-600": "#1D4ED8",
        "primary-700": "#1E40AF",
        "primary-900": "#1E3A8A",
        accent: "#0EA5E9",
        ink: "#0F172A",
        "ink-secondary": "#334155",
        "ink-tertiary": "#64748B",
        "ink-muted": "#94A3B8",
        border: "#E2E8F0",
        canvas: "#F8FAFC",
        success: "#059669",
        "success-soft": "#ECFDF5",
        warning: "#D97706",
        "warning-soft": "#FFFBEB",
        danger: "#DC2626",
        "danger-soft": "#FEF2F2",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px rgba(15, 23, 42, 0.08)",
        lift: "0 18px 46px rgba(37, 99, 235, 0.18)",
        card: "0 4px 20px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
