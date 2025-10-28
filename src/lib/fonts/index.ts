import { Nunito, Roboto, Libre_Baskerville } from "next/font/google";

/**
 * Fontes do Figma:
 *
 * 1. Cera Pro (substituída por Nunito - melhor alternativa gratuita no Google Fonts)
 *    - Light 300: textos pequenos (12px, 14px, 20px)
 *    - Medium 500: títulos H4 (16px)
 *    - Bold 700: títulos H1 (32px), H2 (24px), H3 (20px)
 *
 * 2. Roboto
 *    - Medium 500: elementos Material Design (16px)
 *
 * 3. Times (substituída por Libre Baskerville ou fonte do sistema)
 *    - Bold 700: títulos especiais do banner (32px, 60px)
 */

// Nunito - substitui Cera Pro (alternativa mais próxima no Google Fonts)
export const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  variable: "--font-nunito",
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
export const fontClasses = `${nunito.variable} ${roboto.variable} ${libreBaskerville.variable}`;
