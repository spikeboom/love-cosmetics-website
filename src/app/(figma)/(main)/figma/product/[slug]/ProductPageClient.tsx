"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { YouMayLikeSection } from "../../components/YouMayLikeSection";
import { CertificadosSection } from "../../components/CertificadosSection";
import { ShippingCalculator } from "../../components/ShippingCalculator";
import { ProductActionButtons } from "../../components/ProductActionButtons";
import { FloatingProductCTA } from "../../components/FloatingProductCTA";
import { ProductGallery, ProductFilters, useShareProduct } from "./components";
import { calculateProductPrices } from "@/utils/calculate-prices";
import { useCart } from "@/contexts";
import { useNotifications } from "@/core/notifications/NotificationContext";

interface ProductPageClientProps {
  produto: any;
  produtosVitrine: any[];
}

export function ProductPageClient({ produto, produtosVitrine }: ProductPageClientProps) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const router = useRouter();
  const { addProductToCart } = useCart();
  const { notify } = useNotifications();
  const { handleShare } = useShareProduct({ productName: produto?.nome || "Produto" });

  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  // Calcula precos do produto
  const priceInfo = calculateProductPrices(
    produto?.preco || 99.99,
    produto?.preco_de
  );

  // Prepara dados do produto para o carrinho
  const getProductData = () => ({
    id: produto.id.toString(),
    nome: produto.nome,
    preco: produto.preco,
    quantity: 1,
    slug: produto.slug,
    preco_de: produto.preco_de,
    tag_desconto_1: produto.tag_desconto_1,
    tag_desconto_2: produto.tag_desconto_2,
    carouselImagensPrincipal: produto.carouselImagensPrincipal,
    bling_number: produto.bling_number,
    altura: produto.altura,
    largura: produto.largura,
    comprimento: produto.comprimento,
    peso_gramas: produto.peso_gramas,
  });

  const handleAddToCart = () => {
    addProductToCart(getProductData());
    notify("Produto adicionado ao carrinho!", { variant: "success" });
  };

  const handleBuy = () => {
    addProductToCart(getProductData());
    router.push("/figma/cart");
  };

  // Processa imagens do produto
  const productImagesMain = produto?.carouselImagensPrincipal?.length > 0
    ? produto.carouselImagensPrincipal.map((item: any) => {
        const imgUrl = item?.imagem?.formats?.large?.url ||
                       item?.imagem?.formats?.xlarge?.url ||
                       item?.imagem?.url;
        return imgUrl ? `${baseURL}${imgUrl}` : "/new-home/produtos/produto-pdp.png";
      })
    : Array(5).fill("/new-home/produtos/produto-pdp.png");

  const productImagesThumbs = produto?.carouselImagensPrincipal?.length > 0
    ? produto.carouselImagensPrincipal.map((item: any) => {
        const imgUrl = item?.imagem?.formats?.thumbnail?.url ||
                       item?.imagem?.formats?.small?.url ||
                       item?.imagem?.url;
        return imgUrl ? `${baseURL}${imgUrl}` : "/new-home/produtos/produto-pdp.png";
      })
    : Array(5).fill("/new-home/produtos/produto-pdp.png");

  return (
    <div className="w-full">
      {/* Main Product Section */}
      <div className="w-full max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row gap-0 md:gap-[24px] items-start p-0 md:p-[24px]">
          {/* Left Column: Gallery + Filters */}
          <div className="flex flex-col gap-[24px] items-start w-full md:w-[921px]">
            <ProductGallery
              imagesMain={productImagesMain}
              imagesThumbs={productImagesThumbs}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
            />

            {/* Desktop Filters */}
            <ProductFilters
              produto={produto}
              expandedFilter={expandedFilter}
              onToggleFilter={setExpandedFilter}
              isMobile={false}
            />
          </div>

          {/* Right Column: Product Info */}
          <div className="bg-white flex flex-col gap-[24px] items-start pb-[24px] pt-0 md:pt-0 px-0 w-full">
            {/* Breadcrumbs */}
            <div className="relative flex gap-[8px] items-end px-[16px] py-[24px] md:py-0 w-full md:w-[380px]">
              <p className="font-cera-pro font-light text-[12px] text-black leading-[normal] text-nowrap underline">
                lovecosmetics.com.br
              </p>
              <BreadcrumbArrow />
              <p className="font-cera-pro font-light text-[12px] text-black leading-[normal] text-nowrap underline">
                todos produtos
              </p>
              <BreadcrumbArrow />
              <p className="font-cera-pro font-light text-[12px] text-black leading-[normal] text-nowrap">
                manteiga
              </p>
              {/* Share Icon - Mobile only */}
              <button className="md:hidden absolute right-[16px] top-[16px]" onClick={handleShare}>
                <ShareIcon />
              </button>
            </div>

            {/* Product Content */}
            <div className="flex flex-col gap-[24px] md:gap-[32px] items-start w-full px-[16px] md:px-0">
              {/* Title */}
              <p className="font-times font-bold text-[32px] text-black leading-[normal]">
                {produto?.nome || "Manteiga Corporal Love Cosmeticos"}
              </p>

              {/* Price & Rating */}
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-[8px] items-start leading-[normal] text-nowrap whitespace-pre relative shrink-0">
                  <p className="font-cera-pro font-light text-[12px] text-[#333333] line-through decoration-solid leading-[normal] relative shrink-0">
                    R$ 129,99
                  </p>
                  <div className="flex gap-[8px] items-center relative shrink-0 w-full">
                    <p className="font-cera-pro font-bold text-[32px] text-black leading-[0px] relative shrink-0">
                      R$ {priceInfo.precoFormatado}
                    </p>
                    <p className="font-cera-pro font-light text-[20px] text-[#009142] leading-[normal] relative shrink-0">
                      40% OFF
                    </p>
                  </div>
                  <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-[normal] relative shrink-0">
                    {priceInfo.parcelas}
                  </p>
                </div>

                <StarRating rating={4.5} />
              </div>

              {/* Description */}
              <ProductDescription produto={produto} />

              {/* Shipping Calculator */}
              <ShippingCalculator />

              {/* Action Buttons */}
              <ProductActionButtons
                onBuy={handleBuy}
                onShare={handleShare}
                onAddToCart={handleAddToCart}
              />

              {/* Mobile Filters */}
              <ProductFilters
                produto={produto}
                expandedFilter={expandedFilter}
                onToggleFilter={setExpandedFilter}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voce pode gostar Section */}
      <YouMayLikeSection produtos={produtosVitrine} />

      {/* Cards de certificados */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <CertificadosSection />
      </div>

      {/* Floating Product CTA - Mobile Only */}
      <FloatingProductCTA
        precoDe={priceInfo.precoOriginal ?? undefined}
        preco={priceInfo.preco}
        desconto={priceInfo.desconto || "40% OFF"}
        parcelas={priceInfo.parcelas}
        onBuy={handleBuy}
      />
    </div>
  );
}

