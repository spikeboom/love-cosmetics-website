"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  currentPage = 2,
  totalPages = 10,
  onPageChange,
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    for (let i = 1; i <= Math.min(4, totalPages); i++) {
      pages.push(i);
    }
    if (totalPages > 5) {
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (totalPages === 5) {
      pages.push(5);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div
      className="flex gap-[8px] items-center justify-end relative shrink-0"
      data-name="1.3.2.2 Component paginação mobile"
    >
      {/* Arrows / ChevronLeft */}
      <div
        className="block cursor-pointer relative shrink-0 size-[24px]"
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
      >
        <ChevronLeft className="w-full h-full text-black" />
      </div>

      {/* Page Selectors */}
      {visiblePages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <div
              key={`ellipsis-${index}`}
              className="flex flex-col font-roboto font-normal justify-end leading-[0] relative shrink-0 text-[#111] text-[14px] text-center"
            >
              <p className="leading-[16px]">...</p>
            </div>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={`bg-white border border-solid cursor-pointer flex h-[32px] items-center justify-center p-[8px] relative rounded-[4px] shrink-0 w-[40px] ${
              isActive
                ? "border-[#ba7900]"
                : "border-[#d2d2d2] overflow-clip"
            }`}
          >
            <div
              className={`flex flex-col font-roboto justify-center leading-[0] relative shrink-0 text-[#111] text-[14px] text-center ${
                isActive ? "font-bold" : "font-normal"
              }`}
            >
              <p className="leading-[16px]">{page}</p>
            </div>
          </button>
        );
      })}

      {/* Arrows / ChevronRight */}
      <div
        className="block cursor-pointer relative shrink-0 size-[24px]"
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
      >
        <ChevronRight className="w-full h-full text-black" />
      </div>
    </div>
  );
}
