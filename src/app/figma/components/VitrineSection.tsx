"use client";

import Image from "next/image";
import { CardProduto } from "./CardProduto";

interface VitrineSectionProps {
  titulo: string;
  subtitulo?: string;
  backgroundColor?: "white" | "cream";
  showNavigation?: boolean;
  showVerTodos?: boolean;
  tipo?: "mini-banner" | "produto-completo";
  showIconeTitulo?: boolean;
  produtos?: any[];
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
}: VitrineSectionProps) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

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
    },
  ];

  // Transforma produtos do Strapi para o formato esperado pelo CardProduto
  const produtosTransformados = produtosStrapi.slice(0, 5).map((produto: any, index: number) => {
    const imagemUrl = produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url
      || produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail?.url;

    // Preço final (com desconto) vindo do Strapi
    const preco = produto.preco || 0;
    // Preço original (de) vindo do Strapi
    const precoOriginal = produto.preco_de || null;

    // Calcula o desconto baseado no preço final e preço original
    let desconto = null;
    if (preco && precoOriginal && precoOriginal > preco) {
      const percentualDesconto = Math.round(((precoOriginal - preco) / precoOriginal) * 100);
      desconto = `${percentualDesconto}% OFF`;
    }

    // Pega a primeira descrição disponível da listaDescricao
    const descricao = produto.listaDescricao?.[0]?.descricao || produtosMockados[index % produtosMockados.length].descricao;

    // Calcula o valor de cada parcela (3x sem juros)
    const valorParcela = preco > 0 ? (preco / 3).toFixed(2).replace('.', ',') : null;
    const parcelasTexto = valorParcela ? `3x R$${valorParcela} sem juros` : produtosMockados[index % produtosMockados.length].parcelas;

    return {
      imagem: imagemUrl ? `${baseURL}${imagemUrl}` : produtosMockados[index % produtosMockados.length].imagem,
      nome: produto.nome || produtosMockados[index % produtosMockados.length].nome,
      descricao: descricao,
      desconto: desconto || produtosMockados[index % produtosMockados.length].desconto,
      preco: preco || produtosMockados[index % produtosMockados.length].preco,
      precoOriginal: precoOriginal || produtosMockados[index % produtosMockados.length].precoOriginal,
      parcelas: parcelasTexto,
      ultimasUnidades: produtosMockados[index % produtosMockados.length].ultimasUnidades,
      slug: produto.slug || null,
    };
  });

  // Se não houver produtos do Strapi, usa os mockados
  const produtos = produtosTransformados.length > 0 ? produtosTransformados : produtosMockados;

  const bgColor = backgroundColor === "white" ? "bg-white" : "bg-[#f8f3ed]";

  return (
    <section className={`${bgColor} w-full flex flex-col gap-4 items-start py-8 px-0`}>
      {/* Header */}
      <div className="flex flex-col gap-4 items-center justify-center px-4 w-full">
        <div className="flex gap-2.5 items-center justify-center">
          <div className="flex flex-col justify-center leading-[0]">
            <p className="font-cera-pro font-bold text-[24px] text-black leading-normal whitespace-pre">{titulo}</p>
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
          <p className="font-cera-pro font-light text-[20px] text-black leading-normal text-center min-w-full w-min">
            {subtitulo}
          </p>
        )}
      </div>

      {/* Cards Container */}
      <div className="relative w-full">
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
            />
          ))}
        </div>

        {/* Navegação lateral */}
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

      {/* Ver todos */}
      {showVerTodos && (
        <div className="flex flex-col gap-2 items-center justify-center px-4 w-full">
          <div className="flex gap-2.5 items-center justify-center">
            <div className="flex flex-col justify-center leading-[0]">
              <p className="font-cera-pro font-medium text-[16px] text-black underline decoration-solid [text-underline-position:from-font] leading-normal whitespace-pre">
                Ver todos produtos
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
