import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./_global/globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import MyLogFrontError from "@/components/common/LogErrorFront/log-error-front";
import { BuildVersionGuard } from "@/components/common/BuildVersionGuard";
import { SnackbarProviderComponent } from "@/components/common/Context/snack-provider";
import { UIContextProvider } from "@/core/ui/UIContext";
import { NotificationProvider } from "@/core/notifications/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";

const poppins = localFont({
  src: [
    { path: "../../public/fonts/downloaded/Poppins-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/downloaded/Poppins-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/downloaded/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/downloaded/Poppins-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/downloaded/Poppins-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
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
        <Script id="test-user-flag" strategy="beforeInteractive">{`
          (function () {
            try {
              var isDev = ${JSON.stringify(process.env.NEXT_PUBLIC_DEV_TOOLS === "true")};
              if (isDev && document.cookie.indexOf("is_test_user=1") === -1) {
                document.cookie = "is_test_user=1; path=/; max-age=" + (60*60*24*30) + "; SameSite=Lax";
              }
              var m = document.cookie.match(/(?:^|; )is_test_user=([^;]+)/);
              if (m && m[1] === "1") {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ is_test_user: 1 });
              }
            } catch {}
          })();
        `}</Script>
        {process.env.NODE_ENV === "production" && (
          <>
            <GoogleTagManager
              gtmId="GTM-T7ZMDHZF"
              gtmScriptUrl="https://gtm.lovecosmetics.com.br/gtm.js"
            />
            <GoogleTagManager gtmId="GTM-WQPKGCZ2" />
          </>
        )}
      </head>
      <body
        className={`${poppins.variable} bg-white text-[#333] antialiased`}
      >
        <div id="top"></div>
        <SnackbarProviderComponent>
          <NotificationProvider>
            <UIContextProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </UIContextProvider>
          </NotificationProvider>
        </SnackbarProviderComponent>
        <MyLogFrontError />
        <BuildVersionGuard />
      </body>
    </html>
  );
}
