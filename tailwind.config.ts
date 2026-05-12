import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Inter Tight", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--bg)",
        foreground: "var(--ink)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "#ffffff",
          2: "var(--primary-2)",
          soft: "var(--primary-soft)",
          tint: "var(--primary-tint)",
        },
        secondary: {
          DEFAULT: "var(--bg-2)",
          foreground: "var(--ink-2)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "var(--panel)",
          foreground: "var(--ink)",
        },
        card: {
          DEFAULT: "var(--panel)",
          foreground: "var(--ink)",
        },
        success: {
          DEFAULT: "var(--green)",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "var(--yellow)",
          foreground: "#ffffff",
        },
        pink: {
          DEFAULT: "var(--pink)",
        },
        line: {
          DEFAULT: "var(--line)",
          2: "var(--line-2)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
        },
        sidebar: {
          DEFAULT: "var(--panel)",
          foreground: "var(--ink-2)",
          primary: "var(--primary)",
          "primary-foreground": "#ffffff",
          accent: "var(--primary-soft)",
          "accent-foreground": "var(--primary)",
          border: "var(--line)",
          ring: "var(--primary)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-gentle": "pulse-gentle 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
