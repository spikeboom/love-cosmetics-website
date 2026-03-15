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
      keyframes: {
        "slide-up-toast": {
          "0%": { opacity: "0", transform: "translateY(80px)" },
          "45%": { opacity: "1", transform: "translateY(-20vh)" },
          "75%": { opacity: "1", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "shimmer": {
          "0%": { width: "0%", marginLeft: "0%" },
          "50%": { width: "60%", marginLeft: "20%" },
          "100%": { width: "0%", marginLeft: "100%" },
        },
        "pulse-once": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(231,166,58,0.4)" },
          "50%": { transform: "scale(1.02)", boxShadow: "0 0 0 8px rgba(231,166,58,0)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(231,166,58,0)" },
        },
      },
      animation: {
        "slide-up-toast": "slide-up-toast 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "pulse-once": "pulse-once 1.2s ease-in-out infinite",
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
