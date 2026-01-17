"use client";

import { useState } from "react";

interface FilterMenuItem {
  id?: string;
  label: string;
  isActive?: boolean;
  hasIcon?: boolean;
}

interface FilterSection {
  title: string;
  type?: "single" | "multiple";
  items: FilterMenuItem[];
}

interface SearchFiltersProps {
  sections: FilterSection[];
  onFilterChange?: (sectionTitle: string, itemLabel: string) => void;
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SearchFilters({ sections, onFilterChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-[8px] px-[16px] py-[12px] bg-[#f8f3ed] rounded-[8px] font-cera-pro font-medium text-[14px] text-black"
      >
        <FilterIcon />
        Filtros
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filter Content - Desktop sidebar / Mobile drawer */}
      <div className={`
        lg:flex lg:flex-col lg:gap-[10px] lg:items-start lg:w-[220px] lg:relative lg:bg-transparent
        ${isOpen
          ? 'fixed inset-y-0 left-0 w-[280px] bg-white z-50 overflow-y-auto flex flex-col'
          : 'hidden lg:flex'
        }
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-[16px] border-b border-[#f8f3ed]">
          <span className="font-cera-pro font-bold text-[20px] text-black">Filtros</span>
          <button onClick={() => setIsOpen(false)} className="p-[4px]">
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full lg:w-[220px] p-[16px] lg:p-0">
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
                onClick={() => onFilterChange?.(section.title, item.id || item.label)}
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

                {/* Close Icon (only for active items in multiple sections) */}
                {section.type === "multiple" && item.isActive && (
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
                        stroke="#ba7900"
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
      </div>
    </>
  );
}
