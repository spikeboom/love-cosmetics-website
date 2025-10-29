"use client";

import { useState } from "react";

interface FilterOption {
  id: string;
  label: string;
}

interface ProductFilter {
  name: string;
  options: FilterOption[];
}

interface ProductFiltersProps {
  filters: ProductFilter[];
  onFilterChange?: (filterName: string, selectedOption: string) => void;
}

export function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({});

  const handleFilterChange = (filterName: string, optionId: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: optionId,
    }));
    onFilterChange?.(filterName, optionId);
  };

  return (
    <div className="w-full flex flex-col gap-[8px]">
      {filters.map((filter) => (
        <div key={filter.name} className="flex flex-col gap-[12px]">
          {/* Filter Header */}
          <button className="flex justify-between items-center w-full py-[12px] px-[16px] bg-[#f8f3ed] rounded-[8px] hover:bg-[#f0ebe5] transition-colors">
            <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
              {filter.name}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="#254333"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Filter Options */}
          <div className="flex flex-col gap-[8px] px-[16px]">
            {filter.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-[12px] cursor-pointer group"
              >
                <input
                  type="radio"
                  name={filter.name}
                  value={option.id}
                  checked={selectedFilters[filter.name] === option.id}
                  onChange={() =>
                    handleFilterChange(filter.name, option.id)
                  }
                  className="w-[16px] h-[16px] cursor-pointer accent-[#254333]"
                />
                <span className="font-cera-pro font-light text-[13px] text-[#333333] group-hover:text-[#254333]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
