"use client";

import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  nome: string;
  href: string;
  imagem: string;
}

function CategoryCard({ nome, href, imagem }: CategoryCardProps) {
  return (
    <Link href={href} className="flex flex-col gap-2 items-center w-[80px] lg:w-[96px] group">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] transition-all group-hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]">
        <Image
          src={imagem}
          alt={nome}
          fill
          className="object-cover rounded-2xl"
        />
      </div>
      <p className="font-cera-pro font-light text-[12px] text-[#1d1b20] text-center leading-tight w-full overflow-hidden text-ellipsis line-clamp-2">
        {nome}
      </p>
    </Link>
  );
}

export function CategoriasSection() {
  const categorias = [
    {
      nome: "Kits",
      href: "/figma/search?q=kit",
      imagem: "/new-home/categorias/cat-kits.png"
    },
    {
      nome: "Rotina Essencial Lové",
      href: "/figma/search?q=rotina-essencial",
      imagem: "/new-home/categorias/cat-rotina.png"
    },
    {
      nome: "Todos os Produtos",
      href: "/figma/search",
      imagem: "/new-home/categorias/cat-corporal.png"
    },
    {
      nome: "Conheça nossa história",
      href: "/figma/sobre",
      imagem: "/new-home/categorias/cat-rotina.png"
    },
  ];

  return (
    <section className="bg-white w-full flex flex-col gap-4 items-center py-8 px-4">
      {/* Grid responsivo centralizado */}
      <div className="flex gap-6 lg:gap-8 items-start justify-center w-full">
        {categorias.map((categoria, index) => (
          <CategoryCard
            key={index}
            nome={categoria.nome}
            href={categoria.href}
            imagem={categoria.imagem}
          />
        ))}
      </div>
    </section>
  );
}
