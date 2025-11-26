"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationArrows } from "../../components/NavigationArrows";
import { YouMayLikeSection } from "../../components/YouMayLikeSection";
import { CertificadosSection } from "../../components/CertificadosSection";
import { ShippingCalculator } from "../../components/ShippingCalculator";
import { ProductActionButtons } from "../../components/ProductActionButtons";
import { FloatingProductCTA } from "../../components/FloatingProductCTA";
import { ExpandableSection } from "../../components/ExpandableSection";
import { calculateProductPrices } from "@/utils/calculate-prices";
import { useMeuContexto } from "@/components/common/Context/context";
import { useNotifications } from "@/core/notifications/NotificationContext";

interface ProductPageClientProps {
  produto: any;
  produtosVitrine: any[];
}

export function ProductPageClient({ produto, produtosVitrine }: ProductPageClientProps) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const router = useRouter();
  const { addProductToCart } = useMeuContexto();
  const { notify } = useNotifications();

  // Calcula preços do produto
  const priceInfo = calculateProductPrices(
    produto?.preco || 99.99,
    produto?.preco_de
  );

  // Handler para adicionar ao carrinho
  const handleAddToCart = () => {
    const productData = {
      id: produto.id.toString(),
      nome: produto.nome,
      preco: produto.preco,
      quantity: 1,
      slug: produto.slug,
      preco_de: produto.preco_de,
      tag_desconto_1: produto.tag_desconto_1,
      tag_desconto_2: produto.tag_desconto_2,
      carouselImagensPrincipal: produto.carouselImagensPrincipal,
      // Dados para frete (se disponíveis)
      bling_number: produto.bling_number,
      altura: produto.altura,
      largura: produto.largura,
      comprimento: produto.comprimento,
      peso_gramas: produto.peso_gramas,
    };

    addProductToCart(productData);
    notify("Produto adicionado ao carrinho!", { variant: "success" });
  };

  // Handler para comprar (adiciona e vai pro carrinho)
  const handleBuy = () => {
    const productData = {
      id: produto.id.toString(),
      nome: produto.nome,
      preco: produto.preco,
      quantity: 1,
      slug: produto.slug,
      preco_de: produto.preco_de,
      tag_desconto_1: produto.tag_desconto_1,
      tag_desconto_2: produto.tag_desconto_2,
      carouselImagensPrincipal: produto.carouselImagensPrincipal,
      // Dados para frete (se disponíveis)
      bling_number: produto.bling_number,
      altura: produto.altura,
      largura: produto.largura,
      comprimento: produto.comprimento,
      peso_gramas: produto.peso_gramas,
    };

    addProductToCart(productData);
    router.push('/figma/cart');
  };

  // Handler para compartilhar
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: produto.nome,
          text: `Confira ${produto.nome} na Lové Cosméticos!`,
          url: window.location.href,
        });
      } catch (error) {
        // Usuário cancelou ou erro ao compartilhar
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback: copiar link
      navigator.clipboard.writeText(window.location.href);
      notify("Link copiado para a área de transferência!", { variant: "success" });
    }
  };

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
        <div className="flex flex-col md:flex-row gap-0 md:gap-[24px] items-start p-0 md:p-[24px]">
          {/* Left Column: Gallery + Filters - Frame 2608679 */}
          <div className="flex flex-col gap-[24px] items-start w-full md:w-[921px]">
            {/* Gallery Container - Frame 2608680 */}
            <div className="flex items-start justify-between w-full md:w-[921px]">
              {/* Thumbnails - Frame 2608678 - Hidden on mobile */}
              <div className="hidden md:flex flex-col gap-[24px] items-start w-[94px]">
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
              <div className="relative w-full md:w-[803px] h-[424px] md:h-[704px]">
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
                  containerWidth="w-full md:w-[803px]"
                  arrowSize={56}
                  leftIcon="/new-home/icons/arrow-left.svg"
                  rightIcon="/new-home/icons/arrow-right.svg"
                />
              </div>
            </div>

            {/* Product Filters - Frame 2608675 - Hidden on mobile, shown on desktop */}
            <div className="hidden md:flex flex-col gap-0 w-full">
              {/* Filter 1: Ativos presentes */}
              {produto?.o_que_ele_tem?.length > 0 && (
                <ExpandableSection
                  title="Ativos presentes"
                  isExpanded={expandedFilter === "ativos"}
                  onToggle={() => setExpandedFilter(expandedFilter === "ativos" ? null : "ativos")}
                  isMobile={false}
                >
                  <ul className="space-y-[8px]">
                    {produto.o_que_ele_tem.map((item: any) => (
                      <li key={item.id} className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal]">
                        <strong className="font-bold">{item.titulo}:</strong> {item.descricao}
                      </li>
                    ))}
                  </ul>
                </ExpandableSection>
              )}

              {/* Filter 2: Modo de uso */}
              {produto?.como_usar_essa_formula?.length > 0 && (
                <ExpandableSection
                  title="Modo de uso"
                  isExpanded={expandedFilter === "modo"}
                  onToggle={() => setExpandedFilter(expandedFilter === "modo" ? null : "modo")}
                  isMobile={false}
                >
                  <ul className="space-y-[8px]">
                    {produto.como_usar_essa_formula.map((item: any) => (
                      <li key={item.id} className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal]">
                        {item.texto}
                      </li>
                    ))}
                  </ul>
                </ExpandableSection>
              )}

              {/* Filter 3: Conheça mais sobre o produto */}
              {produto?.o_que_ele_e && (
                <ExpandableSection
                  title="Conheça mais sobre o produto"
                  isExpanded={expandedFilter === "conheca"}
                  onToggle={() => setExpandedFilter(expandedFilter === "conheca" ? null : "conheca")}
                  isMobile={false}
                >
                  <p className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal] text-justify">
                    {produto.o_que_ele_e}
                  </p>
                </ExpandableSection>
              )}
            </div>
          </div>

          {/* Right Column: Product Info - Card de produto Frame 6999 */}
          <div className="bg-white flex flex-col gap-[24px] items-start pb-[24px] pt-0 md:pt-0 px-0 w-full">
            {/* Breadcrumbs - Frame 7000 */}
            <div className="relative flex gap-[8px] items-end px-[16px] py-[24px] md:py-0 w-full md:w-[380px]">
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
              {/* Share Icon - Visible on mobile only */}
              <button className="md:hidden absolute right-[16px] top-[16px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08259 9.16716C7.54305 8.46371 6.72164 8 5.8 8C4.14315 8 2.8 9.34315 2.8 11C2.8 12.6569 4.14315 14 5.8 14C6.72164 14 7.54305 13.5363 8.08259 12.8328L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.0784 14 16.257 14.4637 15.7174 15.1672L8.77731 11.3706C8.79229 11.2492 8.8 11.1255 8.8 11C8.8 10.8745 8.79229 10.7508 8.77731 10.6294L15.7174 6.83284C16.257 7.53629 17.0784 8 18 8Z" stroke="#1e1e1e" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
            </div>

            {/* Product Content Container - Frame 50804 */}
            <div className="flex flex-col gap-[24px] md:gap-[32px] items-start w-full px-[16px] md:px-0">
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
                      R$ {priceInfo.precoFormatado}
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
                    {/* Descrição resumida do Strapi */}
                    {produto?.descricaoResumida && (
                      <p className="mb-[8px]">
                        {produto.descricaoResumida}
                      </p>
                    )}

                    {/* Título da lista de benefícios */}
                    {produto?.listaDescricao?.length > 0 && (
                      <p className="font-cera-pro font-bold text-[16px] mb-[8px]">
                        Quais são os benefícios?
                      </p>
                    )}

                    {/* Lista de benefícios do Strapi */}
                    {produto?.listaDescricao?.length > 0 && (
                      <ul className="list-disc list-inside space-y-[4px]">
                        {produto.listaDescricao.map((item: any) => (
                          <li key={item.id}>{item.texto}</li>
                        ))}
                      </ul>
                    )}

                    {/* Fallback caso não tenha dados do Strapi */}
                    {!produto?.descricaoResumida && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Calculator - Frame 7033 */}
              <ShippingCalculator />

              {/* Action Buttons - Frame 2608683 (Mobile) / Frame 2608698 (Desktop) */}
              <ProductActionButtons
                onBuy={handleBuy}
                onShare={handleShare}
                onAddToCart={handleAddToCart}
              />

              {/* Mobile Filters Section - Shown only on mobile */}
              <div className="md:hidden flex flex-col gap-0 w-full">
                {/* Filter 1: Ativos presentes */}
                {produto?.o_que_ele_tem?.length > 0 && (
                  <ExpandableSection
                    title="Ativos presentes"
                    isExpanded={expandedFilter === "ativos"}
                    onToggle={() => setExpandedFilter(expandedFilter === "ativos" ? null : "ativos")}
                    isMobile={true}
                  >
                    <ul className="space-y-[8px]">
                      {produto.o_que_ele_tem.map((item: any) => (
                        <li key={item.id} className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal]">
                          <strong className="font-bold">{item.titulo}:</strong> {item.descricao}
                        </li>
                      ))}
                    </ul>
                  </ExpandableSection>
                )}

                {/* Filter 2: Modo de uso */}
                {produto?.como_usar_essa_formula?.length > 0 && (
                  <ExpandableSection
                    title="Modo de uso"
                    isExpanded={expandedFilter === "modo"}
                    onToggle={() => setExpandedFilter(expandedFilter === "modo" ? null : "modo")}
                    isMobile={true}
                  >
                    <ul className="space-y-[8px]">
                      {produto.como_usar_essa_formula.map((item: any) => (
                        <li key={item.id} className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal]">
                          {item.texto}
                        </li>
                      ))}
                    </ul>
                  </ExpandableSection>
                )}

                {/* Filter 3: Conheça mais sobre o produto */}
                {produto?.o_que_ele_e && (
                  <ExpandableSection
                    title="Conheça mais sobre o produto"
                    isExpanded={expandedFilter === "conheca"}
                    onToggle={() => setExpandedFilter(expandedFilter === "conheca" ? null : "conheca")}
                    isMobile={true}
                  >
                    <p className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal] text-justify">
                      {produto.o_que_ele_e}
                    </p>
                  </ExpandableSection>
                )}
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

      {/* Floating Product CTA - Mobile Only */}
      <FloatingProductCTA
        precoDe={priceInfo.precoOriginal ?? undefined}
        preco={priceInfo.preco}
        desconto={priceInfo.desconto || '40% OFF'}
        parcelas={priceInfo.parcelas}
        onBuy={handleBuy}
      />
    </div>
  );
}
