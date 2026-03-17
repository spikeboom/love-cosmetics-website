import { fontClasses } from "@/lib/fonts";
import { FigmaProvider } from "@/contexts";
import TestModeIndicator from "./TestModeIndicator";

export default function FigmaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FigmaProvider>
      <div className={`${fontClasses}`}>
        <TestModeIndicator />
        {children}
      </div>
    </FigmaProvider>
  );
}
