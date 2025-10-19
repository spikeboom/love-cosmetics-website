import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Lato,
  Poppins,
  Playfair_Display,
} from "next/font/google";
import Script from "next/script";
import "./(global)/globals.css";
import { MeuContextoProvider } from "@/components/common/Context/context";
import { GoogleTagManager } from "@next/third-parties/google";
import MyLogFrontError from "@/components/common/LogErrorFront/log-error-front";
import { SnackbarProviderComponent } from "@/components/common/Context/snack-provider";
import { UIContextProvider } from "@/core/ui/UIContext";
import { NotificationProvider } from "@/core/notifications/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";

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
  return (
    <html lang="en">
      <head>
        <GoogleTagManager
          gtmId="GTM-T7ZMDHZF"
          gtmScriptUrl="https://gtm.lovecosmetics.com.br/gtm.js"
        />
        {/* PagBank SDK para criptografia de cartão */}
        <Script
          src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${lato.variable} ${poppins.variable} bg-white text-[#333] antialiased`}
      >
        <div id="top"></div>
        <SnackbarProviderComponent>
          <NotificationProvider>
            <UIContextProvider>
              <AuthProvider>
                <MeuContextoProvider>{children}</MeuContextoProvider>
              </AuthProvider>
            </UIContextProvider>
          </NotificationProvider>
        </SnackbarProviderComponent>
        <MyLogFrontError />
      </body>
    </html>
  );
}