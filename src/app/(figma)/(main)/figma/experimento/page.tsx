"use client";

import { useState } from "react";
import {
  Breadcrumbs,
  TitleHeader,
  FiltersSidebar,
  ProductsArea,
  Pagination,
  NewsletterSection,
} from "./components";
import { CertificadosSection } from "../components/CertificadosSection";

const breadcrumbItems = [
  { label: "lovecosmetics.com.br", href: "/" },
  { label: "todos produtos", href: "/produtos" },
  { label: "manteiga" },
];

const filterSections = [
  {
    title: "Ordenar por",
    items: [
      { id: "sort-relevancia", label: "Relevância", isActive: true },
      { id: "sort-menor", label: "Menor preço", isActive: false },
      { id: "sort-maior", label: "Maior preço", isActive: false },
    ],
  },
  {
    title: "Filtrar por",
    items: [
      { id: "filtro-1", label: "Filtro", isActive: true, hasIcon: true },
      { id: "filtro-2", label: "Filtro", isActive: false },
      { id: "filtro-3", label: "Filtro", isActive: false },
      { id: "filtro-4", label: "Filtro", isActive: false },
      { id: "filtro-5", label: "Filtro", isActive: false },
      { id: "filtro-6", label: "Filtro", isActive: false },
      { id: "filtro-7", label: "Filtro", isActive: false },
      { id: "filtro-8", label: "Filtro", isActive: false },
      { id: "filtro-9", label: "Filtro", isActive: false },
    ],
  },
];

export default function ExperimentoPage() {
  const [filters, setFilters] = useState(filterSections);

  const handleFilterChange = (sectionTitle: string, itemId: string) => {
    setFilters((prev) =>
      prev.map((section) => {
        if (section.title !== sectionTitle) return section;

        if (sectionTitle === "Ordenar por") {
          return {
            ...section,
            items: section.items.map((item) => ({
              ...item,
              isActive: item.id === itemId,
            })),
          };
        } else {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, isActive: !item.isActive } : item
            ),
          };
        }
      })
    );
  };

  return (
    <div className="bg-white flex flex-col items-start relative w-full">
      {/* 1.1 breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* 1.2 Frame 2608659 */}
      <div className="flex items-start relative shrink-0 w-full">
        <TitleHeader
          title="Manteiga"
          subtitle="Hidratação profunda, alívio das inflamações e rachaduras"
        />
      </div>

      {/* 1.3 Frame 2608651 */}
      <div className="flex flex-wrap gap-[16px] items-start p-[16px] relative shrink-0 w-full">
        {/* 1.3.1 Frame 2608661 */}
        <FiltersSidebar sections={filters} onFilterChange={handleFilterChange} />

        {/* 1.3.2 Frame 2608660 */}
        <div className="flex flex-col gap-[32px] items-center relative shrink-0 w-[1172px]">
          {/* 1.3.2.1 Frame 2608671 - Products Grid */}
          <ProductsArea columns={3} rows={4} />

          {/* 1.3.2.2 Component paginação mobile */}
          <Pagination currentPage={2} totalPages={10} />
        </div>
      </div>

      {/* Certificados */}
      <CertificadosSection />

      {/* Section 5 */}
      <NewsletterSection />
    </div>
  );
}
