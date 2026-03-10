"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { SearchFilters } from "../components/SearchFilters";
import { ProductGrid } from "../components/ProductGrid";
import { CertificadosSection } from "../components/CertificadosSection";
import { ucViewSearchResults } from "@/app/(figma)/_tracking/uc-ecommerce";

interface Produto {
  id: string;
  slug: string;
  imagem: string;
  nome: string;
  descricao?: string;
  precoOriginal?: number;
  preco: number;
  desconto?: string;
  parcelas?: string;
  rating?: number;
  ultimasUnidades?: boolean;
  // Campos extras para o carrinho
  preco_de?: number;
  bling_number?: string;
  peso_gramas?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
}

interface SearchPageClientProps {
  produtos: Produto[];
  titulo: string;
  query: string;
}

const filterSectionsConfig = [
  {
    title: "Ordenar por",
    type: "single" as const,
    items: [
      { id: "sort-relevancia", label: "Relevância" },
      { id: "sort-menor", label: "Menor preço" },
      { id: "sort-maior", label: "Maior preço" },
    ],
  },
];

export function SearchPageClient({ produtos, titulo, query }: SearchPageClientProps) {
  const [activeSort, setActiveSort] = useState("sort-relevancia");
  const lastTrackedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    const term = query?.trim();
    if (!term) return;
    if (lastTrackedQueryRef.current === term) return;
    lastTrackedQueryRef.current = term;

    ucViewSearchResults({
      searchTerm: term,
      resultsCount: produtos.length,
    });
  }, [query, produtos.length]);

  const handleFilterChange = (section: string, itemId: string) => {
    if (section === "Ordenar por") {
      setActiveSort(itemId);
    }
  };

  // Ordena os produtos baseado na seleção
  const produtosOrdenados = useMemo(() => {
    const sorted = [...produtos];

    if (activeSort === "sort-menor") {
      sorted.sort((a, b) => a.preco - b.preco);
    } else if (activeSort === "sort-maior") {
      sorted.sort((a, b) => b.preco - a.preco);
    }

    return sorted;
  }, [produtos, activeSort]);

  const filterSections = useMemo(
    () =>
      filterSectionsConfig.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          isActive: item.id === activeSort,
        })),
      })),
    [activeSort]
  );

  const breadcrumbItems = [
    { label: "lovecosmetics.com.br", href: "/figma/design" },
    { label: "todos produtos", href: "/figma/search" },
    ...(query ? [{ label: query, isActive: true }] : [{ label: "todos", isActive: true }]),
  ];

  return (
    <>
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Title Section */}
        <div className="box-border flex flex-col gap-[12px] sm:gap-[16px] items-start p-[16px] w-full bg-white">
          <div className="flex flex-col justify-center leading-[0]">
            <p className="font-cera-pro font-bold text-[24px] sm:text-[32px] text-black leading-normal">
              {titulo}
            </p>
          </div>
          <p className="font-cera-pro font-light text-[14px] text-black leading-normal w-full">
            {produtos.length} {produtos.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-[16px] items-start p-[16px] w-full bg-white">
          {/* Sidebar Filters */}
          <SearchFilters
            sections={filterSections}
            onFilterChange={handleFilterChange}
          />

          {/* Product Grid */}
          <div className="flex-1 w-full">
            {produtosOrdenados.length > 0 ? (
              <ProductGrid
                produtos={produtosOrdenados}
                paginaPorPagina={12}
                listId={query ? `search:${query}` : "search:all"}
                listName={query ? `Busca: ${query}` : titulo}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="font-cera-pro font-medium text-[20px] text-black mb-2">
                  Nenhum produto encontrado
                </p>
                <p className="font-cera-pro font-light text-[14px] text-[#666]">
                  Tente buscar por outro termo ou veja todos os produtos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificados */}
      <CertificadosSection />
    </>
  );
}
