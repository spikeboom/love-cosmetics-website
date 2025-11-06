"use client";

import { useState } from "react";
import Image from "next/image";

interface BannerSlide {
  id: number;
  image: string;
  imageMobile?: string;
  title: string;
  discount: string;
  description: string;
  cta: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: "/new-home/banner/banner-produto.png",
    imageMobile: "/new-home/banner/banner-produto-mobile.png",
    title: "Manteiga Corporal",
    discount: "40% OFF",
    description: "Hidratação profunda, alívio das inflamações e rachaduras",
    cta: "Comprar",
  },
  {
    id: 2,
    image: "/new-home/banner/banner-produto.png",
    imageMobile: "/new-home/banner/banner-produto-mobile.png",
    title: "Manteiga Corporal",
    discount: "40% OFF",
    description: "Hidratação profunda, alívio das inflamações e rachaduras",
    cta: "Comprar",
  },
  {
    id: 3,
    image: "/new-home/banner/banner-produto.png",
    imageMobile: "/new-home/banner/banner-produto-mobile.png",
    title: "Manteiga Corporal",
    discount: "40% OFF",
    description: "Hidratação profunda, alívio das inflamações e rachaduras",
    cta: "Comprar",
  },
];

const TRANSITION_DURATION = 500;

export function BannerPrincipal() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  };

  const slide = bannerSlides[currentSlide];
  const slideOffset = -currentSlide * 100;

  return (
    <div className="relative w-full bg-white">
      {/* Layout Mobile */}
      <div className="lg:hidden">
        {/* Imagem mobile */}
        <div className="relative w-full h-[234px] overflow-hidden">
          <div
            style={{
              transform: `translateX(${slideOffset}%)`,
              transition: `transform ${TRANSITION_DURATION}ms ease-in-out`,
            }}
            className="relative w-full h-full flex"
          >
            {bannerSlides.map((item) => (
              <div key={item.id} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={item.imageMobile || item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content mobile */}
        <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
          {/* Indicadores de carrossel mobile */}
          <div className="flex gap-1">
            {bannerSlides.map((_, index) => (
              <Image
                key={index}
                src={
                  index === currentSlide
                    ? "/new-home/icons/carousel-active.svg"
                    : "/new-home/icons/carousel-inactive.svg"
                }
                alt=""
                width={24}
                height={2}
                className="transition-all duration-300"
              />
            ))}
          </div>

          {/* Texto mobile */}
          <div className="flex flex-col gap-4">
            <p className="font-cera-pro font-bold text-[20px] text-[#254333] leading-none">
              {slide.discount}
            </p>
            <p className="font-times font-bold text-[32px] text-black leading-none">
              {slide.title}
            </p>
            <p className="font-cera-pro font-light text-[14px] text-black leading-none">
              {slide.description}
            </p>
          </div>

          {/* Botão mobile */}
          <div className="flex gap-2 items-center">
            <button className="font-roboto font-medium text-sm bg-[#254333] text-white rounded-lg px-4 py-2.5 hover:bg-[#1a3024] transition-colors tracking-[0.1px] leading-5">
              {slide.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Layout Desktop */}
      <div className="hidden lg:block relative w-full h-[534px]">
        {/* Imagem de fundo com animação de slide */}
        <div className="relative w-full h-[500px] overflow-hidden">
          <div
            style={{
              transform: `translateX(${slideOffset}%)`,
              transition: `transform ${TRANSITION_DURATION}ms ease-in-out`,
            }}
            className="relative w-full h-full flex"
          >
            {bannerSlides.map((item) => (
              <div key={item.id} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content Box - Desktop */}
        <div
          className="absolute top-[97px] left-[720px] w-[600px] bg-white/75 backdrop-blur-sm p-8 flex flex-col gap-8">
          {/* Texto */}
          <div className="flex flex-col gap-8">
            <p className="font-cera-pro font-bold text-[32px] text-[#254333] leading-none">
              {slide.discount}
            </p>
            <p className="font-times font-bold text-[60px] text-black leading-none whitespace-pre">
              {slide.title}
            </p>
            <p className="font-cera-pro font-light text-[32px] text-black leading-none">
              {slide.description}
            </p>
          </div>

          {/* Botão */}
          <div className="flex gap-2 items-center w-full">
            <button className="font-roboto font-medium text-base bg-[#254333] text-white rounded-2xl px-6 py-4 hover:bg-[#1a3024] transition-colors tracking-[0.15px] leading-6">
              {slide.cta}
            </button>
          </div>
        </div>

        {/* Indicadores de carrossel desktop */}
        <div className="absolute bottom-0 w-full flex flex-col gap-2.5 items-center py-4">
          <div className="flex gap-1 items-start justify-center">
            {bannerSlides.map((_, index) => (
              <Image
                key={index}
                src={
                  index === currentSlide
                    ? "/new-home/icons/carousel-active.svg"
                    : "/new-home/icons/carousel-inactive.svg"
                }
                alt=""
                width={24}
                height={2}
                className="transition-all duration-300"
              />
            ))}
          </div>
        </div>

        {/* Botões de navegação lateral desktop */}
        <div className="absolute top-[250px] -translate-y-1/2 left-0 right-0 w-[1440px] mx-auto px-3 flex items-center justify-between pointer-events-none">
          <div
            onClick={handlePrevious}
            className="relative w-14 h-14 flex-shrink-0 pointer-events-auto cursor-pointer"
            role="button"
            aria-label="Slide anterior"
          >
            <Image src="/new-home/icons/arrow-left.svg" alt="" fill className="object-contain" />
          </div>
          <div
            onClick={handleNext}
            className="relative w-14 h-14 flex-shrink-0 pointer-events-auto cursor-pointer"
            role="button"
            aria-label="Próximo slide"
          >
            <Image src="/new-home/icons/arrow-right.svg" alt="" fill className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
