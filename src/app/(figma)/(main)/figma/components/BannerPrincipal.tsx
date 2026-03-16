"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface BannerSlide {
  id: number;
  image: string;
  imageMobile?: string;
  title: string;
  discount?: string;
  description: string;
  cta: string;
  href: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: "/new-home/banner/banner-semana-do-consumidor-full.png",
    imageMobile: "/new-home/banner/banner-semana-do-consumidor-mobile.png",
    title: "Mês do Consumidor Lovè.",
    description: "Até 40% OFF em todo o site.",
    cta: "Aproveitar ofertas",
    href: "/figma/search?q=kit",
  },
  {
    id: 2,
    image: "/new-home/banner/banner-mes-da-mulher-1-full.png",
    imageMobile: "/new-home/banner/banner-mes-da-mulher-1-mobile.png",
    title: "Respeito não é presente.\nÉ princípio.",
    description: "Na Lovè, todo dia é dia da mulher.",
    cta: "Descubra a rotina Lovè",
    href: "/figma/search",
  },
  {
    id: 3,
    image: "/new-home/banner/banner-tecnologia-amazonia-full.png",
    imageMobile: "/new-home/banner/banner-tecnologia-amazonia-mobile.png",
    title: "Tecnologia & Amazônia",
    description: "Ativos amazônicos com ciência para cuidar da sua pele.",
    cta: "Ver todos os produtos",
    href: "/figma/search",
  },
];

const TRANSITION_DURATION = 500;

export function BannerPrincipal() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

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
      <div className="lg:hidden">
        <div
          className="relative w-full h-[234px] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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

        <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
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

          <div className="flex flex-col gap-4">
            {slide.discount && (
              <p className="font-cera-pro font-bold text-[20px] text-[#254333] leading-none">
                {slide.discount}
              </p>
            )}
            <p className="font-times font-bold text-[32px] text-black leading-none whitespace-pre-line">
              {slide.title}
            </p>
            <p className="font-cera-pro font-light text-[14px] text-black leading-none">
              {slide.description}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <Link
              href={slide.href}
              className="font-cera-pro font-normal text-sm bg-[#254333] text-white rounded-lg px-4 py-2.5 hover:bg-[#1a3024] transition-colors tracking-[0.1px] leading-5"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-full h-[534px]">
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

        <div className="absolute top-[97px] right-[32px] xl:right-[80px] w-[600px] max-w-[calc(100%-64px)] bg-white/75 backdrop-blur-sm p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-8">
            {slide.discount && (
              <p className="font-cera-pro font-bold text-[32px] text-[#254333] leading-none">
                {slide.discount}
              </p>
            )}
            <p className="font-times font-bold text-[56px] text-black leading-none break-words whitespace-pre-line">
              {slide.title}
            </p>
            <p className="font-cera-pro font-light text-[32px] text-black leading-none">
              {slide.description}
            </p>
          </div>

          <div className="flex gap-2 items-center w-full">
            <Link
              href={slide.href}
              className="font-cera-pro font-normal text-base bg-[#254333] text-white rounded-2xl px-6 py-4 hover:bg-[#1a3024] transition-colors tracking-[0.15px] leading-6"
            >
              {slide.cta}
            </Link>
          </div>
        </div>

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
            aria-label="Proximo slide"
          >
            <Image src="/new-home/icons/arrow-right.svg" alt="" fill className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
