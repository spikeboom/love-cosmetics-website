"use client";

import React, { useState, useRef, useEffect } from 'react';
import { categorias, type Categoria, type Subcategoria } from '@/data/categorias';
import { ChevronDown, Menu } from 'lucide-react';
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
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (categorySlug: string) => {
    // Cancela o timeout de fechamento se existir
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(categorySlug);
  };

  const handleMouseLeave = () => {
    // Adiciona delay de 300ms antes de fechar
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
  };

  const handleClick = (categorySlug: string) => {
    setActiveDropdown(activeDropdown === categorySlug ? null : categorySlug);
  };

  const handleCategorySelect = (categoria?: Categoria, subcategoria?: Subcategoria) => {
    onCategoryChange?.(categoria, subcategoria);
    setActiveDropdown(null);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, [activeDropdown]);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[90px] z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center overflow-x-auto py-3 gap-4 scrollbar-hide" ref={dropdownRef}>
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
          <button
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
          </button>

          {/* Categorias visíveis */}
          {(showAllCategories ? categorias : categorias.slice(0, 4)).map((categoria) => {
            const categoryProductCount = getCategoryProductCount(categoria);
            const isActive = activeDropdown === categoria.slug;
            const isSelected = selectedCategory?.slug === categoria.slug;

            return (
              <div key={categoria.slug} className="relative flex-shrink-0">
                <button
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
                  <ChevronDown 
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${isActive ? 'rotate-180' : ''}`} 
                  />
                  {categoryProductCount > 0 && (
                    <span className="hidden sm:inline text-xs bg-white/20 px-1.5 py-0.5 rounded-full ml-1">
                      {categoryProductCount}
                    </span>
                  )}
                </button>

                {/* Dropdown de subcategorias */}
                {isActive && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto"
                    onMouseEnter={() => handleMouseEnter(categoria.slug)}
                    onMouseLeave={handleMouseLeave}
                  >
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
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                )}
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
  );
};

export default GallerySubHeader;