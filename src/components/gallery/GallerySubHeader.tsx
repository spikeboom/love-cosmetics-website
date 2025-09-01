"use client";

import React, { useState, useRef, useEffect } from 'react';
import { categorias, type Categoria, type Subcategoria } from '@/data/categorias';
import { ChevronDown, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface GallerySubHeaderProps {
  onCategoryChange?: (categoria?: Categoria, subcategoria?: Subcategoria) => void;
  selectedCategory?: Categoria;
  selectedSubcategory?: Subcategoria;
  productCounts?: { [key: string]: number };
  totalProducts?: number;
}

const GallerySubHeader: React.FC<GallerySubHeaderProps> = ({
  onCategoryChange,
  selectedCategory,
  selectedSubcategory,
  productCounts = {},
  totalProducts = 0
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleMouseEnter = (categorySlug: string) => {
    // Cancela o timeout de fechamento se existir
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    
    // Calcular posição do dropdown
    const button = buttonRefs.current[categorySlug];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(288, rect.width) // min 288px (w-72)
      });
    }
    
    setActiveDropdown(categorySlug);
  };

  const handleMouseLeave = () => {
    // Adiciona delay de 300ms antes de fechar
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setDropdownPosition(null);
    }, 300);
  };

  const handleClick = (categorySlug: string) => {
    if (activeDropdown === categorySlug) {
      setActiveDropdown(null);
      setDropdownPosition(null);
    } else {
      // Calcular posição do dropdown
      const button = buttonRefs.current[categorySlug];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: Math.max(288, rect.width)
        });
      }
      setActiveDropdown(categorySlug);
    }
  };

  const handleCategorySelect = (categoria?: Categoria, subcategoria?: Subcategoria) => {
    onCategoryChange?.(categoria, subcategoria);
    setActiveDropdown(null);
    setDropdownPosition(null);
  };

  const getCategoryProductCount = (categoria: Categoria): number => {
    return categoria.subcategorias.reduce((acc, sub) => {
      const mappedKey = `${categoria.nome} ${sub.nome}`;
      return acc + (productCounts[mappedKey] || 0);
    }, 0);
  };

  const getSubcategoryProductCount = (categoria: Categoria, subcategoria: Subcategoria): number => {
    const mappedKey = `${categoria.nome} ${subcategoria.nome}`;
    return productCounts[mappedKey] || 0;
  };

  // Função para verificar se pode fazer scroll
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  };

  // Funções de scroll
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setDropdownPosition(null);
      }
    };

    const handleScroll = () => {
      if (activeDropdown && buttonRefs.current[activeDropdown]) {
        const button = buttonRefs.current[activeDropdown];
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: Math.max(288, rect.width)
        });
      }
    };

    const handleResize = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
        setDropdownPosition(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, [activeDropdown]);

  // Effect para verificar scroll inicial e adicionar listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Verificar inicialmente
      checkScrollability();
      
      // Adicionar listener de scroll
      const handleScroll = () => {
        checkScrollability();
      };
      
      container.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', checkScrollability);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [showAllCategories]); // Re-executar quando mostrar/ocultar categorias

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[90px] z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Seta esquerda - apenas desktop */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll para esquerda"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        {/* Seta direita - apenas desktop */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll para direita"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        {/* Gradiente esquerdo - apenas desktop */}
        {canScrollLeft && (
          <div className="hidden lg:block absolute left-10 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-[5] pointer-events-none"></div>
        )}

        {/* Gradiente direito - apenas desktop */}
        {canScrollRight && (
          <div className="hidden lg:block absolute right-10 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-[5] pointer-events-none"></div>
        )}

        <div className="overflow-x-hidden scrollbar-hide" ref={scrollContainerRef}>
          <div className="flex items-center py-3 gap-1 min-w-max px-2 lg:px-12" ref={dropdownRef}>
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          {/* Todos os produtos */}
          {/* <button
            onClick={() => handleCategorySelect()}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              !selectedCategory
                ? 'bg-[#dcafad] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="hidden sm:inline">Todos os produtos</span>
            <span className="sm:hidden">Todos</span>
            {totalProducts > 0 && (
              <span className="text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                {totalProducts}
              </span>
            )}
          </button> */}

          {/* Categorias visíveis */}
          {(showAllCategories ? categorias : categorias.slice(0, 4)).map((categoria) => {
            const categoryProductCount = getCategoryProductCount(categoria);
            const isActive = activeDropdown === categoria.slug;
            const isSelected = selectedCategory?.slug === categoria.slug;

            return (
              <div key={categoria.slug} className="relative flex-shrink-0">
                <button
                  ref={(el) => { buttonRefs.current[categoria.slug] = el; }}
                  onClick={() => handleClick(categoria.slug)}
                  onMouseEnter={() => handleMouseEnter(categoria.slug)}
                  onMouseLeave={handleMouseLeave}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#dcafad] text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="truncate max-w-[80px] sm:max-w-none">{categoria.nome}</span>
                </button>

                {/* Espaço reservado - dropdown será renderizado fora */}
              </div>
            );
          })}

          {/* Botão "Mais" para mostrar todas as categorias */}
          {!showAllCategories && categorias.length > 4 && (
            <button
              onClick={() => setShowAllCategories(true)}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap flex-shrink-0"
              title="Ver todas as categorias"
            >
              <Menu className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mais</span>
              <span className="sm:hidden">+{categorias.length - 4}</span>
            </button>
          )}

          {/* Botão para ocultar categorias extras em mobile */}
          {showAllCategories && (
            <button
              onClick={() => setShowAllCategories(false)}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap flex-shrink-0 sm:hidden"
            >
              <ChevronDown className="w-3 h-3 rotate-180" />
              Menos
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Dropdown renderizado fora do overflow */}
      {activeDropdown && dropdownPosition && (
        <div
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[100] max-h-80"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
          onMouseEnter={() => {
            if (dropdownTimeoutRef.current) {
              clearTimeout(dropdownTimeoutRef.current);
              dropdownTimeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          {(() => {
            const categoria = categorias.find(cat => cat.slug === activeDropdown);
            if (!categoria) return null;
            
            const categoryProductCount = getCategoryProductCount(categoria);
            
            return (
              <div className="p-3">
                {/* Header da categoria */}
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{categoria.nome}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{categoryProductCount} produtos</p>
                </div>
                
                {/* Opção para toda a categoria */}
                <button
                  onClick={() => handleCategorySelect(categoria)}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-[#dcafad]/10 hover:text-[#dcafad] transition-colors border border-transparent hover:border-[#dcafad]/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Ver todos</span>
                    <span className="text-xs bg-[#dcafad]/10 text-[#dcafad] px-2 py-0.5 rounded-full">
                      {categoryProductCount}
                    </span>
                  </div>
                </button>

                {categoria.subcategorias.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Subcategorias</p>
                    {categoria.subcategorias.map((subcategoria) => {
                      const subProductCount = getSubcategoryProductCount(categoria, subcategoria);
                      const isSubSelected = 
                        selectedCategory?.slug === categoria.slug && 
                        selectedSubcategory?.slug === subcategoria.slug;

                      return (
                        <button
                          key={subcategoria.slug}
                          onClick={() => handleCategorySelect(categoria, subcategoria)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            isSubSelected
                              ? 'bg-[#dcafad] text-white font-medium shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{subcategoria.nome}</span>
                            {subProductCount > 0 && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                                isSubSelected 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                              }`}>
                                {subProductCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default GallerySubHeader;