"use client";

import Image from "next/image";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="box-border flex gap-[8px] items-end p-[16px] w-full h-[40px] bg-white">
      {items.map((item, index) => (
        <div key={index} className="flex gap-[8px] items-end">
          {/* Item Text */}
          <p
            className={`font-cera-pro font-light text-[12px] text-black text-nowrap whitespace-pre leading-[normal] ${
              !item.isActive
                ? "[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid underline"
                : ""
            }`}
          >
            {item.label}
          </p>

          {/* Chevron (except last item) */}
          {index < items.length - 1 && (
            <div className="w-[8px] h-[8px] shrink-0 flex items-center justify-center">
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 1L6 4L2 7"
                  stroke="#1E1E1E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
