"use client";

import Image from "next/image";
import { CardProduto } from "./CardProduto";
import { transformProdutosStrapi } from "@/utils/transform-produtos-strapi";

interface VitrineSectionProps {
  titulo: string;
  subtitulo?: string;
  backgroundColor?: "white" | "cream";
  showNavigation?: boolean;
  showVerTodos?: boolean;
  tipo?: "mini-banner" | "produto-completo";
  showIconeTitulo?: boolean;
  produtos?: any[];
  showRanking?: boolean;
}

export function VitrineSection({
  titulo,
  subtitulo,
  backgroundColor = "cream",
  showNavigation = false,
  showVerTodos = true,
  tipo = "mini-banner",
  showIconeTitulo = false,
  produtos: produtosStrapi = [],
  showRanking = false,
}: VitrineSectionProps) {
  // Dados mockados para fallback quando não houver produtos do Strapi
  const produtosMockados = [
    {
      imagem: "/new-home/produtos/produto-1.png",
      nome: "Manteiga Corporal",
      descricao: "Hidratação profunda, alívio das inflamações e rachaduras",
      desconto: "40% OFF",
      preco: 99.99,
      precoOriginal: 129.99,
      parcelas: "3x R$33,33 sem juros",
      ultimasUnidades: false,
      rating: 4.5,
    },
    {
      imagem: "/new-home/produtos/produto-2.png",
      nome: "Máscara de Argila",
      descricao: "Hidratação profunda, alívio das inflamações e rachaduras",
      desconto: "15% OFF",
      preco: 89.99,
      precoOriginal: 105.99,
      parcelas: "3x R$29,99 sem juros",
      ultimasUnidades: true,
      rating: 4.0,
    },
    {
      imagem: "/new-home/produtos/produto-3.png",
      nome: "Sérum Facial",
      descricao: "Hidratação profunda, alívio das inflamações e rachaduras",
      desconto: "15% OFF",
      preco: 119.99,
      precoOriginal: 140.99,
      parcelas: "3x R$39,99 sem juros",
      ultimasUnidades: true,
      rating: 4.5,
    },
    {
      imagem: "/new-home/produtos/produto-2.png",
      nome: "Máscara de Argila",
      descricao: "Hidratação profunda, alívio das inflamações e rachaduras",
      desconto: "15% OFF",
      preco: 89.99,
      precoOriginal: 105.99,
      parcelas: "3x R$29,99 sem juros",
      ultimasUnidades: true,
      rating: 3.5,
    },
    {
      imagem: "/new-home/produtos/produto-1.png",
      nome: "Manteiga Corporal",
      descricao: "Hidratação profunda, alívio das inflamações e rachaduras",
      desconto: "40% OFF",
      preco: 99.99,
      precoOriginal: 129.99,
      parcelas: "3x R$33,33 sem juros",
      ultimasUnidades: true,
      rating: 5.0,
    },
  ];

  const produtos = transformProdutosStrapi({
    produtosStrapi,
    produtosMockados,
    limite: 5,
    incluirSlug: true,
  });

  const bgColor = backgroundColor === "white" ? "bg-white" : "bg-[#f8f3ed]";

  return (
    <section className={`${bgColor} w-full flex flex-col gap-4 items-start py-8 px-0`}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:items-center items-start justify-center px-4 w-full">
        <div className="flex gap-2.5 lg:items-center items-start lg:justify-center justify-start">
          <div className="flex flex-col justify-center leading-[0]">
            <p className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-black leading-normal whitespace-pre">{titulo}</p>
          </div>
          {showIconeTitulo && (
            <div className="w-6 h-6 shrink-0 relative">
              <Image
                src="/new-home/icons/verified.svg"
                alt=""
                width={24}
                height={24}
              />
            </div>
          )}
        </div>
        {subtitulo && (
          <p className="font-cera-pro font-light text-[16px] lg:text-[20px] text-black leading-normal lg:text-center text-left min-w-full w-min">
            {subtitulo}
          </p>
        )}
      </div>

      {/* Cards Container */}
      <div className="relative w-full">
        {/* Mobile: Scroll horizontal */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 pb-2">
            {produtos.map((produto, index) => (
              <div key={index} className="flex-shrink-0 w-[280px]">
                <CardProduto
                  tipo={tipo}
                  imagem={produto.imagem}
                  nome={produto.nome}
                  descricao={produto.descricao}
                  desconto={produto.desconto}
                  preco={produto.preco}
                  precoOriginal={produto.precoOriginal}
                  parcelas={produto.parcelas}
                  ultimasUnidades={produto.ultimasUnidades}
                  slug={produto.slug}
                  ranking={showRanking ? index + 1 : undefined}
                  rating={produto.rating}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid centrado */}
        <div className="hidden lg:block">
          <div className="flex gap-8 items-start justify-center px-4 w-full">
            {produtos.map((produto, index) => (
              <CardProduto
                key={index}
                tipo={tipo}
                imagem={produto.imagem}
                nome={produto.nome}
                descricao={produto.descricao}
                desconto={produto.desconto}
                preco={produto.preco}
                precoOriginal={produto.precoOriginal}
                parcelas={produto.parcelas}
                ultimasUnidades={produto.ultimasUnidades}
                slug={produto.slug}
                ranking={showRanking ? index + 1 : undefined}
                rating={produto.rating}
              />
            ))}
          </div>

          {/* Navegação lateral - apenas desktop */}
          {showNavigation && (
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 w-[1440px] mx-auto px-6 flex items-center justify-between pointer-events-none">
              <button className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center pointer-events-auto hover:bg-white transition-colors">
                <Image src="/new-home/icons/arrow-left.svg" alt="Anterior" width={56} height={56} />
              </button>
              <button className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center pointer-events-auto hover:bg-white transition-colors">
                <Image src="/new-home/icons/arrow-right.svg" alt="Próximo" width={56} height={56} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ver todos */}
      {showVerTodos && (
        <div className="flex flex-col gap-2 lg:items-center items-start justify-center px-4 w-full">
          <div className="flex gap-2.5 lg:items-center items-start lg:justify-center justify-start">
            <div className="flex flex-col justify-center leading-[0]">
              <p className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-black underline decoration-solid [text-underline-position:from-font] leading-normal whitespace-pre">
                Ver todos produtos
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
