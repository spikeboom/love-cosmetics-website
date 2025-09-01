"use client";

import React, { useState, useMemo } from 'react';
import ProductGallery from '@/components/gallery/ProductGallery';
import ProductModal from '@/components/gallery/ProductModal';
import GalleryNavigation from '@/components/gallery/GalleryNavigation';
import GallerySubHeader from '@/components/gallery/GallerySubHeader';
import GalleryStats from '@/components/gallery/GalleryStats';
import { type Categoria, type Subcategoria } from '@/components/gallery/categoryMapper';
import galleryData from '@/data/upload_urls_cache.json';

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

export default function GaleriaPage() {
  // Ensure client-side only during SSR/build
  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  const [selectedProduct, setSelectedProduct] = useState<(Product & { category: string; key: string }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | undefined>();
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategoria | undefined>();

  const data = galleryData as GalleryData;

  // Calculate product counts for categories and subcategories
  const productCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    Object.entries(data).forEach(([category, categoryData]) => {
      const productCount = Object.keys(categoryData.processedProducts || {}).length;
      counts[category] = productCount;
    });
    
    return counts;
  }, [data]);

  // Calculate total products
  const totalProducts = useMemo(() => {
    return Object.values(productCounts).reduce((acc, count) => acc + count, 0);
  }, [productCounts]);

  const handleProductClick = (product: Product & { category: string; key: string }) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCategoryChange = (categoria?: Categoria, subcategoria?: Subcategoria) => {
    setSelectedCategory(categoria);
    setSelectedSubcategory(subcategoria);
  };

  return (
    <>
      <GalleryNavigation />
      <GallerySubHeader 
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        productCounts={productCounts}
        totalProducts={totalProducts}
      />
      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {/* <GalleryStats /> */}
          <ProductGallery 
            onProductClick={handleProductClick}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        </div>
      </main>
    </>
  );
}