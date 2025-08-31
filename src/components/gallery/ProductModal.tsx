"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { strapiConfig } from '@/utils/strapi-config';

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

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="w-full fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
              {product.originalProductTitle}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 text-sm px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {product.images.length} imagens
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Main Image */}
          <div className="flex-1 relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <div className="relative w-full h-96 lg:h-full">
              <Image
                src={strapiConfig.getImageUrl(product.images[currentImageIndex]?.strapiUrl)}
                alt={`${product.originalProductTitle} - Imagem ${currentImageIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-contain"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="w-full lg:w-48 bg-gray-50 dark:bg-gray-900 p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Todas as imagens
            </h3>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageClick(index)}
                  className={`relative aspect-square rounded border-2 overflow-hidden ${
                    index === currentImageIndex
                      ? 'border-pink-500'
                      : 'border-gray-200 dark:border-gray-600 hover:border-pink-300'
                  }`}
                >
                  <Image
                    src={strapiConfig.getImageUrl(image.strapiFormats.thumbnail?.url || image.strapiUrl)}
                    alt={`${product.originalProductTitle} - Thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </button>
              ))}
            </div>

            {/* Product Details */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Adicionado em:
                </span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(product.uploadedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Categoria:
                </span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.category}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;