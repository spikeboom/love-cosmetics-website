"use client";

import React from 'react';
import Link from 'next/link';

const GalleryNavigation: React.FC = () => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 text-sm"
            >
              ← Voltar ao início
            </Link>
            <div className="text-gray-300 dark:text-gray-600">|</div>
            <span className="text-pink-600 dark:text-pink-400 font-medium">
              Galeria de Produtos
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <span>Powered by Strapi</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GalleryNavigation;