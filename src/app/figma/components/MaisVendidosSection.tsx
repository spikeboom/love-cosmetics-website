"use client";

import { CardProduto } from "./CardProduto";
import { transformProdutosStrapi } from "@/utils/transform-produtos-strapi";

interface MaisVendidosSectionProps {
  produtos?: any[];
}

export function MaisVendidosSection({ produtos: produtosStrapi = [] }: MaisVendidosSectionProps) {
  // Dados mockados para fallback quando não houver produtos do Strapi
  const produtosMockados = [
    {
      imagem: "/new-home/produtos/produto-1.png",
      nome: "Manteiga Corporal Lové Cosméticos",
      desconto: "40% OFF",
      preco: 99.99,
      precoOriginal: 129.99,
      parcelas: "3x R$33,33 sem juros",
      rating: 3.5,
      ultimasUnidades: true,
    },
    {
      imagem: "/new-home/produtos/produto-2.png",
      nome: "Máscara de Argila Lové Cosméticos",
      desconto: "15% OFF",
      preco: 89.99,
      precoOriginal: 105.99,
      parcelas: "3x R$29,99 sem juros",
      rating: 4.0,
    },
    {
      imagem: "/new-home/produtos/produto-3.png",
      nome: "Sérum Facial Lové Cosméticos",
      desconto: "15% OFF",
      preco: 119.99,
      precoOriginal: 140.99,
      parcelas: "3x R$39,99 sem juros",
      rating: 4.5,
      ultimasUnidades: true,
    },
    {
      imagem: "/new-home/produtos/produto-2.png",
      nome: "Máscara de Argila Lové Cosméticos",
      desconto: "15% OFF",
      preco: 89.99,
      precoOriginal: 105.99,
      parcelas: "3x R$29,99 sem juros",
      rating: 3.5,
    },
    {
      imagem: "/new-home/produtos/produto-1.png",
      nome: "Manteiga Corporal Lové Cosméticos",
      desconto: "40% OFF",
      preco: 99.99,
      precoOriginal: 129.99,
      parcelas: "3x R$33,33 sem juros",
      rating: 5.0,
    },
  ];

  const produtos = transformProdutosStrapi({
    produtosStrapi,
    produtosMockados,
    limite: 5,
    incluirSlug: true,
  });

  return (
    <section className="bg-[#f8f3ed] w-full flex flex-col gap-4 items-start py-8 px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 items-center justify-center px-4 w-full">
        <div className="flex gap-2.5 items-center justify-center">
          <div className="flex flex-col justify-center leading-[0]">
            <p className="font-cera-pro font-bold text-[24px] text-black leading-normal whitespace-pre">Mais vendidos</p>
          </div>
        </div>
        <p className="font-cera-pro font-light text-[20px] text-black leading-normal text-center min-w-full w-min">
          Produtos que estão fazendo sucesso
        </p>
      </div>

      {/* Cards Container */}
      <div className="flex gap-8 items-center justify-center px-4 w-full">
        {produtos.map((produto, index) => (
          <CardProduto
            key={index}
            tipo="produto-completo"
            imagem={produto.imagem}
            nome={produto.nome}
            desconto={produto.desconto}
            preco={produto.preco}
            precoOriginal={produto.precoOriginal}
            parcelas={produto.parcelas}
            rating={produto.rating}
            ultimasUnidades={produto.ultimasUnidades}
            ranking={index + 1}
            slug={produto.slug}
          />
        ))}
      </div>
    </section>
  );
}