// Componentes auxiliares inline
function BreadcrumbArrow() {
  return (
    <div className="size-[8px] flex-shrink-0">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M3 1L6 4L3 7" stroke="#1e1e1e" strokeWidth="1" />
      </svg>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08259 9.16716C7.54305 8.46371 6.72164 8 5.8 8C4.14315 8 2.8 9.34315 2.8 11C2.8 12.6569 4.14315 14 5.8 14C6.72164 14 7.54305 13.5363 8.08259 12.8328L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.0784 14 16.257 14.4637 15.7174 15.1672L8.77731 11.3706C8.79229 11.2492 8.8 11.1255 8.8 11C8.8 10.8745 8.79229 10.7508 8.77731 10.6294L15.7174 6.83284C16.257 7.53629 17.0784 8 18 8Z" stroke="#1e1e1e" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-[4px] items-center relative shrink-0">
      <div className="flex gap-[2px] items-start relative shrink-0">
        <div className="flex gap-[4px] h-[12px] items-center relative shrink-0">
          {[...Array(5)].map((_, i) => {
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
  );
}

function ProductDescription({ produto }: { produto: any }) {
  return (
    <div className="flex flex-col gap-[10px] items-start w-full">
      <div className="bg-white flex flex-col gap-[8px] items-start w-full">
        <div className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal] text-justify">
          {produto?.descricaoResumida && (
            <p className="mb-[8px]">{produto.descricaoResumida}</p>
          )}

          {produto?.listaDescricao?.length > 0 && (
            <p className="font-cera-pro font-bold text-[16px] mb-[8px]">
              Quais sao os beneficios?
            </p>
          )}

          {produto?.listaDescricao?.length > 0 && (
            <ul className="list-disc list-inside space-y-[4px]">
              {produto.listaDescricao.map((item: any) => (
                <li key={item.id}>{item.texto}</li>
              ))}
            </ul>
          )}

          {!produto?.descricaoResumida && (
            <>
              <p className="mb-[8px]">
                A manteiga corporal hidrata profundamente, alivia inflamacoes e rachaduras, fortalece a barreira da pele e proporciona maciez imediata.
              </p>
              <p className="font-cera-pro font-bold text-[16px] mb-[8px]">
                Quais sao os beneficios da manteiga corporal?
              </p>
              <ul className="list-disc list-inside space-y-[4px]">
                <li>Hidratacao e nutricao profunda</li>
                <li>Sensacao de maciez imediata</li>
                <li>Tratamento de rachaduras</li>
                <li>Alivio de inflamacoes de foliculite</li>
                <li>Regeneracao cutanea</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
