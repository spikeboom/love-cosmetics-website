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
      <CheckoutHeader />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <CheckoutFooter />
    </div>
  );
}
