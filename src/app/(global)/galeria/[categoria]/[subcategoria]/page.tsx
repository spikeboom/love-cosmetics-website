import React from 'react';
import ProductGallery from '@/components/gallery/ProductGallery';
import GalleryNavigation from '@/components/gallery/GalleryNavigation';
import GalleryStats from '@/components/gallery/GalleryStats';
import { categorias } from '@/data/categorias';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    categoria: string;
    subcategoria: string;
  }>;
}

export async function generateStaticParams() {
  const paths: { categoria: string; subcategoria: string }[] = [];
  
  categorias.forEach((categoria) => {
    categoria.subcategorias.forEach((subcategoria) => {
      paths.push({
        categoria: categoria.slug,
        subcategoria: subcategoria.slug,
      });
    });
  });

  return paths;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const categoria = categorias.find(cat => cat.slug === resolvedParams.categoria);
  const subcategoria = categoria?.subcategorias.find(sub => sub.slug === resolvedParams.subcategoria);
  
  if (!categoria || !subcategoria) {
    return {
      title: 'Subcategoria não encontrada - Love Cosmetics',
    };
  }

  return {
    title: `${subcategoria.nome} - ${categoria.nome} - Love Cosmetics`,
    description: `Explore nossa coleção de ${subcategoria.nome.toLowerCase()} em ${categoria.nome.toLowerCase()}`,
  };
}

export default async function SubcategoriaPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categoria = categorias.find(cat => cat.slug === resolvedParams.categoria);
  const subcategoria = categoria?.subcategorias.find(sub => sub.slug === resolvedParams.subcategoria);
  
  if (!categoria || !subcategoria) {
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