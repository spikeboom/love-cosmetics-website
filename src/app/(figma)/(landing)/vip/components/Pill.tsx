interface PillProps {
  children: React.ReactNode;
  accent?: boolean;
}

export function Pill({ children, accent = false }: PillProps) {
  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-cera-pro font-medium
      ${accent
        ? "bg-[#d4b56a]/20 border border-[#d4b56a]/40 text-[#254333]"
        : "bg-white/70 border border-black/10 text-[#5a6a64]"
      }
    `}>
      {accent && <span className="w-2 h-2 rounded-full bg-[#d4b56a] shadow-[0_0_0_4px_rgba(212,181,106,0.18)]" />}
      {children}
    </span>
  );
}
