"use client";

import { useState } from "react";
import { CardProduto } from "./CardProduto";

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
  ranking?: number;
}

interface ProductGridProps {
  produtos: Produto[];
  paginaPorPagina?: number;
}

export function ProductGrid({
  produtos,
  paginaPorPagina = 12,
}: ProductGridProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);

  const totalPaginas = Math.ceil(produtos.length / paginaPorPagina);
  const indexInicio = (paginaAtual - 1) * paginaPorPagina;
  const indexFim = indexInicio + paginaPorPagina;
  const produtosPagina = produtos.slice(indexInicio, indexFim);

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  const handlePaginaEspecifica = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  return (
    <div className="flex flex-col gap-[16px] items-center w-full">
      {/* Grid de Produtos */}
      <div className="w-full">
        {/* Linhas do grid */}
        <div className="grid grid-cols-3 gap-[16px] w-full">
          {produtosPagina.map((produto, index) => (
            <CardProduto
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
              ranking={produto.ranking}
              tipo="produto-completo"
              fullWidth={true}
            />
          ))}
        </div>
      </div>

      {/* Paginação */}
      <div className="flex gap-[8px] items-center justify-center h-[32px] mt-[8px]">
        {/* Botão Anterior */}
        <button
          onClick={handlePaginaAnterior}
          disabled={paginaAtual === 1}
          className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] border border-[#d2d2d2] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f3ed] transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2L4 8L10 14"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Números de página */}
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
          <button
            key={pagina}
            onClick={() => handlePaginaEspecifica(pagina)}
            className={`w-[32px] h-[32px] flex items-center justify-center rounded-[4px] font-cera-pro font-light text-[14px] transition-colors ${
              paginaAtual === pagina
                ? "bg-[#ba7900] text-white"
                : "border border-[#d2d2d2] text-black hover:bg-[#f8f3ed]"
            }`}
          >
            {pagina}
          </button>
        ))}

        {/* Botão Próximo */}
        <button
          onClick={handleProximaPagina}
          disabled={paginaAtual === totalPaginas}
          className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] border border-[#d2d2d2] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f3ed] transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2L12 8L6 14"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
