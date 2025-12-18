import { fontClasses } from "@/lib/fonts";

export default function FigmaLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen ${fontClasses}`}>
      {children}
    </div>
  );
}
