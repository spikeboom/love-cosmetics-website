"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CardProduto } from "./CardProduto";
import { ucViewItemList } from "../../../_tracking/uc-ecommerce";

interface Produto {
  id?: string;
  slug?: string;
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
  // Campos extras para o carrinho
  preco_de?: number;
  bling_number?: string;
  peso_gramas?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
}

interface ProductGridProps {
  produtos: Produto[];
  paginaPorPagina?: number;
  listId?: string;
  listName?: string;
}

export function ProductGrid({
  produtos,
  paginaPorPagina = 12,
  listId,
  listName,
}: ProductGridProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const lastFingerprintRef = useRef<string | null>(null);

  const totalPaginas = Math.ceil(produtos.length / paginaPorPagina);
  const indexInicio = (paginaAtual - 1) * paginaPorPagina;
  const indexFim = indexInicio + paginaPorPagina;
  const produtosPagina = produtos.slice(indexInicio, indexFim);

  const visibleItemsForTracking = useMemo(
    () =>
      produtosPagina.map((p, index) => ({
        item_id: String(p.id ?? "unknown"),
        item_name: p.nome,
        price: p.preco,
        quantity: 1,
        index,
      })),
    [produtosPagina]
  );

  useEffect(() => {
    if (visibleItemsForTracking.length === 0) return;

    const fingerprint = JSON.stringify({
      paginaAtual,
      paginaPorPagina,
      listId,
      listName,
      items: visibleItemsForTracking.map((i) => [i.item_id, i.index]),
    });

    if (lastFingerprintRef.current === fingerprint) return;
    lastFingerprintRef.current = fingerprint;

    ucViewItemList({ items: visibleItemsForTracking, listId, listName });
  }, [visibleItemsForTracking, paginaAtual, paginaPorPagina, listId, listName]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] w-full">
          {produtosPagina.map((produto, index) => (
            <CardProduto
              key={produto.id || index}
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
              ranking={produto.ranking}
              tipo="produto-completo"
              fullWidth={true}
              slug={produto.slug}
              preco_de={produto.preco_de}
              bling_number={produto.bling_number}
              peso_gramas={produto.peso_gramas}
              altura={produto.altura}
              largura={produto.largura}
              comprimento={produto.comprimento}
            />
          ))}
        </div>
      </div>

      {/* Paginação */}
      <div className="flex gap-[4px] sm:gap-[8px] items-center justify-center h-[32px] mt-[8px] flex-wrap">
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

        {/* Números de página - limitados em mobile */}
        {Array.from({ length: totalPaginas }, (_, i) => i + 1)
          .filter((pagina) => {
            // Em mobile, mostrar apenas páginas próximas à atual
            const distancia = Math.abs(pagina - paginaAtual);
            return distancia <= 1 || pagina === 1 || pagina === totalPaginas;
          })
          .map((pagina, index, arr) => {
            // Adicionar "..." entre páginas não consecutivas
            const showEllipsis = index > 0 && pagina - arr[index - 1] > 1;
            return (
              <div key={pagina} className="flex gap-[4px] sm:gap-[8px] items-center">
                {showEllipsis && (
                  <span className="w-[24px] sm:w-[32px] text-center font-cera-pro text-[14px] text-[#333]">...</span>
                )}
                <button
                  onClick={() => handlePaginaEspecifica(pagina)}
                  className={`w-[32px] h-[32px] flex items-center justify-center rounded-[4px] font-cera-pro font-light text-[14px] transition-colors ${
                    paginaAtual === pagina
                      ? "bg-[#ba7900] text-white"
                      : "border border-[#d2d2d2] text-black hover:bg-[#f8f3ed]"
                  }`}
                >
                  {pagina}
                </button>
              </div>
            );
          })}

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
