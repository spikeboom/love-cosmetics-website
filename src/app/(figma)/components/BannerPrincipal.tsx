"use client";

import Image from "next/image";

export function BannerPrincipal() {
  return (
    <div className="relative w-full h-[534px] bg-white">
      {/* Imagem de fundo */}
      <div className="relative w-full h-[500px] overflow-hidden">
        <Image
          src="/new-home/banner/banner-produto.png"
          alt="Banner Manteiga Corporal"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content Box - Desktop */}
      <div className="absolute top-[97px] left-[720px] w-[600px] bg-white/75 backdrop-blur-sm rounded-lg p-8 flex flex-col gap-8">
        {/* Texto */}
        <div className="flex flex-col gap-8">
          <p className="font-cera-pro font-bold text-[32px] text-[#254333] leading-none">
            40% OFF
          </p>
          <p className="font-times font-bold text-[60px] text-black leading-none whitespace-pre">
            Manteiga Corporal
          </p>
          <p className="font-cera-pro font-light text-[32px] text-black leading-none">
            Hidratação profunda, alívio das inflamações e rachaduras
          </p>
        </div>

        {/* Botão */}
        <div className="flex gap-2 items-center w-full">
          <button className="font-roboto font-medium text-base bg-[#254333] text-white rounded-2xl px-6 py-4 hover:bg-[#1a3024] transition-colors tracking-[0.15px] leading-6">
            Comprar
          </button>
        </div>
      </div>

      {/* Indicadores de carrossel */}
      <div className="absolute bottom-0 w-full flex flex-col gap-2.5 items-center py-4">
        <div className="flex gap-1 items-start justify-center">
          <Image src="/new-home/icons/carousel-active.svg" alt="" width={24} height={2} />
          <Image src="/new-home/icons/carousel-inactive.svg" alt="" width={24} height={2} />
          <Image src="/new-home/icons/carousel-inactive.svg" alt="" width={24} height={2} />
        </div>
      </div>

      {/* Botões de navegação lateral */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 w-[1440px] mx-auto px-3 flex items-center justify-between pointer-events-none">
        <button className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center pointer-events-auto hover:bg-white transition-colors">
          <Image src="/new-home/icons/arrow-left.svg" alt="Anterior" width={56} height={56} />
        </button>
        <button className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center pointer-events-auto hover:bg-white transition-colors">
          <Image src="/new-home/icons/arrow-right.svg" alt="Próximo" width={56} height={56} />
        </button>
      </div>
    </div>
  );
}
