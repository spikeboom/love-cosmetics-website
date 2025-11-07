"use client";

interface ProductActionButtonsProps {
  onBuy?: () => void;
  onShare?: () => void;
  onAddToCart?: () => void;
}

/**
 * Component based on Figma designs:
 * Mobile: node-id=232-8827 (Frame 2608683)
 * Desktop: node-id=233-10349 (CTAs)
 */
export function ProductActionButtons({
  onBuy = () => {},
  onShare = () => {},
  onAddToCart = () => {},
}: ProductActionButtonsProps) {
  return (
    <>
      {/* Mobile: Frame 2608683 - layout_GFSIOH */}
      <div className="md:hidden flex flex-col items-start gap-[8px] self-stretch w-full">
        {/* Button Comprar - layout_XE8P6D, textStyle: Título H4 */}
        <button
          onClick={onBuy}
          className="flex flex-row justify-stretch items-stretch self-stretch w-full"
        >
          {/* Content - layout_UD0V2G, fill_QG86EF */}
          <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#254333] rounded-[8px]">
            {/* State-layer - layout_6SQ3NP */}
            <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
              <p className="font-cera-pro font-medium text-[16px] text-white leading-[1.256]">
                Comprar
              </p>
            </div>
          </div>
        </button>

        {/* Frame 2608698 - layout_9PSLIY */}
        <div className="flex flex-row justify-stretch items-stretch self-stretch gap-[10px] w-full">
          {/* Button Compartilhar - layout_HAGLOB, textStyle: Título H4 */}
          <button
            onClick={onShare}
            className="flex flex-row justify-stretch items-stretch flex-1 h-[48px]"
          >
            {/* Content - layout_UD0V2G, fill_SS7A3P */}
            <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#D8F9E7] rounded-[8px]">
              {/* State-layer - layout_6SQ3NP */}
              <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
                <p className="font-cera-pro font-medium text-[16px] text-[#254333] leading-[1.256]">
                  Compartilhar
                </p>
              </div>
            </div>
          </button>

          {/* Button Adicionar ao carrinho - layout_HAGLOB, textStyle: Título H4 */}
          <button
            onClick={onAddToCart}
            className="flex flex-row justify-stretch items-stretch flex-1 h-[48px]"
          >
            {/* Content - layout_UD0V2G, fill_SS7A3P */}
            <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#D8F9E7] rounded-[8px]">
              {/* State-layer - layout_6SQ3NP */}
              <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
                <p className="font-cera-pro font-medium text-[16px] text-[#254333] leading-[1.256]">
                  Adicionar ao carrinho
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Desktop: CTAs Frame 233:10349 - layout_NROIK4 */}
      <div className="hidden md:flex flex-col items-start self-stretch gap-[16px] w-full">
        {/* Button Comprar - layout_T4C2HK */}
        <button
          onClick={onBuy}
          className="flex flex-row justify-stretch items-stretch self-stretch w-full"
        >
          {/* Content - layout_9JWTVA, fill_FLPI5S */}
          <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#254333] rounded-[8px]">
            {/* State-layer - layout_UH49Q8 */}
            <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
              <p className="font-cera-pro font-bold text-[24px] text-white leading-[normal]">
                Comprar
              </p>
            </div>
          </div>
        </button>

        {/* Frame 2608698 - layout_E5FN1V */}
        <div className="flex flex-row justify-stretch items-stretch self-stretch gap-[10px] w-full">
          {/* Button Compartilhar - layout_DHKYWL, textStyle: Título H4 */}
          <button
            onClick={onShare}
            className="flex flex-row justify-stretch items-stretch flex-1 h-[60px]"
          >
            {/* Content - layout_N0B6RG, fill_M33NBP */}
            <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#D8F9E7] rounded-[8px]">
              {/* State-layer - layout_NPBTJJ */}
              <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
                <p className="font-cera-pro font-medium text-[16px] text-[#254333] leading-[1.256]">
                  Compartilhar
                </p>
              </div>
            </div>
          </button>

          {/* Button Adicionar ao carrinho - layout_DHKYWL, textStyle: Título H4 */}
          <button
            onClick={onAddToCart}
            className="flex flex-row justify-stretch items-stretch flex-1 h-[60px]"
          >
            {/* Content - layout_N0B6RG, fill_M33NBP */}
            <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#D8F9E7] rounded-[8px]">
              {/* State-layer - layout_NPBTJJ */}
              <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
                <p className="font-cera-pro font-medium text-[16px] text-[#254333] leading-[1.256]">
                  Adicionar ao carrinho
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
