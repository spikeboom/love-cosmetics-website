"use client";

import { useState } from "react";
import { CardProduto } from "./CardProduto";
import { NavigationArrows } from "./NavigationArrows";

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
  produtos?: Produto[];
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
  produtos = produtosPadrao,
  titulo = "Você pode gostar",
}: YouMayLikeSectionProps) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const cardWidth = 230; // w-[230px]
  const gap = 32; // gap-[32px]
  const containerPadding = 16; // px-[16px]
  const maxScroll = Math.max(0, (produtos.length - 5) * (cardWidth + gap));

  const handlePrevious = () => {
    setCurrentPosition((prev) => Math.max(0, prev - (cardWidth + gap)));
  };

  const handleNext = () => {
    setCurrentPosition((prev) => Math.min(maxScroll, prev + (cardWidth + gap)));
  };

  return (
    <div className="relative bg-white flex flex-col gap-[16px] items-start px-0 py-[32px] w-full">
      {/* Title header - Frame 7053 */}
      <div className="flex flex-col gap-[16px] items-center justify-center px-[16px] py-0 w-full">
        <div className="flex gap-[10px] items-center justify-center">
          <p className="font-cera-pro font-bold text-[24px] text-black leading-[normal] text-nowrap">
            {titulo}
          </p>
        </div>
      </div>

      {/* Cards Container - Frame 7059 */}
      <div className="relative w-full">
        <div className="flex gap-[32px] items-center justify-center px-[16px] py-0">
          {/* Scrollable Cards */}
          <div
            className="flex gap-[32px] items-center transition-transform duration-300 ease-in-out"
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
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Frame 7066 */}
      <NavigationArrows
        onPrevious={handlePrevious}
        onNext={handleNext}
        position="center"
        containerWidth="w-[1440px]"
        arrowSize={56}
        leftIcon="/new-home/icons/arrow-left.svg"
        rightIcon="/new-home/icons/arrow-right.svg"
      />
    </div>
  );
}
