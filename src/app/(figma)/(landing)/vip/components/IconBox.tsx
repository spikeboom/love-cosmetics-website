interface IconBoxProps {
  icon: string;
}

const icons: Record<string, string> = {
  lightning: "⚡",
  gift: "🎁",
  compass: "🧭",
  chat: "💬",
  leaf: "🌿",
  globe: "🌎",
  handshake: "🤝",
  chart: "📈",
};

export function IconBox({ icon }: IconBoxProps) {
  return (
    <div className="w-[42px] h-[42px] rounded-2xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-lg">
      {icons[icon] || "✓"}
    </div>
  );
}
