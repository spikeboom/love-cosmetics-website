"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { BannerHome } from "@/lib/cms/directus/banners";

const TRANSITION_DURATION = 500;

const CLICK_THRESHOLD = 5; // px — abaixo disso é clique, acima é drag

interface BannerPrincipalProps {
  slides: BannerHome[];
}

export function BannerPrincipal({ slides }: BannerPrincipalProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef<number>(0);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (slides.length === 0) return null;

  const getContainerWidth = () => containerRef.current?.offsetWidth || 1;

  const finishDrag = (deltaX: number) => {
    isDragging.current = false;
    const threshold = getContainerWidth() * 0.15; // 15% do container para avançar

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentSlide < slides.length - 1) {
        setIsTransitioning(true);
        setDragOffset(0);
        setCurrentSlide((prev) => prev + 1);
        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
      } else if (deltaX < 0 && currentSlide > 0) {
        setIsTransitioning(true);
        setDragOffset(0);
        setCurrentSlide((prev) => prev - 1);
        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
      } else {
        // No primeiro/último slide, snap back
        setIsTransitioning(true);
        setDragOffset(0);
        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
      }
    } else {
      // Snap back
      setIsTransitioning(true);
      setDragOffset(0);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }
  };

  const navigateToSlide = () => {
    router.push(slides[currentSlide].ctaUrl);
  };

  // Touch handlers (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.touches[0].clientX;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = startX.current - e.touches[0].clientX;
    if (Math.abs(delta) > CLICK_THRESHOLD) hasDragged.current = true;
    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    if (!hasDragged.current) {
      isDragging.current = false;
      navigateToSlide();
      return;
    }
    finishDrag(dragOffset);
  };

  // Mouse drag handlers (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTransitioning) return;
    e.preventDefault();
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = startX.current - e.clientX;
    if (Math.abs(delta) > CLICK_THRESHOLD) hasDragged.current = true;
    setDragOffset(delta);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    if (!hasDragged.current) {
      isDragging.current = false;
      navigateToSlide();
      return;
    }
    finishDrag(dragOffset);
  };

  const handleMouseLeave = () => {
    if (!isDragging.current) return;
    finishDrag(dragOffset);
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  };

  const slide = slides[currentSlide];
  // Combina posição do slide com o drag offset em tempo real
  const dragPercent = (dragOffset / getContainerWidth()) * 100;
  const slideOffset = -currentSlide * 100 - dragPercent;

  const isDrag = isDragging.current && dragOffset !== 0;

  return (
    <div className="relative w-full bg-white" ref={containerRef}>
      <div className="lg:hidden">
        <div
          className="relative w-full h-[234px] overflow-hidden cursor-pointer select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            style={{
              transform: `translateX(${slideOffset}%)`,
              transition: isDrag ? "none" : `transform ${TRANSITION_DURATION}ms ease-in-out`,
            }}
            className="relative w-full h-full flex"
          >
            {slides.map((item) => (
              <div key={item.id} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={item.imagemMobile || item.imagemDesktop}
                  alt={item.titulo}
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
            {slides.map((_, index) => (
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
            <p className="font-times font-bold text-[32px] text-black leading-none whitespace-pre-line">
              {slide.titulo}
            </p>
            {slide.descricao && (
              <p className="font-cera-pro font-light text-[14px] text-black leading-none">
                {slide.descricao}
              </p>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <Link
              href={slide.ctaUrl}
              className="font-cera-pro font-normal text-sm bg-[#254333] text-white rounded-lg px-4 py-2.5 hover:bg-[#1a3024] transition-colors tracking-[0.1px] leading-5"
            >
              {slide.ctaTexto}
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-full h-[534px]">
        <div
          className="relative w-full h-[500px] overflow-hidden cursor-pointer select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            style={{
              transform: `translateX(${slideOffset}%)`,
              transition: isDrag ? "none" : `transform ${TRANSITION_DURATION}ms ease-in-out`,
            }}
            className="relative w-full h-full flex"
          >
            {slides.map((item) => (
              <div key={item.id} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={item.imagemDesktop}
                  alt={item.titulo}
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
            <p className="font-times font-bold text-[56px] text-black leading-none break-words whitespace-pre-line">
              {slide.titulo}
            </p>
            {slide.descricao && (
              <p className="font-cera-pro font-light text-[32px] text-black leading-none">
                {slide.descricao}
              </p>
            )}
          </div>

          <div className="flex gap-2 items-center w-full">
            <Link
              href={slide.ctaUrl}
              className="font-cera-pro font-normal text-base bg-[#254333] text-white rounded-2xl px-6 py-4 hover:bg-[#1a3024] transition-colors tracking-[0.15px] leading-6"
            >
              {slide.ctaTexto}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 w-full flex flex-col gap-2.5 items-center py-4">
          <div className="flex gap-1 items-start justify-center">
            {slides.map((_, index) => (
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
