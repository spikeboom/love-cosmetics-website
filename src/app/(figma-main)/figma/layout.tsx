import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { fontClasses } from "@/lib/fonts";

export default function FigmaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col min-h-screen ${fontClasses}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
