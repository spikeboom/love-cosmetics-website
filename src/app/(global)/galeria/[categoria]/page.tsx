import React from 'react';
import ProductGallery from '@/components/gallery/ProductGallery';
import GalleryNavigation from '@/components/gallery/GalleryNavigation';
import GalleryStats from '@/components/gallery/GalleryStats';
import { categorias } from '@/data/categorias';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    categoria: string;
  }>;
}

export async function generateStaticParams() {
  return categorias.map((categoria) => ({
    categoria: categoria.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const categoria = categorias.find(cat => cat.slug === resolvedParams.categoria);
  
  if (!categoria) {
    return {
      title: 'Categoria não encontrada - Love Cosmetics',
    };
  }

  return {
    title: `${categoria.nome} - Galeria de Produtos - Love Cosmetics`,
    description: `Explore nossa coleção de ${categoria.nome.toLowerCase()} organizados por subcategoria`,
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categoria = categorias.find(cat => cat.slug === resolvedParams.categoria);
  
  if (!categoria) {
    notFound();
  }

  return (
    <>
      <GalleryNavigation />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
           {/* <GalleryStats /> */}
          <ProductGallery />
        </div>
      </main>
    </>
  );
}