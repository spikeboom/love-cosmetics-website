"use client";

import { useState, useMemo } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { SearchFilters } from "../components/SearchFilters";
import { ProductGrid } from "../components/ProductGrid";

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

const mockProdutos: Produto[] = [
  {
    imagem: "/new-home/produtos/produto-1.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao:
      "A manteiga corporal hidrata profundamente, alivia inflamações e rachaduras, fortalece a barreira da pele e proporciona maciez imediata. Ideal para peles ressecadas.",
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
    descricao:
      "Formulação enriquecida com manteigas naturais e óleos essenciais. Proporciona hidratação duradoura e deixa a pele macia, suave e protegida. Para uso diário.",
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
    descricao:
      "Com ingredientes ativos da Amazônia que regeneram a pele. Reduz inflamações, alivia coceira e proporciona conforto imediato. Textura cremosa e de rápida absorção.",
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
    descricao:
      "Especializada em hidratar e proteger áreas ressecadas. Com componentes naturais que fortalecem a barreira protetora da pele. Indicada para peles sensíveis.",
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
    descricao:
      "Blend perfeito de manteigas vegetais e óleos essenciais amazônicos. Nutre profundamente, deixa a pele aveludada e sem ressecamento. Uso noturno recomendado.",
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
    descricao:
      "Tratamento intensivo para pele muito ressecada e inflamada. Regenera, acalma e hidrata profundamente com ação anti-inflamatória comprovada. Resultado visível.",
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
    descricao:
      "Mantém a pele hidratada, macia e protegida por até 24 horas. Absorve rapidamente sem deixar oleosidade. Adequado para todos os tipos de pele.",
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
    descricao:
      "Fórmula vegana e cruelty-free com extratos naturais da floresta amazônica. Repara rachaduras, hidrata e deixa aroma agradável. Resultado imediato.",
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
    descricao:
      "Desenvolvida para aliviar inflamações e coceiras. Com manteiga de karité e óleos essenciais anti-inflamatórios. Proporciona alívio e conforto duradouros.",
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
    descricao:
      "Hidratação profunda e duradoura. Repara a barreira de proteção da pele. Testado dermatologicamente. Não deixa resíduos gordurosos na pele.",
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
    descricao:
      "Com ativos anti-inflamatórios e regeneradores. Ideal para recuperar pele ressecada, irritada ou com rachaduras. Uso contínuo potencializa resultados.",
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
    descricao:
      "Manteiga premium com concentração máxima de ativos naturais. Hidrata, protege e rejuvenesce a pele. Aroma sofisticado e textura sedosa.",
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
    type: "single" as const, // Apenas uma opção
    items: [
      { id: "sort-relevancia", label: "Relevância" },
      { id: "sort-menor", label: "Menor preço" },
      { id: "sort-maior", label: "Maior preço" },
    ],
  },
  {
    title: "Filtrar por",
    type: "multiple" as const, // Múltiplas opções
    items: [
      { id: "filtro-1", label: "Filtro", hasIcon: true },
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

export default function SearchPage() {
  // Estado para "Ordenar por" (apenas uma opção - usa ID)
  const [activeSort, setActiveSort] = useState("sort-relevancia");

  // Estado para "Filtrar por" (múltiplas opções - usa IDs)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(["filtro-1"]));

  const handleFilterChange = (section: string, itemId: string) => {
    if (section === "Ordenar por") {
      // Radio button: substitui a seleção anterior
      setActiveSort(itemId);
    } else if (section === "Filtrar por") {
      // Checkbox: alterna a seleção
      const newFilters = new Set(activeFilters);
      if (newFilters.has(itemId)) {
        newFilters.delete(itemId);
      } else {
        newFilters.add(itemId);
      }
      setActiveFilters(newFilters);
    }
  };

  // Cria as seções com as informações de ativo dinâmicas
  const filterSections = useMemo(
    () =>
      filterSectionsConfig.map((section) => ({
        ...section,
        items: section.items.map((item: any) => ({
          ...item,
          isActive:
            section.type === "single"
              ? item.id === activeSort
              : activeFilters.has(item.id),
        })),
      })),
    [activeSort, activeFilters]
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Title Section */}
      <div className="box-border flex flex-col gap-[16px] items-start p-[16px] w-full bg-white">
        <div className="flex flex-col justify-center leading-[0]">
          <p className="font-cera-pro font-bold text-[32px] text-black leading-normal">
            Manteiga
          </p>
        </div>
        <p className="font-cera-pro font-light text-[14px] text-black leading-normal w-full">
          Hidratação profunda, alívio das inflamações e rachaduras
        </p>
      </div>

      {/* Main Content */}
      <div className="flex gap-[16px] items-start p-[16px] w-full bg-white">
        {/* Sidebar Filters */}
        <SearchFilters
          sections={filterSections}
          onFilterChange={handleFilterChange}
        />

        {/* Product Grid */}
        <div className="flex-1">
          <ProductGrid produtos={mockProdutos} paginaPorPagina={12} />
        </div>
      </div>
    </div>
  );
}
