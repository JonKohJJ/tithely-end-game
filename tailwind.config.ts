import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      colors: {
        "color-bg": "var(--color-bg)",
        "color-text": "var(--color-text)",
        "color-border": "var(--color-border)",
        "color-muted-text": "var(--color-muted-text)"
      }
  	},
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;