import Script from "next/script";
import { CheckoutHeader } from "./figma/checkout/CheckoutHeader";
import { CheckoutFooter } from "./figma/checkout/CheckoutFooter";

export default function FigmaCheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
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
