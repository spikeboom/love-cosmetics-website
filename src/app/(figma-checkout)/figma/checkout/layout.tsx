import Script from "next/script";
import { fontClasses } from "@/lib/fonts";
import { CheckoutHeader } from "./CheckoutHeader";
import { CheckoutFooter } from "./CheckoutFooter";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col min-h-screen ${fontClasses}`}>
      {/* PagBank SDK */}
      <Script
        src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"
        strategy="beforeInteractive"
      />

      <CheckoutHeader />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <CheckoutFooter />
    </div>
  );
}
