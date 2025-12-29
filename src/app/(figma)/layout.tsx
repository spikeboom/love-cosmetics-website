import { fontClasses } from "@/lib/fonts";
import { FigmaProvider } from "@/contexts";

export default function FigmaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FigmaProvider>
      <div className={`${fontClasses}`}>
        {children}
      </div>
    </FigmaProvider>
  );
}
