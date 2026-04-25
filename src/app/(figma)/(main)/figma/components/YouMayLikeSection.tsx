"use client";

import { useState } from "react";
import { CardProduto } from "./CardProduto";
import { transformProdutosStrapi } from "@/utils/transform-produtos-strapi";

interface YouMayLikeSectionProps {
  produtos?: any[];
  titulo?: string;
}

export function YouMayLikeSection({
  produtos: produtosStrapi = [],
  titulo = "Você pode gostar",
}: YouMayLikeSectionProps) {
  const produtos = transformProdutosStrapi({
    produtosStrapi,
    limite: 10,
    incluirSlug: true,
  }).sort((a, b) => Number(!!a.esgotado) - Number(!!b.esgotado));

  const [currentPosition, setCurrentPosition] = useState(0);
  const cardWidth = 230;
  const gap = 32;
  const maxScroll = Math.max(0, (produtos.length - 4) * (cardWidth + gap));

  const handlePrevious = () => {
    setCurrentPosition((prev) => Math.max(0, prev - (cardWidth + gap)));
  };

  const handleNext = () => {
    setCurrentPosition((prev) => Math.min(maxScroll, prev + (cardWidth + gap)));
  };

  if (produtos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white flex flex-col gap-[16px] items-center px-0 py-[24px] md:py-[32px] w-full">
      {/* Title header */}
      <div className="flex flex-col gap-[16px] items-start md:items-center justify-center px-[16px] py-0 w-full">
        <div className="flex gap-[10px] items-center justify-center">
          <p className="font-cera-pro font-bold text-[24px] text-black leading-[normal] text-nowrap">
            {titulo}
          </p>
        </div>
      </div>

      {/* Desktop: Cards with arrows navigation */}
      <div className="hidden md:flex relative w-full max-w-[1440px] mx-auto items-center justify-center gap-[24px] py-[8px]">
        {/* Left Arrow */}
        <button
          onClick={handlePrevious}
          className="flex-shrink-0 w-[56px] h-[56px] rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
        >
          <img src="/new-home/icons/arrow-left.svg" alt="Anterior" width={56} height={56} />
        </button>

        {/* Overflow container for cards */}
        <div className="flex-1 overflow-hidden py-[4px]">
          <div
            className="flex gap-[32px] items-start transition-transform duration-300 ease-in-out pl-[4px] pr-[4px]"
            style={{
              transform: `translateX(-${currentPosition}px)`,
            }}
          >
            {produtos.map((produto) => (
              <div key={produto.id} className="flex-shrink-0 w-[230px]">
                <CardProduto
                  id={produto.id}
                  imagem={produto.imagem}
                  nome={produto.nome}
                  descricao={produto.descricao}
                  precoOriginal={produto.precoOriginal}
                  preco={produto.preco}
                  desconto={produto.desconto}
                  parcelas={produto.parcelas}
                  rating={produto.rating}
                  ultimasUnidades={produto.ultimasUnidades}
                  esgotado={produto.esgotado}
                  tipo="produto-completo"
                  slug={produto.slug}
                  preco_de={produto.preco_de}
                  bling_number={produto.bling_number}
                  peso_gramas={produto.peso_gramas}
                  altura={produto.altura}
                  largura={produto.largura}
                  comprimento={produto.comprimento}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="flex-shrink-0 w-[56px] h-[56px] rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
        >
          <img src="/new-home/icons/arrow-right.svg" alt="Próximo" width={56} height={56} />
        </button>
      </div>

      {/* Mobile: Scrollable cards without arrows */}
      <div className="md:hidden w-full overflow-x-scroll scrollbar-hide">
        <div className="flex gap-[16px] items-start px-[16px]">
          {produtos.map((produto) => (
            <div key={produto.id} className="flex-shrink-0 w-[230px]">
              <CardProduto
                id={produto.id}
                imagem={produto.imagem}
                nome={produto.nome}
                descricao={produto.descricao}
                precoOriginal={produto.precoOriginal}
                preco={produto.preco}
                desconto={produto.desconto}
                parcelas={produto.parcelas}
                rating={produto.rating}
                ultimasUnidades={produto.ultimasUnidades}
                esgotado={produto.esgotado}
                tipo="produto-completo"
                slug={produto.slug}
                preco_de={produto.preco_de}
                bling_number={produto.bling_number}
                peso_gramas={produto.peso_gramas}
                altura={produto.altura}
                largura={produto.largura}
                comprimento={produto.comprimento}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
