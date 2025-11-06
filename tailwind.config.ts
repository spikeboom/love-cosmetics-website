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
        "cera-pro": ["var(--font-cera-pro)", ...fontFamily.sans], // Cera Pro original do Figma
        roboto: ["var(--font-roboto)", ...fontFamily.sans],
        "libre-baskerville": ["var(--font-libre-baskerville)", ...fontFamily.serif],
        times: ['"Times New Roman"', "Times", ...fontFamily.serif], // Times New Roman (fonte de sistema)
      },
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
} satisfies Config;
