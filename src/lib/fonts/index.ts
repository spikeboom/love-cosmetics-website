import { Roboto, Libre_Baskerville } from "next/font/google";
import localFont from "next/font/local";

/**
 * Fontes do Figma:
 *
 * 1. Cera Pro (fonte original do design)
 *    - Light 300: textos pequenos (12px, 14px, 20px)
 *    - Medium 500: títulos H4 (16px)
 *    - Bold 700: títulos H1 (32px), H2 (24px), H3 (20px)
 *
 * 2. Roboto
 *    - Medium 500: elementos Material Design (16px)
 *
 * 3. Times New Roman (fonte de sistema)
 *    - Bold 700: títulos especiais do banner (32px, 60px)
 */

// Cera Pro SV - fonte original do Figma (carregada localmente)
export const ceraPro = localFont({
  src: [
    {
      path: "../../../public/fonts/cera-pro-sv/Cera Pro Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/fonts/cera-pro-sv/Cera Pro Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/cera-pro-sv/Cera Pro Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/fonts/cera-pro-sv/Cera Pro Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../../public/fonts/cera-pro-sv/Cera Pro Regular Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../../public/fonts/cera-pro-sv/Cera Pro Black Italic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-cera-pro",
  display: "swap",
});

// Roboto - para elementos Material Design
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-roboto",
  display: "swap",
});

// Libre Baskerville - substitui Times para títulos grandes
export const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

// Classes CSS para aplicar as fontes
export const fontClasses = `${ceraPro.variable} ${roboto.variable} ${libreBaskerville.variable}`;
