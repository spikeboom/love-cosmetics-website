"use client";

import { useState } from "react";
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
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
      "A melhor solução hidratante para sua pele. Com ingredientes naturais da Amazônia e propriedades anti-inflamatórias.",
    preco: 119.99,
    precoOriginal: 140.99,
    desconto: "15% OFF",
    parcelas: "3x R$39,99 sem juros",
    rating: 5,
    ultimasUnidades: true,
  },
];

const filterSections = [
  {
    title: "Ordenar por",
    items: [
      { label: "Relevância", isActive: true },
      { label: "Menor preço", isActive: false },
      { label: "Maior preço", isActive: false },
    ],
  },
  {
    title: "Filtrar por",
    items: [
      { label: "Filtro", isActive: true, hasIcon: true },
      { label: "Filtro", isActive: false },
      { label: "Filtro", isActive: false },
      { label: "Filtro", isActive: false },
      { label: "Filtro", isActive: false },
      { label: "Filtro", isActive: false },
      { label: "Filtro", isActive: false },
      { label: "Filtro", isActive: false },
      { label: "Filtro", isActive: false },
    ],
  },
];

const breadcrumbItems = [
  { label: "lovecosmetics.com.br", href: "/" },
  { label: "todos produtos", href: "/produtos" },
  { label: "manteiga", isActive: true },
];

export default function SearchPage() {
  const [activeSort, setActiveSort] = useState("Relevância");
  const [activeFilter, setActiveFilter] = useState("Filtro");

  const handleFilterChange = (section: string, item: string) => {
    if (section === "Ordenar por") {
      setActiveSort(item);
    } else if (section === "Filtrar por") {
      setActiveFilter(item);
    }
  };

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
