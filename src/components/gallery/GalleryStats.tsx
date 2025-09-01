"use client";

import React, { useMemo } from 'react';
import galleryData from '@/data/upload_urls_cache.json';
import { categorias } from './categoryMapper';

interface CategoryData {
  processedProducts: Record<string, any>;
}

type GalleryData = Record<string, CategoryData>;

const GalleryStats: React.FC = () => {
  const data = galleryData as GalleryData;
  
  const stats = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        totalCategories: 0,
        totalSubcategories: 0,
        totalProducts: 0,
        totalImages: 0,
        hierarchicalStats: [],
        topSubcategories: []
      };
    }
    
    let totalProducts = 0;
    let totalImages = 0;
    
    const hierarchicalStats = categorias.map(categoria => {
      const subcategoryStats = categoria.subcategorias.map(subcategoria => {
        const mappedKey = `${categoria.nome} ${subcategoria.nome}`;
        const products = data[mappedKey]?.processedProducts || {};
        const productsCount = Object.keys(products).length;
        const imagesCount = Object.values(products).reduce((acc: number, product: any) => {
          return acc + (product?.images?.length || 0);
        }, 0);
        
        totalProducts += productsCount;
        totalImages += imagesCount;
        
        return {
          name: subcategoria.nome,
          slug: subcategoria.slug,
          products: productsCount,
          images: imagesCount
        };
      });
      
      const categoryTotalProducts = subcategoryStats.reduce((acc, sub) => acc + sub.products, 0);
      const categoryTotalImages = subcategoryStats.reduce((acc, sub) => acc + sub.images, 0);
      
      return {
        name: categoria.nome,
        slug: categoria.slug,
        products: categoryTotalProducts,
        images: categoryTotalImages,
        subcategorias: subcategoryStats.filter(sub => sub.products > 0)
      };
    }).filter(cat => cat.products > 0);
    
    // Flat list for top categories by products
    const allSubcategories = hierarchicalStats.flatMap(cat => 
      cat.subcategorias.map(sub => ({
        ...sub,
        categoryName: cat.name
      }))
    ).sort((a, b) => b.products - a.products);
    
    return {
      totalCategories: hierarchicalStats.length,
      totalSubcategories: hierarchicalStats.reduce((acc, cat) => acc + cat.subcategorias.length, 0),
      totalProducts,
      totalImages,
      hierarchicalStats: hierarchicalStats.sort((a, b) => b.products - a.products),
      topSubcategories: allSubcategories.slice(0, 10)
    };
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Estatísticas da Galeria
      </h2>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            {stats.totalCategories}
          </div>
          <div className="text-xs text-pink-700 dark:text-pink-300">
            Categorias
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalSubcategories}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300">
            Subcategorias
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalProducts}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            Produtos
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalImages}
          </div>
          <div className="text-xs text-green-700 dark:text-green-300">
            Imagens
          </div>
        </div>
      </div>

      {/* Top Subcategories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Top 10 Subcategorias
        </h3>
        <div className="space-y-2">
          {stats.topSubcategories.map((subcategory, index) => (
            <div 
              key={`${subcategory.categoryName}-${subcategory.name}`}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                  #{index + 1}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {subcategory.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {subcategory.categoryName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span>{subcategory.products} produtos</span>
                <span>{subcategory.images} imagens</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryStats;