import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Lato,
  Poppins,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { MeuContextoProvider } from "../../components/context/context";
import { Cabecalho } from "./pdp/[slug]/cabecalho/cabecalho";
import { Rodape } from "./pdp/[slug]/rodape/rodape";
import { GoogleTagManager } from "@next/third-parties/google";
import { ModalMenu } from "@/components/menu/menu";
import MyLogFrontError from "@/components/log-error-front/log-error-front";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Lové Cosméticos",
  description:
    "Descubra a beleza natural com Lové Cosméticos. Produtos feitos com ingredientes regionais e fórmula sustentável, pensados para valorizar sua essência e cuidar da sua pele.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const insideChildren = (
    <>
      <Cabecalho />

      <div className="mx-auto w-full max-w-[1400px]">{children}</div>

      <Rodape />

      <div className="h-[100px] bg-[#333]"></div>

      <ModalMenu />
    </>
  );

  return (
    <html lang="en">
      <head>
        <GoogleTagManager
          gtmId="GTM-T7ZMDHZF"
          gtmScriptUrl="https://gtm.lovecosmetics.com.br/gtm.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${lato.variable} ${poppins.variable} bg-white text-[#333] antialiased`}
      >
        <div id="top"></div>
        <MeuContextoProvider>{insideChildren}</MeuContextoProvider>
        <MyLogFrontError />
      </body>
    </html>
  );
}
