"use client";

import Image from "next/image";
import { useState } from "react";
import { NavigationArrows } from "../../components/NavigationArrows";
import { YouMayLikeSection } from "../../components/YouMayLikeSection";
import { CertificadosSection } from "../../components/CertificadosSection";
import { ShippingCalculator } from "../../components/ShippingCalculator";
import { calculateProductPrices } from "@/utils/calculate-prices";

interface ProductPageClientProps {
  produto: any;
  produtosVitrine: any[];
}

export function ProductPageClient({ produto, produtosVitrine }: ProductPageClientProps) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // Calcula preços do produto
  const priceInfo = calculateProductPrices(
    produto?.preco || 99.99,
    produto?.preco_de
  );

  // Pega as imagens do produto do Strapi
  // Para imagem principal: usa large, xlarge ou url original
  const productImagesMain = produto?.carouselImagensPrincipal?.length > 0
    ? produto.carouselImagensPrincipal.map((item: any) => {
        const imgUrl = item?.imagem?.formats?.large?.url ||
                       item?.imagem?.formats?.xlarge?.url ||
                       item?.imagem?.url;
        return imgUrl ? `${baseURL}${imgUrl}` : "/new-home/produtos/produto-pdp.png";
      })
    : [
        "/new-home/produtos/produto-pdp.png",
        "/new-home/produtos/produto-pdp.png",
        "/new-home/produtos/produto-pdp.png",
        "/new-home/produtos/produto-pdp.png",
        "/new-home/produtos/produto-pdp.png",
      ];

  // Para thumbnails laterais: usa thumbnail ou small
  const productImagesThumbs = produto?.carouselImagensPrincipal?.length > 0
    ? produto.carouselImagensPrincipal.map((item: any) => {
        const imgUrl = item?.imagem?.formats?.thumbnail?.url ||
                       item?.imagem?.formats?.small?.url ||
                       item?.imagem?.url;
        return imgUrl ? `${baseURL}${imgUrl}` : "/new-home/produtos/produto-pdp.png";
      })
    : [
        "/new-home/produtos/produto-pdp.png",
        "/new-home/produtos/produto-pdp.png",
        "/new-home/produtos/produto-pdp.png",
        "/new-home/produtos/produto-pdp.png",
        "/new-home/produtos/produto-pdp.png",
      ];

  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Main Product Section - Frame 2608677 */}
      <div className="w-full max-w-[1440px] mx-auto">
        <div className="flex gap-[24px] items-start p-[24px]">
          {/* Left Column: Gallery + Filters - Frame 2608679 */}
          <div className="flex flex-col gap-[24px] items-start w-[921px]">
            {/* Gallery Container - Frame 2608680 */}
            <div className="flex items-start justify-between w-[921px]">
              {/* Thumbnails - Frame 2608678 */}
              <div className="flex flex-col gap-[24px] items-start w-[94px]">
                {productImagesThumbs.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-[94px] h-[94px] bg-white overflow-hidden flex-shrink-0 transition-all ${
                      selectedImage === index ? "" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      width={94}
                      height={94}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Gallery - Frame 2608685 */}
              <div className="relative w-[803px] h-[704px]">
                {/* Image Container - Frame 2608687 */}
                <div className="w-full h-full bg-white overflow-hidden">
                  <Image
                    src={productImagesMain[selectedImage]}
                    alt="Manteiga Corporal Lové Cosméticos"
                    width={803}
                    height={704}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>

                {/* Navigation Arrows - Frame 20 */}
                <NavigationArrows
                  onPrevious={() =>
                    setSelectedImage((prev) =>
                      prev === 0 ? productImagesMain.length - 1 : prev - 1
                    )
                  }
                  onNext={() =>
                    setSelectedImage((prev) =>
                      prev === productImagesMain.length - 1 ? 0 : prev + 1
                    )
                  }
                  position="center"
                  containerWidth="w-[803px]"
                  arrowSize={56}
                  leftIcon="/new-home/icons/arrow-left.svg"
                  rightIcon="/new-home/icons/arrow-right.svg"
                />
              </div>
            </div>

            {/* Product Filters - Frame 2608675 */}
            <div className="flex flex-col gap-0 w-full">
              {/* Filter 1: Ativos presentes */}
              <button
                onClick={() => setExpandedFilter(expandedFilter === "ativos" ? null : "ativos")}
                className="w-full bg-white border-b border-[#d2d2d2] flex items-center justify-between px-0 py-[16px] hover:bg-[#f8f3ed] transition-colors"
              >
                <p className="font-cera-pro font-bold text-[24px] text-black leading-[normal]">
                  Ativos presentes
                </p>
                <Image
                  src="/new-home/icons/chevron-down.svg"
                  alt="Expandir"
                  width={24}
                  height={24}
                />
              </button>

              {/* Filter 2: Modo de uso */}
              <button
                onClick={() => setExpandedFilter(expandedFilter === "modo" ? null : "modo")}
                className="w-full bg-white border-b border-[#d2d2d2] flex items-center justify-between px-0 py-[16px] hover:bg-[#f8f3ed] transition-colors"
              >
                <p className="font-cera-pro font-bold text-[24px] text-black leading-[normal]">
                  Modo de uso
                </p>
                <Image
                  src="/new-home/icons/chevron-down.svg"
                  alt="Expandir"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>

          {/* Right Column: Product Info - Card de produto Frame 6999 */}
          <div className="bg-white flex flex-col gap-[24px] items-start pb-[24px] pt-0 px-0 w-full">
            {/* Breadcrumbs - Frame 7000 */}
            <div className="flex gap-[8px] items-end px-[16px] py-0 w-[380px]">
              <p className="font-cera-pro font-light text-[12px] text-black leading-[normal] text-nowrap underline">
                lovecosmetics.com.br
              </p>
              <div className="size-[8px] flex-shrink-0">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M3 1L6 4L3 7" stroke="#1e1e1e" strokeWidth="1" />
                </svg>
              </div>
              <p className="font-cera-pro font-light text-[12px] text-black leading-[normal] text-nowrap underline">
                todos produtos
              </p>
              <div className="size-[8px] flex-shrink-0">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M3 1L6 4L3 7" stroke="#1e1e1e" strokeWidth="1" />
                </svg>
              </div>
              <p className="font-cera-pro font-light text-[12px] text-black leading-[normal] text-nowrap">
                manteiga
              </p>
            </div>

            {/* Product Content Container - Frame 50804 */}
            <div className="flex flex-col gap-[32px] items-start w-full">
              {/* Title - Frame 7007 - Times Bold 32px */}
              <p className="font-times font-bold text-[32px] text-black leading-[normal]">
                {produto?.nome || "Manteiga Corporal Lové Cosméticos"}
              </p>

              {/* Price & Rating Section - Frame 7014 */}
              <div className="flex items-center justify-between w-full">
                {/* Price Column - Frame 7015 */}
                <div className="flex flex-col gap-[8px] items-start leading-[normal] text-nowrap whitespace-pre relative shrink-0">
                  {/* Original Price - Frame 7016 */}
                  <p className="font-cera-pro font-light text-[12px] text-[#333333] line-through decoration-solid leading-[normal] relative shrink-0">
                    R$ 129,99
                  </p>

                  {/* Current Price + Discount - Frame 7017 */}
                  <div className="flex gap-[8px] items-center relative shrink-0 w-full">
                    <p className="font-cera-pro font-bold text-[32px] text-black leading-[0px] relative shrink-0">
                      R$ 99,99
                    </p>
                    <p className="font-cera-pro font-light text-[20px] text-[#009142] leading-[normal] relative shrink-0">
                      40% OFF
                    </p>
                  </div>

                  {/* Installments - Frame 7020 */}
                  <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-[normal] relative shrink-0">
                    {priceInfo.parcelas}
                  </p>
                </div>

                {/* Star Rating - Frame 7021 */}
                <div className="flex gap-[4px] items-center relative shrink-0">
                  {/* Stars - Frame 7022 */}
                  <div className="flex gap-[2px] items-start relative shrink-0">
                    {/* Estrelas - Frame 7023 */}
                    <div className="flex gap-[4px] h-[12px] items-center relative shrink-0">
                      {[...Array(5)].map((_, i) => {
                        const rating = 4.5;
                        const filled = i < Math.floor(rating);
                        const half = i < rating && i >= Math.floor(rating);

                        return (
                          <div key={i} className="flex-shrink-0 size-[24px] relative">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M12 2L15 10L23 11L17 16L19 24L12 20L5 24L7 16L1 11L9 10L12 2Z"
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
                  </div>
                </div>
              </div>

              {/* Description - Frame 7025 */}
              <div className="flex flex-col gap-[10px] items-start w-full">
                {/* Frame 7026 */}
                <div className="bg-white flex flex-col gap-[8px] items-start w-full">
                  {/* Frame 7027 */}
                  <div className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal] text-justify">
                    <p className="mb-[8px]">
                      A manteiga corporal hidrata profundamente, alivia inflamações e rachaduras, fortalece a barreira da pele e proporciona maciez imediata. Ideal para peles ressecadas, sensíveis ou com tatuagens.
                    </p>
                    <p className="font-cera-pro font-bold text-[16px] mb-[8px]">
                      Quais são os benefícios da manteiga corporal?
                    </p>
                    <ul className="list-disc list-inside space-y-[4px]">
                      <li>Hidratação e nutrição profunda</li>
                      <li>Sensação de maciez imediata</li>
                      <li>Tratamento de rachaduras</li>
                      <li>Alívio de inflamações de foliculite</li>
                      <li>Alívio de sintomas de psoríase</li>
                      <li>Regeneração cutânea</li>
                      <li>Fortalecimento da barreira natural da pele</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Shipping Calculator - Frame 7033 */}
              <ShippingCalculator />

              {/* Action Buttons - Frame 10740 */}
              <div className="flex flex-col gap-[16px] items-start w-full">
                {/* Buy Button - Frame 7051 */}
                <div className="flex h-[60px] items-center justify-center w-full">
                  <div className="flex-1 bg-[#254333] flex flex-col h-full items-center justify-center overflow-hidden rounded-[8px]">
                    <div className="flex gap-[8px] items-center justify-center px-[16px] py-[10px]">
                      <p className="font-cera-pro font-bold text-[24px] text-white leading-[normal] text-nowrap tracking-[0px]">
                        Comprar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button - Frame 10719 */}
                <div className="flex h-[60px] items-center justify-center w-full">
                  <div className="flex-1 bg-[#254333] flex flex-col h-full items-center justify-center overflow-hidden rounded-[8px]">
                    <div className="flex gap-[8px] items-center justify-center px-[16px] py-[10px]">
                      <p className="font-cera-pro font-bold text-[24px] text-white leading-[normal] text-nowrap tracking-[0px]">
                        Adicionar ao carrinho
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Você pode gostar Section - Section 8 */}
      <YouMayLikeSection produtos={produtosVitrine} />

      {/* Cards de certificados/badges - Full width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <CertificadosSection />
      </div>
    </div>
  );
}
