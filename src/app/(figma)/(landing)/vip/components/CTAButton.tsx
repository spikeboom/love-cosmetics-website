import Link from "next/link";
import { VIP_WHATSAPP_LINK } from "../vip-content";

interface CTAButtonProps {
  children: React.ReactNode;
  secondary?: boolean;
}

export function CTAButton({ children, secondary = false }: CTAButtonProps) {
  return (
    <Link
      href={VIP_WHATSAPP_LINK}
      target="_blank"
      className={`
        inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-roboto font-medium text-base transition-all
        ${secondary
          ? "bg-transparent text-[#254333] border border-[#254333]/20 hover:bg-[#254333]/5"
          : "bg-[#254333] text-white hover:bg-[#1a3024] shadow-lg shadow-[#254333]/20"
        }
      `}
    >
      {children}
    </Link>
  );
}
