"use client";

import { ProductCard } from "./ProductCard";

interface Produto {
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

interface ProductsGridProps {
  produtos: Produto[];
}

export function ProductsGrid({ produtos }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-[16px] w-full">
      {produtos.map((produto, index) => (
        <ProductCard
          key={index}
          imagem={produto.imagem}
          nome={produto.nome}
          descricao={produto.descricao}
          precoOriginal={produto.precoOriginal}
          preco={produto.preco}
          desconto={produto.desconto}
          parcelas={produto.parcelas}
          rating={produto.rating}
          ultimasUnidades={produto.ultimasUnidades}
        />
      ))}
    </div>
  );
}
