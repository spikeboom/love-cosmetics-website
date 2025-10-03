import { useState } from "react";

// Hook simples para gerenciar estado de carousel
export function useCarousel(initialIndex = 0) {
  const [carouselIndex, setCarouselIndex] = useState(initialIndex);

  const nextSlide = () => setCarouselIndex(prev => prev + 1);
  const prevSlide = () => setCarouselIndex(prev => Math.max(0, prev - 1));
  const goToSlide = (index: number) => setCarouselIndex(index);

  return {
    carouselIndex,
    setCarouselIndex,
    nextSlide,
    prevSlide,
    goToSlide,
  };
}