"use client";

import Image from "next/image";

interface ProductCardProps {
  imagem: string;
  nome: string;
  descricao?: string;
  precoOriginal?: number;
  preco: number;
  desconto?: string;
  parcelas?: string;
  rating?: number;
  ultimasUnidades?: boolean;
}

function RotationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 13c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 8.74A7.93 7.93 0 004 13c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
        fill="#b3261e"
      />
    </svg>
  );
}

function StarIcon({ filled = true, half = false }: { filled?: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.5 0L9.18386 5.18237H14.6329L10.2245 8.38525L11.9084 13.5676L7.5 10.3647V0Z"
          fill="#F5B100"
        />
        <path
          d="M7.5 0L5.81614 5.18237H0.367076L4.77549 8.38525L3.09163 13.5676L7.5 10.3647V0Z"
          fill="#E0E0E0"
        />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 0L9.18386 5.18237H14.6329L10.2245 8.38525L11.9084 13.5676L7.5 10.3647L3.09163 13.5676L4.77549 8.38525L0.367076 5.18237H5.81614L7.5 0Z"
        fill={filled ? "#F5B100" : "#E0E0E0"}
      />
    </svg>
  );
}

function StarRating({ rating = 0 }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: fullStars }).map((_, i) => (
        <StarIcon key={`full-${i}`} filled={true} />
      ))}
      {hasHalfStar && <StarIcon half={true} />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <StarIcon key={`empty-${i}`} filled={false} />
      ))}
    </div>
  );
}

export function ProductCard({
  imagem,
  nome,
  descricao,
  precoOriginal,
  preco,
  desconto,
  parcelas,
  rating = 0,
  ultimasUnidades = false,
}: ProductCardProps) {
  const formatPrice = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  return (
    <div className="bg-white flex flex-col gap-[16px] items-start pb-[16px] rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] w-full">
      {/* Image Container */}
      <div className="relative w-full max-h-[312px]">
        <div className="relative h-[196px] w-full rounded-t-[16px] overflow-hidden">
          <Image
            src={imagem}
            alt={nome}
            fill
            className="object-cover"
          />
        </div>

        {/* Tag - Últimas unidades */}
        {ultimasUnidades && (
          <div className="absolute left-[8px] top-[163px]">
            <div className="bg-[#f8f3ed] flex gap-[4px] items-center justify-center px-[16px] py-[4px] rounded-[4px]">
              <RotationIcon />
              <span className="font-cera-pro font-light text-[14px] text-[#b3261e] leading-[1]">
                Últimas unidades
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[16px] items-start px-[16px] w-full">
        {/* Product Name */}
        <p className="font-cera-pro font-medium text-[16px] text-black leading-[1] w-full">
          {nome}
        </p>

        {/* Description */}
        {descricao && (
          <p className="font-cera-pro font-light text-[14px] text-black leading-[1] h-[48px] overflow-hidden text-ellipsis w-full">
            {descricao}
          </p>
        )}

        {/* Price and Rating */}
        <div className="flex items-center justify-between w-full">
          {/* Price Info */}
          <div className="flex flex-col gap-[8px] items-start leading-[1]">
            {precoOriginal && (
              <p className="font-cera-pro font-light text-[12px] text-[#333] line-through">
                {formatPrice(precoOriginal)}
              </p>
            )}
            <div className="flex gap-[8px] items-center">
              <p className="font-cera-pro font-bold text-[20px] text-black">
                {formatPrice(preco)}
              </p>
              {desconto && (
                <p className="font-cera-pro font-light text-[14px] text-[#009142]">
                  {desconto}
                </p>
              )}
            </div>
            {parcelas && (
              <p className="font-cera-pro font-light text-[12px] text-[#333]">
                {parcelas}
              </p>
            )}
          </div>

          {/* Star Rating */}
          <StarRating rating={rating} />
        </div>
      </div>
    </div>
  );
}
