import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div
      className="flex gap-[8px] items-end p-[16px] relative shrink-0 w-full"
      data-name="1.1 breadcrumbs"
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-[8px]">
          {item.href ? (
            <p className="font-cera-pro font-light text-[12px] text-black leading-normal underline decoration-solid relative shrink-0">
              {item.label}
            </p>
          ) : (
            <p className="font-cera-pro font-light text-[12px] text-black leading-normal relative shrink-0">
              {item.label}
            </p>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="w-[12px] h-[12px] text-black shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
