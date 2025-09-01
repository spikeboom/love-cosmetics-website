"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import galleryData from '@/data/upload_urls_cache.json';
import CategoryNavigation from './CategoryNavigation';
import CategoryBreadcrumb from './CategoryBreadcrumb';
import { strapiConfig } from '@/utils/strapi-config';
import { type Categoria, type Subcategoria, mapCategoryName } from './categoryMapper';

interface ProductImage {
  filename: string;
  strapiId: number;
  strapiUrl: string;
  strapiFormats: {
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
    small?: {
      url: string;
      width: number;
      height: number;
    };
  };
  uploadedAt: string;
}

interface Product {
  originalProductTitle: string;
  uploadedAt: string;
  images: ProductImage[];
  category?: string;
  key?: string;
}

interface CategoryData {
  processedProducts: Record<string, Product>;
}

type GalleryData = Record<string, CategoryData>;

interface ProductGalleryProps {
  onProductClick?: (product: Product & { category: string; key: string }) => void;
  selectedCategory?: Categoria;
  selectedSubcategory?: Subcategoria;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  onProductClick,
  selectedCategory: propSelectedCategory,
  selectedSubcategory: propSelectedSubcategory 
}) => {
  const [localSelectedCategory, setLocalSelectedCategory] = useState<Categoria | undefined>(undefined);
  const [localSelectedSubcategory, setLocalSelectedSubcategory] = useState<Subcategoria | undefined>(undefined);
  
  // Use props if provided, otherwise use local state
  const selectedCategory = propSelectedCategory !== undefined ? propSelectedCategory : localSelectedCategory;
  const selectedSubcategory = propSelectedSubcategory !== undefined ? propSelectedSubcategory : localSelectedSubcategory;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const data = galleryData as GalleryData;

  const allProducts = useMemo(() => {
    const products: Array<Product & { 
      category: string; 
      key: string;
      mappedCategory?: Categoria;
      mappedSubcategory?: Subcategoria;
    }> = [];
    
    Object.entries(data).forEach(([category, categoryData]) => {
      Object.entries(categoryData.processedProducts || {}).forEach(([productKey, product]) => {
        const mapped = mapCategoryName(category);
        products.push({
          ...product,
          category,
          key: productKey,
          mappedCategory: mapped?.categoria,
          mappedSubcategory: mapped?.subcategoria
        });
      });
    });

    return products;
  }, [data]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by hierarchical category selection
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.mappedCategory?.slug === selectedCategory.slug
      );
      
      if (selectedSubcategory) {
        filtered = filtered.filter(product => 
          product.mappedSubcategory?.slug === selectedSubcategory.slug
        );
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.originalProductTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.mappedCategory?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.mappedSubcategory?.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.originalProductTitle.localeCompare(b.originalProductTitle);
      } else {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });
  }, [allProducts, selectedCategory, selectedSubcategory, searchTerm, sortBy]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    Object.keys(data).forEach(category => {
      const productsInCategory = Object.keys(data[category]?.processedProducts || {}).length;
      stats[category] = productsInCategory;
    });
    return stats;
  }, [data]);

  const handleCategoryChange = (categoria?: Categoria, subcategoria?: Subcategoria) => {
    // Only update local state if no props are provided
    if (propSelectedCategory === undefined) {
      setLocalSelectedCategory(categoria);
    }
    if (propSelectedSubcategory === undefined) {
      setLocalSelectedSubcategory(subcategoria);
    }
  };

  const handleProductClick = (product: Product & { category: string; key: string }) => {
    onProductClick?.(product);
  };

  return (
    <>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Galeria de Produtos
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore nossa coleção completa de cosméticos organizados por categoria
          </p>
        </div>

        {/* Navigation Layout */}
        <div className={`grid ${propSelectedCategory !== undefined || propSelectedSubcategory !== undefined ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-6`}>
          {/* Category Navigation Sidebar - Only show if no external category control */}
          {propSelectedCategory === undefined && propSelectedSubcategory === undefined && (
            <div className="lg:col-span-1">
              <CategoryNavigation
                onCategoryChange={handleCategoryChange}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                productCounts={categoryStats}
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className={`${propSelectedCategory !== undefined || propSelectedSubcategory !== undefined ? 'col-span-1' : 'lg:col-span-3'} space-y-6`}>
            {/* Breadcrumb */}
            <CategoryBreadcrumb
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={handleCategoryChange}
              totalProducts={filteredProducts.length}
            />

            {/* Search and Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Sort and View Controls */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="date">Mais recente</option>
                  <option value="name">Nome A-Z</option>
                </select>
                
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  title={viewMode === 'grid' ? 'Visualização em lista' : 'Visualização em grade'}
                >
                  {viewMode === 'grid' ? '☰' : '⊞'}
                </button>
              </div>
            </div>

            {/* Gallery */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' 
                : 'space-y-4'
            }`}>
          {filteredProducts.map((product, index) => (
            <div
              key={`${product.category}-${product.key}-${index}`}
              onClick={() => handleProductClick(product)}
              className={`${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'
                  : 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-shadow'
              }`}
            >
              {/* Product Images */}
              <div className={`${
                viewMode === 'grid' ? 'w-full' : 'w-32 h-32 flex-shrink-0'
              }`}>
                {product.images.length > 0 && (
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'aspect-square relative' 
                      : 'w-full h-full relative'
                  }`}>
                    <Image
                      src={strapiConfig.getImageUrl(product.images[0].strapiFormats.small?.url || product.images[0].strapiUrl)}
                      alt={product.originalProductTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-contain rounded-t-lg"
                      loader={({ src }) => src}
                    />
                    {product.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        +{product.images.length - 1}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className={`${viewMode === 'grid' ? 'p-4' : 'flex-1 min-w-0'}`}>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                    {product.originalProductTitle}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 text-xs px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div>Adicionado em: {new Date(product.uploadedAt).toLocaleDateString('pt-BR')}</div>
                    <div>{product.images.length} imagens</div>
                  </div>

                  {/* Mini gallery for grid view */}
                  {viewMode === 'grid' && product.images.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto">
                      {product.images.slice(1, 4).map((image, imgIndex) => (
                        <div key={imgIndex} className="w-12 h-12 relative flex-shrink-0">
                          <Image
                            src={strapiConfig.getImageUrl(image.strapiFormats.thumbnail?.url || image.strapiUrl)}
                            alt={`${product.originalProductTitle} ${imgIndex + 2}`}
                            fill
                            sizes="48px"
                            className="object-contain rounded border"
                            loader={({ src }) => src}
                          />
                        </div>
                      ))}
                      {product.images.length > 4 && (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded border flex items-center justify-center text-xs text-gray-500">
                          +{product.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tente ajustar os filtros ou termo de busca
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductGallery;