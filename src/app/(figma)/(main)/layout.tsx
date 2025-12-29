import { Header } from "./figma/components/Header";
import { Footer } from "./figma/components/Footer";

export default function FigmaMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
