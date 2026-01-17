"use client";

import { useState, useMemo } from "react";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { TitleHeader } from "./components/TitleHeader";
import { FiltersSidebar } from "./components/FiltersSidebar";
import { ProductsGrid } from "./components/ProductsGrid";
import { Pagination } from "./components/Pagination";

// Mock data
const mockProdutos = [
  {
    imagem: "/new-home/produtos/produto-1.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "A manteiga corporal hidrata profundamente, alivia inflamações e rachaduras, fortalece a barreira da pele e proporciona maciez imediata. Ideal para peles ressecadas.",
    preco: 99.99,
    precoOriginal: 129.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4.5,
    ultimasUnidades: false,
  },
  {
    imagem: "/new-home/produtos/produto-2.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Formulação enriquecida com manteigas naturais e óleos essenciais. Proporciona hidratação duradoura e deixa a pele macia, suave e protegida.",
    preco: 89.99,
    precoOriginal: 105.99,
    desconto: "15% OFF",
    parcelas: "3x R$29,99 sem juros",
    rating: 3.5,
    ultimasUnidades: true,
  },
  {
    imagem: "/new-home/produtos/produto-3.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Com ingredientes ativos da Amazônia que regeneram a pele. Reduz inflamações, alivia coceira e proporciona conforto imediato.",
    preco: 119.99,
    precoOriginal: 140.99,
    desconto: "15% OFF",
    parcelas: "3x R$39,99 sem juros",
    rating: 5,
    ultimasUnidades: true,
  },
  {
    imagem: "/new-home/produtos/produto-1.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Especializada em hidratar e proteger áreas ressecadas. Com componentes naturais que fortalecem a barreira protetora da pele.",
    preco: 99.99,
    precoOriginal: 129.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4,
    ultimasUnidades: false,
  },
  {
    imagem: "/new-home/produtos/produto-2.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Blend perfeito de manteigas vegetais e óleos essenciais amazônicos. Nutre profundamente, deixa a pele aveludada e sem ressecamento.",
    preco: 89.99,
    precoOriginal: 105.99,
    desconto: "15% OFF",
    parcelas: "3x R$29,99 sem juros",
    rating: 3.5,
    ultimasUnidades: true,
  },
  {
    imagem: "/new-home/produtos/produto-3.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Tratamento intensivo para pele muito ressecada e inflamada. Regenera, acalma e hidrata profundamente.",
    preco: 119.99,
    precoOriginal: 140.99,
    desconto: "15% OFF",
    parcelas: "3x R$39,99 sem juros",
    rating: 5,
    ultimasUnidades: true,
  },
  {
    imagem: "/new-home/produtos/produto-1.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Mantém a pele hidratada, macia e protegida por até 24 horas. Absorve rapidamente sem deixar oleosidade.",
    preco: 99.99,
    precoOriginal: 129.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4,
    ultimasUnidades: false,
  },
  {
    imagem: "/new-home/produtos/produto-2.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Fórmula vegana e cruelty-free com extratos naturais da floresta amazônica. Repara rachaduras, hidrata e deixa aroma agradável.",
    preco: 89.99,
    precoOriginal: 105.99,
    desconto: "15% OFF",
    parcelas: "3x R$29,99 sem juros",
    rating: 3.5,
    ultimasUnidades: true,
  },
  {
    imagem: "/new-home/produtos/produto-3.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Desenvolvida para aliviar inflamações e coceiras. Com manteiga de karité e óleos essenciais anti-inflamatórios.",
    preco: 119.99,
    precoOriginal: 140.99,
    desconto: "15% OFF",
    parcelas: "3x R$39,99 sem juros",
    rating: 5,
    ultimasUnidades: true,
  },
  {
    imagem: "/new-home/produtos/produto-1.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Hidratação profunda e duradoura. Repara a barreira de proteção da pele. Testado dermatologicamente.",
    preco: 99.99,
    precoOriginal: 129.99,
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 4,
    ultimasUnidades: false,
  },
  {
    imagem: "/new-home/produtos/produto-2.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Com ativos anti-inflamatórios e regeneradores. Ideal para recuperar pele ressecada, irritada ou com rachaduras.",
    preco: 89.99,
    precoOriginal: 105.99,
    desconto: "15% OFF",
    parcelas: "3x R$29,99 sem juros",
    rating: 3.5,
    ultimasUnidades: true,
  },
  {
    imagem: "/new-home/produtos/produto-3.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Manteiga premium com concentração máxima de ativos naturais. Hidrata, protege e rejuvenesce a pele.",
    preco: 119.99,
    precoOriginal: 140.99,
    desconto: "15% OFF",
    parcelas: "3x R$39,99 sem juros",
    rating: 5,
    ultimasUnidades: true,
  },
];

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
  {
    title: "Filtrar por",
    type: "multiple" as const,
    items: [
      { id: "filtro-1", label: "Filtro" },
      { id: "filtro-2", label: "Filtro" },
      { id: "filtro-3", label: "Filtro" },
      { id: "filtro-4", label: "Filtro" },
      { id: "filtro-5", label: "Filtro" },
      { id: "filtro-6", label: "Filtro" },
      { id: "filtro-7", label: "Filtro" },
      { id: "filtro-8", label: "Filtro" },
      { id: "filtro-9", label: "Filtro" },
    ],
  },
];

const breadcrumbItems = [
  { label: "lovecosmetics.com.br", href: "/" },
  { label: "todos produtos", href: "/produtos" },
  { label: "manteiga", isActive: true },
];

export default function PesquisaPage() {
  const [activeSort, setActiveSort] = useState("sort-relevancia");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(["filtro-1"]));
  const [currentPage, setCurrentPage] = useState(2);

  const handleFilterChange = (sectionTitle: string, itemId: string) => {
    if (sectionTitle === "Ordenar por") {
      setActiveSort(itemId);
    } else if (sectionTitle === "Filtrar por") {
      const newFilters = new Set(activeFilters);
      if (newFilters.has(itemId)) {
        newFilters.delete(itemId);
      } else {
        newFilters.add(itemId);
      }
      setActiveFilters(newFilters);
    }
  };

  const filterSections = useMemo(
    () =>
      filterSectionsConfig.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          isActive:
            section.type === "single"
              ? item.id === activeSort
              : activeFilters.has(item.id),
        })),
      })),
    [activeSort, activeFilters]
  );

  const totalPages = 10;

  return (
    <div className="bg-white w-full max-w-[1440px] mx-auto flex flex-col">
      {/* 1.1 Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* 1.2 Title Header */}
      <TitleHeader
        title="Manteiga"
        description="Hidratação profunda, alívio das inflamações e rachaduras"
      />

      {/* 1.3 Main Content Area */}
      <div className="flex gap-[16px] items-start p-[16px] w-full">
        {/* 1.3.1 Filters Sidebar */}
        <div className="w-[220px] shrink-0">
          <FiltersSidebar
            sections={filterSections}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* 1.3.2 Products Area */}
        <div className="flex flex-col gap-[32px] items-center flex-1">
          {/* 1.3.2.1 Products Grid */}
          <ProductsGrid produtos={mockProdutos} />

          {/* 1.3.2.2 Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
