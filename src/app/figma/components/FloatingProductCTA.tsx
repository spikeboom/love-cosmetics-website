"use client";

interface FloatingProductCTAProps {
  precoDe?: number;
  preco: number;
  desconto?: string;
  parcelas?: string;
  onBuy?: () => void;
}

/**
 * Component based on Figma design:
 * Mobile: node-id=232-8875 (Floating price & CTA)
 * Layout: layout_9G5TYY
 */
export function FloatingProductCTA({
  precoDe,
  preco,
  desconto,
  parcelas,
  onBuy = () => {},
}: FloatingProductCTAProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 w-screen flex flex-row items-center gap-[32px] px-[24px] py-[16px] bg-white rounded-t-[16px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.3),0px_2px_8px_3px_rgba(0,0,0,0.15)] z-50">
      {/* Frame 2608639 - Price Column */}
      <div className="flex flex-col gap-[8px]">
        {/* R$ 129,99 - textStyle: Love Offer */}
        {precoDe && (
          <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-[1.256]">
            R$ {precoDe.toFixed(2).replace('.', ',')}
          </p>
        )}

        {/* Frame com preço atual + desconto */}
        <div className="flex flex-row items-center gap-[8px] self-stretch">
          {/* R$ 99,99 - textStyle: Love Título H3 */}
          <p className="font-cera-pro font-bold text-[20px] text-black leading-[1.256]">
            R$ {preco.toFixed(2).replace('.', ',')}
          </p>

          {/* 40% OFF - textStyle: Love Texto 14 */}
          {desconto && (
            <p className="font-cera-pro font-light text-[14px] text-[#009142] leading-[1.256]">
              {desconto}
            </p>
          )}
        </div>

        {/* 3x R$33,33 sem juros - textStyle: Love Texto 12 */}
        {parcelas && (
          <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-[1.256]">
            {parcelas}
          </p>
        )}
      </div>

      {/* Button Comprar - layout_1WTDTZ, h: 48 */}
      <button
        onClick={onBuy}
        className="flex flex-row justify-stretch items-stretch flex-1 h-[48px]"
      >
        {/* Content - layout_4TQZZ0, fill_6K1BZZ */}
        <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#254333] rounded-[8px]">
          {/* State-layer - layout_FJS0JC */}
          <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
            {/* textStyle: Título H4 */}
            <p className="font-cera-pro font-medium text-[16px] text-white leading-[1.256]">
              Comprar
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
