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
// Apenas 4 pesos efetivamente usados, em woff2 (gerados via scripts/convert-fonts.py).
// Italic é aplicado via CSS (oblique sintético) sobre weight 400 em poucos lugares.
export const ceraPro = localFont({
  src: [
    {
      path: "../../../public/fonts/downloaded/CeraPro-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/fonts/downloaded/CeraPro-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/downloaded/CeraPRO-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/downloaded/Cera Pro Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-cera-pro",
  display: "swap",
});

// Roboto - para elementos Material Design (baixado localmente para evitar dependência de rede no build)
export const roboto = localFont({
  src: [
    {
      path: "../../../public/fonts/downloaded/Roboto-500.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-roboto",
  display: "swap",
});

// Libre Baskerville - substitui Times para títulos grandes (baixado localmente)
export const libreBaskerville = localFont({
  src: [
    {
      path: "../../../public/fonts/downloaded/LibreBaskerville-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-libre-baskerville",
  display: "swap",
});

// Classes CSS para aplicar as fontes
export const fontClasses = `${ceraPro.variable} ${roboto.variable} ${libreBaskerville.variable}`;
