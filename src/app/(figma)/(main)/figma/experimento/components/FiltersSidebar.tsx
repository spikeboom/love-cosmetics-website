"use client";

import { X } from "lucide-react";

interface FilterItem {
  id: string;
  label: string;
  isActive?: boolean;
  hasIcon?: boolean;
}

interface FilterSection {
  title: string;
  items: FilterItem[];
}

interface FiltersSidebarProps {
  sections: FilterSection[];
  onFilterChange?: (sectionTitle: string, itemId: string) => void;
}

export function FiltersSidebar({ sections, onFilterChange }: FiltersSidebarProps) {
  return (
    <div
      className="flex flex-1 flex-col gap-[10px] items-start justify-center min-h-px min-w-px relative"
      data-name="1.3.1 Frame 2608661"
    >
      {sections.map((section, sectionIndex) => (
        <div key={section.title} className="w-full">
          {/* Filtro section */}
          <div
            className="bg-white flex flex-col gap-[16px] items-start px-0 py-[16px] relative shrink-0 w-full"
            data-name="Filtro"
          >
            {/* Section Title */}
            <div className="flex gap-[16px] items-center relative shrink-0 w-full">
              <div className="flex flex-col justify-center leading-[0] relative shrink-0">
                <p className="font-cera-pro font-bold text-[20px] text-black leading-normal">
                  {section.title}
                </p>
              </div>
            </div>

            {/* Filter Items */}
            {section.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center relative shrink-0 cursor-pointer"
                data-name="Item menu"
                onClick={() => onFilterChange?.(section.title, item.id)}
              >
                <div className="flex gap-[8px] items-center relative shrink-0">
                  <p
                    className={`font-cera-pro font-light text-[20px] leading-normal relative shrink-0 ${
                      item.isActive ? "text-[#ba7900]" : "text-black"
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.isActive && item.hasIcon && (
                    <div className="relative shrink-0 size-[24px]" data-name="Icons">
                      <X className="w-full h-full text-[#ba7900]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Divider between sections */}
          {sectionIndex < sections.length - 1 && (
            <div className="bg-[#f8f3ed] h-px shrink-0 w-full" />
          )}
        </div>
      ))}
    </div>
  );
}
