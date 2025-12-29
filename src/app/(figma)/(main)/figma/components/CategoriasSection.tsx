"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

interface CategoryCardProps {
  imagem: string;
  nome: string;
}

function CategoryCard({ imagem, nome }: CategoryCardProps) {
  return (
    <div className="flex flex-col gap-2 items-center w-full lg:w-[96px]">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]">
        <Image
          src={imagem}
          alt={nome}
          fill
          className="object-cover rounded-2xl"
        />
      </div>
      <p className="font-cera-pro font-light text-[12px] text-[#1d1b20] text-center leading-none w-full overflow-hidden text-ellipsis line-clamp-2">
        {nome}
      </p>
    </div>
  );
}

export function CategoriasSection() {
  const categorias = [
    { nome: "Kits", imagem: "/new-home/categorias/cat-kits.png" },
    { nome: "Rotina Diária", imagem: "/new-home/categorias/cat-rotina.png" },
    { nome: "Corporal", imagem: "/new-home/categorias/cat-corporal.png" },
    { nome: "Argila", imagem: "/new-home/categorias/cat-rotina.png" },
    { nome: "Promoções", imagem: "/new-home/categorias/cat-corporal.png" },
    { nome: "Kits", imagem: "/new-home/categorias/cat-kits.png" },
    { nome: "Rotina Diária", imagem: "/new-home/categorias/cat-rotina.png" },
    { nome: "Corporal", imagem: "/new-home/categorias/cat-corporal.png" },
    { nome: "Argila", imagem: "/new-home/categorias/cat-rotina.png" },
    { nome: "Promoções", imagem: "/new-home/categorias/cat-corporal.png" },
  ];

  return (
    <section className="bg-white w-full flex flex-col gap-4 items-center py-8 px-0">
      {/* Mobile: Swiper carousel */}
      <div className="lg:hidden w-full">
        <Swiper
          spaceBetween={16}
          slidesPerView="auto"
          className="!px-4 !pb-2"
        >
          {categorias.map((categoria, index) => (
            <SwiperSlide key={index} className="!w-[100px]">
              <CategoryCard
                imagem={categoria.imagem}
                nome={categoria.nome}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop: Grid centrado */}
      <div className="hidden lg:flex gap-8 items-start justify-center px-4 w-full">
        {categorias.map((categoria, index) => (
          <CategoryCard
            key={index}
            imagem={categoria.imagem}
            nome={categoria.nome}
          />
        ))}
      </div>
    </section>
  );
}
