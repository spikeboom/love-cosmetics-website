"use client";

import { useState } from "react";
import { CardProduto } from "./CardProduto";
import { transformProdutosStrapi } from "@/utils/transform-produtos-strapi";

interface Produto {
  id: string;
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

interface YouMayLikeSectionProps {
  produtos?: any[]; // Produtos vindos do Strapi
  titulo?: string;
}

const produtosPadrao: Produto[] = [
  {
    id: "1",
    imagem: "/new-home/produtos/produto-pdp.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Hidratação profunda",
    precoOriginal: 129.99,
    preco: 99.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4.5,
    ultimasUnidades: true,
  },
  {
    id: "2",
    imagem: "/new-home/produtos/produto-pdp.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Hidratação profunda",
    precoOriginal: 129.99,
    preco: 99.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4.5,
    ultimasUnidades: true,
  },
  {
    id: "3",
    imagem: "/new-home/produtos/produto-pdp.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Hidratação profunda",
    precoOriginal: 129.99,
    preco: 99.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4.5,
    ultimasUnidades: true,
  },
  {
    id: "4",
    imagem: "/new-home/produtos/produto-pdp.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Hidratação profunda",
    precoOriginal: 129.99,
    preco: 99.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4.5,
    ultimasUnidades: true,
  },
  {
    id: "5",
    imagem: "/new-home/produtos/produto-pdp.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Hidratação profunda",
    precoOriginal: 129.99,
    preco: 99.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4.5,
    ultimasUnidades: true,
  },
];

export function YouMayLikeSection({
  produtos: produtosStrapi = [],
  titulo = "Você pode gostar",
}: YouMayLikeSectionProps) {
  // Converte produtosPadrao para formato compatível com mockados
  const produtosMockados = produtosPadrao.map((p) => ({
    imagem: p.imagem,
    nome: p.nome,
    descricao: p.descricao,
    desconto: p.desconto,
    preco: p.preco,
    precoOriginal: p.precoOriginal,
    parcelas: p.parcelas,
    rating: p.rating,
    ultimasUnidades: p.ultimasUnidades,
  }));

  // Transforma produtos do Strapi e adiciona id
  const produtosTransformados = transformProdutosStrapi({
    produtosStrapi,
    produtosMockados,
    limite: 10,
    incluirSlug: true,
  });

  const produtos = produtosTransformados.length > 0
    ? produtosTransformados.map((p, index) => ({
        ...p,
        id: produtosStrapi[index]?.id?.toString() || `${index + 1}`,
        slug: p.slug,
      }))
    : produtosPadrao;

  const [currentPosition, setCurrentPosition] = useState(0);
  const cardWidth = 230; // w-[230px]
  const gap = 32; // gap-[32px]
  const containerPadding = 16; // px-[16px]
  const maxScroll = Math.max(0, (produtos.length - 4) * (cardWidth + gap));

  const handlePrevious = () => {
    setCurrentPosition((prev) => Math.max(0, prev - (cardWidth + gap)));
  };

  const handleNext = () => {
    setCurrentPosition((prev) => Math.min(maxScroll, prev + (cardWidth + gap)));
  };

  return (
    <div className="bg-white flex flex-col gap-[16px] items-center px-0 py-[32px] w-full">
      {/* Title header - Frame 7053 */}
      <div className="flex flex-col gap-[16px] items-center justify-center px-[16px] py-0 w-full">
        <div className="flex gap-[10px] items-center justify-center">
          <p className="font-cera-pro font-bold text-[24px] text-black leading-[normal] text-nowrap">
            {titulo}
          </p>
        </div>
      </div>

      {/* Cards Container with Arrows - Frame 7059 */}
      <div className="relative w-full max-w-[1440px] mx-auto flex items-center justify-center gap-[24px] py-[8px]">
        {/* Left Arrow */}
        <button
          onClick={handlePrevious}
          className="flex-shrink-0 w-[56px] h-[56px] rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
        >
          <img src="/new-home/icons/arrow-left.svg" alt="Anterior" width={56} height={56} />
        </button>

        {/* Overflow container for cards */}
        <div className="flex-1 overflow-hidden py-[4px]">
          {/* Scrollable Cards */}
          <div
            className="flex gap-[32px] items-start transition-transform duration-300 ease-in-out pl-[4px] pr-[4px]"
            style={{
              transform: `translateX(-${currentPosition}px)`,
            }}
          >
            {produtos.map((produto) => (
              <div key={produto.id} className="flex-shrink-0 w-[230px]">
                <CardProduto
                  imagem={produto.imagem}
                  nome={produto.nome}
                  descricao={produto.descricao}
                  precoOriginal={produto.precoOriginal}
                  preco={produto.preco}
                  desconto={produto.desconto}
                  parcelas={produto.parcelas}
                  rating={produto.rating}
                  ultimasUnidades={produto.ultimasUnidades}
                  tipo="produto-completo"
                  slug={produto.slug}
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
    </div>
  );
}
