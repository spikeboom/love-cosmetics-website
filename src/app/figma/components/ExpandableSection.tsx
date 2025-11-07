"use client";

import Image from "next/image";
import { ReactNode } from "react";

interface ExpandableSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  isMobile?: boolean;
}

export function ExpandableSection({
  title,
  isExpanded,
  onToggle,
  children,
  isMobile = false,
}: ExpandableSectionProps) {
  const paddingClass = isMobile ? "px-[16px]" : "px-0";

  return (
    <div className="w-full bg-white border-b border-[#d2d2d2]">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between ${paddingClass} py-[16px] hover:bg-[#f8f3ed] transition-colors`}
      >
        <p className="font-cera-pro font-bold text-[24px] text-black leading-[normal] text-left">
          {title}
        </p>
        <Image
          src="/new-home/icons/chevron-down.svg"
          alt="Expandir"
          width={24}
          height={24}
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className={`${paddingClass} pb-[16px] px-[12px]`}>
          {children}
        </div>
      )}
    </div>
  );
}
