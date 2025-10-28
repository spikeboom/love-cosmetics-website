import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        lato: ["var(--font-lato)", ...fontFamily.sans],
        poppins: ["var(--font-poppins)", ...fontFamily.sans],
        playfair: ["var(--font-playfair)", ...fontFamily.sans],
        // Fontes do Figma
        nunito: ["var(--font-nunito)", ...fontFamily.sans],
        roboto: ["var(--font-roboto)", ...fontFamily.sans],
        "libre-baskerville": ["var(--font-libre-baskerville)", ...fontFamily.serif],
        // Aliases para facilitar uso
        "cera-pro": ["var(--font-nunito)", ...fontFamily.sans], // Nunito como substituto do Cera Pro
        times: ["var(--font-libre-baskerville)", ...fontFamily.serif], // Libre Baskerville como substituto do Times
      },
    },
  },
  plugins: [],
} satisfies Config;
