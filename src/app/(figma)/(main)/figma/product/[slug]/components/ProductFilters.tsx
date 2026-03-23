"use client";

import { ExpandableSection } from "../../../components/ExpandableSection";

interface ProductFiltersProps {
  produto: any;
  expandedFilter: string | null;
  onToggleFilter: (filter: string | null) => void;
  isMobile: boolean;
}

export function ProductFilters({
  produto,
  expandedFilter,
  onToggleFilter,
  isMobile,
}: ProductFiltersProps) {
  const handleToggle = (filter: string) => {
    onToggleFilter(expandedFilter === filter ? null : filter);
  };

  return (
    <div className={`flex flex-col gap-0 w-full ${isMobile ? "md:hidden" : "hidden md:flex"}`}>
      {/* Ativos presentes */}
      {produto?.o_que_ele_tem?.length > 0 && (
        <ExpandableSection
          title="Ativos presentes"
          isExpanded={expandedFilter === "ativos"}
          onToggle={() => handleToggle("ativos")}
          isMobile={isMobile}
        >
          <ul className="space-y-[8px]">
            {produto.o_que_ele_tem.map((item: any) => (
              <li key={item.id} className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal]">
                <strong className="font-bold">{item.titulo}:</strong> {item.descricao}
              </li>
            ))}
          </ul>
        </ExpandableSection>
      )}

      {/* Modo de uso */}
      {produto?.como_usar_essa_formula?.length > 0 && (
        <ExpandableSection
          title="Modo de uso"
          isExpanded={expandedFilter === "modo"}
          onToggle={() => handleToggle("modo")}
          isMobile={isMobile}
        >
          <ul className="space-y-[8px]">
            {produto.como_usar_essa_formula.map((item: any) => (
              <li key={item.id} className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal]">
                {item.texto}
              </li>
            ))}
          </ul>
        </ExpandableSection>
      )}

      {/* Conheca mais sobre o produto */}
      {produto?.o_que_ele_e && (
        <ExpandableSection
          title="Conheca mais sobre o produto"
          isExpanded={expandedFilter === "conheca"}
          onToggle={() => handleToggle("conheca")}
          isMobile={isMobile}
        >
          <p className="font-cera-pro font-light text-[16px] text-[#111111] leading-[normal] text-justify">
            {produto.o_que_ele_e}
          </p>
        </ExpandableSection>
      )}
    </div>
  );
}
