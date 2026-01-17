"use client";

interface FilterItem {
  id: string;
  label: string;
  isActive?: boolean;
}

interface FilterSection {
  title: string;
  type: "single" | "multiple";
  items: FilterItem[];
}

interface FiltersSidebarProps {
  sections: FilterSection[];
  onFilterChange?: (sectionTitle: string, itemId: string) => void;
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="#ba7900"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FiltersSidebar({ sections, onFilterChange }: FiltersSidebarProps) {
  return (
    <div className="flex flex-col gap-[10px] items-start justify-center w-full">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="w-full">
          {/* Filter Section */}
          <div className="bg-white flex flex-col gap-[16px] items-start py-[16px] w-full">
            {/* Section Title */}
            <div className="flex gap-[16px] items-center w-full">
              <div className="flex flex-col justify-center leading-[0]">
                <h3 className="font-cera-pro font-bold text-[20px] text-black leading-[1]">
                  {section.title}
                </h3>
              </div>
            </div>

            {/* Filter Items */}
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onFilterChange?.(section.title, item.id)}
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex gap-[8px] items-center">
                  <span
                    className={`font-cera-pro font-light text-[20px] leading-[1] ${
                      item.isActive ? "text-[#ba7900]" : "text-black"
                    }`}
                  >
                    {item.label}
                  </span>
                  {section.type === "multiple" && item.isActive && (
                    <div className="w-[24px] h-[24px] flex items-center justify-center">
                      <CloseIcon />
                    </div>
                  )}
                </div>
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
