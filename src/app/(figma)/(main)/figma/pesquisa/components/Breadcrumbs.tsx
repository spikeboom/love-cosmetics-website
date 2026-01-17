"use client";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function ChevronRight() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M2 1L6 4L2 7"
        stroke="#1E1E1E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex gap-[8px] items-end p-[16px] w-full">
      {items.map((item, index) => (
        <div key={index} className="flex gap-[8px] items-end">
          {item.href && !item.isActive ? (
            <a
              href={item.href}
              className="font-cera-pro font-light text-[12px] text-black leading-normal underline decoration-solid"
            >
              {item.label}
            </a>
          ) : (
            <span className="font-cera-pro font-light text-[12px] text-black leading-normal">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && <ChevronRight />}
        </div>
      ))}
    </div>
  );
}
