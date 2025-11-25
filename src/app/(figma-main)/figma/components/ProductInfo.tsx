import Image from "next/image";

interface ProductInfoProps {
  breadcrumbs: { label: string; href?: string }[];
  title: string;
  priceOriginal: number;
  price: number;
  discount: string;
  installments: string;
  rating: number;
  description: string;
}

export function ProductInfo({
  breadcrumbs,
  title,
  priceOriginal,
  price,
  discount,
  installments,
  rating,
  description,
}: ProductInfoProps) {
  return (
    <div className="w-[447px] flex flex-col gap-[24px]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-[16px] text-[12px] font-cera-pro text-[#666666]">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-[16px]">
            {index > 0 && (
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 1L6 4L3 7" stroke="#666666" strokeWidth="1" />
              </svg>
            )}
            <a href={crumb.href || "#"} className="hover:underline">
              {crumb.label}
            </a>
          </div>
        ))}
      </div>

      {/* Title */}
      <h1 className="font-cera-pro font-bold text-[28px] leading-[1.3] text-black">
        {title}
      </h1>

      {/* Price Section */}
      <div className="flex justify-between items-start gap-[24px]">
        <div className="flex flex-col gap-[16px]">
          {/* Original Price */}
          <div className="flex flex-col gap-[8px]">
            <p className="font-cera-pro font-light text-[12px] text-[#999999] line-through">
              R$ {priceOriginal.toFixed(2)}
            </p>

            {/* Current Price */}
            <div className="flex gap-[8px] items-baseline">
              <p className="font-cera-pro font-bold text-[32px] leading-[1.3] text-black">
                R$ {price.toFixed(2)}
              </p>
              <p className="font-cera-pro font-light text-[16px] text-[#009142]">
                {discount}
              </p>
            </div>

            {/* Installments */}
            <p className="font-cera-pro font-light text-[12px] text-[#666666]">
              {installments}
            </p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-[8px]">
          <div className="flex gap-[2px]">
            {[...Array(5)].map((_, i) => {
              const filled = i < Math.floor(rating);
              const half = i < rating && i >= Math.floor(rating);

              return (
                <div key={i} className="w-[16px] h-[16px]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 2L9.5 6.5L14 7L10.5 10L11.5 14.5L8 12L4.5 14.5L5.5 10L2 7L6.5 6.5L8 2Z"
                      fill={filled ? "#FFB800" : half ? "url(#half)" : "#E0E0E0"}
                    />
                    {half && (
                      <defs>
                        <linearGradient id="half">
                          <stop offset="50%" stopColor="#FFB800" />
                          <stop offset="50%" stopColor="#E0E0E0" />
                        </linearGradient>
                      </defs>
                    )}
                  </svg>
                </div>
              );
            })}
          </div>
          <span className="font-cera-pro font-light text-[12px] text-[#666666]">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-[16px]">
        <p className="font-cera-pro font-light text-[14px] leading-[1.5] text-[#333333]">
          {description}
        </p>
      </div>
    </div>
  );
}
