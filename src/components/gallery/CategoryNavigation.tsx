"use client";

import React, { useState, useMemo } from 'react';
import { categorias, type Categoria, type Subcategoria, mapCategoryName } from '@/data/categorias';

interface CategoryNavigationProps {
  onCategoryChange: (categoria?: Categoria, subcategoria?: Subcategoria) => void;
  selectedCategory?: Categoria;
  selectedSubcategory?: Subcategoria;
  productCounts: { [key: string]: number };
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  onCategoryChange,
  selectedCategory,
  selectedSubcategory,
  productCounts
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoriaSlug: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoriaSlug)) {
      newExpanded.delete(categoriaSlug);
    } else {
      newExpanded.add(categoriaSlug);
    }
    setExpandedCategories(newExpanded);
  };

  const totalProducts = useMemo(() => {
    return Object.values(productCounts).reduce((acc, count) => acc + count, 0);
  }, [productCounts]);

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Categorias
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Navegue por categoria e subcategoria
        </p>
      </div>

      {/* All Products Option */}
      <div className="p-2">
        <button
          onClick={() => onCategoryChange()}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            !selectedCategory
              ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">Todos os produtos</span>
            <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {totalProducts}
            </span>
          </div>
        </button>
      </div>

      {/* Category List */}
      <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
        {categorias.map((categoria) => {
          const categoryProductCount = getCategoryProductCount(categoria);
          const isExpanded = expandedCategories.has(categoria.slug);
          const isSelected = selectedCategory?.slug === categoria.slug;

          return (
            <div key={categoria.slug} className="space-y-1">
              {/* Main Category */}
              <div className="flex items-center">
                <button
                  onClick={() => toggleCategory(categoria.slug)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="text-gray-400 text-sm">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>
                <button
                  onClick={() => onCategoryChange(categoria)}
                  className={`flex-1 text-left px-2 py-2 rounded-lg transition-colors ${
                    isSelected && !selectedSubcategory
                      ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{categoria.nome}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {categoryProductCount}
                    </span>
                  </div>
                </button>
              </div>

              {/* Subcategories */}
              {isExpanded && (
                <div className="ml-6 space-y-1">
                  {categoria.subcategorias.map((subcategoria) => {
                    const subProductCount = getSubcategoryProductCount(categoria, subcategoria);
                    const isSubSelected = 
                      selectedCategory?.slug === categoria.slug && 
                      selectedSubcategory?.slug === subcategoria.slug;

                    return (
                      <button
                        key={subcategoria.slug}
                        onClick={() => onCategoryChange(categoria, subcategoria)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          isSubSelected
                            ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{subcategoria.nome}</span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {subProductCount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {categorias.length} categorias principais • {categorias.reduce((acc, cat) => acc + cat.subcategorias.length, 0)} subcategorias
      </div>
    </div>
  );
};

export default CategoryNavigation;