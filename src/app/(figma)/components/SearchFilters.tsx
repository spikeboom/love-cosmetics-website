"use client";

import Image from "next/image";

interface FilterMenuItem {
  label: string;
  isActive?: boolean;
  hasIcon?: boolean;
}

interface FilterSection {
  title: string;
  items: FilterMenuItem[];
}

interface SearchFiltersProps {
  sections: FilterSection[];
  onFilterChange?: (sectionTitle: string, itemLabel: string) => void;
}

export function SearchFilters({ sections, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="flex flex-col gap-[10px] items-start w-[220px]">
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-white box-border flex flex-col gap-[16px] items-start px-0 py-[16px] w-full"
        >
          {/* Section Title */}
          <div className="flex gap-[16px] items-center w-full px-[16px]">
            <div className="flex flex-col justify-center leading-[0]">
              <p className="font-cera-pro font-bold text-[20px] text-[#000000] text-nowrap leading-[normal]">
                {section.title}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-[16px] items-start w-full px-[16px]">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={() => onFilterChange?.(section.title, item.label)}
                className="flex gap-[8px] items-center cursor-pointer hover:opacity-80 transition-opacity w-full"
              >
                <p
                  className={`font-cera-pro font-light text-[20px] text-nowrap whitespace-pre leading-[normal] ${
                    item.isActive
                      ? "text-[#ba7900]" // Dourado escuro
                      : "text-[#000000]"
                  }`}
                >
                  {item.label}
                </p>

                {/* Close Icon (only for active filter in second section) */}
                {item.hasIcon && item.isActive && (
                  <div className="w-[24px] h-[24px] shrink-0 flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="#1E1E1E"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Separator (except last section) */}
          {sectionIndex < sections.length - 1 && (
            <div className="bg-[#f8f3ed] h-px w-full" />
          )}
        </div>
      ))}
    </div>
  );
}
