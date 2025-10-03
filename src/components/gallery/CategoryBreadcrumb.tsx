"use client";

import React from 'react';
import { type Categoria, type Subcategoria } from './categoryMapper';

interface CategoryBreadcrumbProps {
  selectedCategory?: Categoria;
  selectedSubcategory?: Subcategoria;
  onCategoryChange: (categoria?: Categoria, subcategoria?: Subcategoria) => void;
  totalProducts: number;
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  totalProducts
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      <button
        onClick={() => onCategoryChange()}
        className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
      >
        Todos os produtos
      </button>
      
      {selectedCategory && (
        <>
          <span>/</span>
          <button
            onClick={() => onCategoryChange(selectedCategory)}
            className={`hover:text-pink-600 dark:hover:text-pink-400 transition-colors ${
              !selectedSubcategory ? 'text-pink-600 dark:text-pink-400 font-medium' : ''
            }`}
          >
            {selectedCategory.nome}
          </button>
        </>
      )}
      
      {selectedSubcategory && (
        <>
          <span>/</span>
          <span className="text-pink-600 dark:text-pink-400 font-medium">
            {selectedSubcategory.nome}
          </span>
        </>
      )}
      
      <span className="text-gray-400">•</span>
      <span className="text-gray-700 dark:text-gray-300">
        {totalProducts} {totalProducts === 1 ? 'produto' : 'produtos'}
      </span>
    </div>
  );
};

export default CategoryBreadcrumb;