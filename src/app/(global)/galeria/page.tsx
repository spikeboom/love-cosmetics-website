"use client";

import React, { useState } from 'react';
import ProductGallery from '@/components/gallery/ProductGallery';
import ProductModal from '@/components/gallery/ProductModal';
import GalleryNavigation from '@/components/gallery/GalleryNavigation';
import GalleryStats from '@/components/gallery/GalleryStats';

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


export default function GaleriaPage() {
  const [selectedProduct, setSelectedProduct] = useState<(Product & { category: string; key: string }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: Product & { category: string; key: string }) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <GalleryNavigation />
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
          />
        </div>
      </main>
    </>
  );
}