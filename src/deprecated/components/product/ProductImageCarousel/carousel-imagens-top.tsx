"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { throttle } from "lodash";

const timeTransition = 500;

const qtySlidesBefore = 2;
const qtySlidesAfter = 2;

export function CarouselImagensTop({
  imagens,
  extraClassesForTopDiv = "",
}: {
  imagens: {
    imagem: {
      formats: { medium: { url: string }; thumbnail?: { url: string } };
    };
  }[];
  extraClassesForTopDiv?: string;
}) {
  if (!imagens || imagens.length === 0) {
    return null;
  }

  // Garantir que sempre tenhamos pelo menos 3 imagens
  let processedImagens = [...imagens];
  if (processedImagens.length < 3) {
    const lastImage = processedImagens[processedImagens.length - 1];
    const imagesToAdd = 3 - processedImagens.length;
    for (let i = 0; i < imagesToAdd; i++) {
      processedImagens.push(lastImage);
    }
  }

  const slides = processedImagens.map(
    (item) =>
      `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}${item?.imagem?.formats?.medium?.url || item?.imagem?.formats?.thumbnail?.url}`,
  );

  const totalSlides = slides.length + qtySlidesBefore + qtySlidesAfter;

  const percentToMove = 100 / totalSlides;

  const [translateCarousel, setTranslateCarousel] = useState(
    -(percentToMove * qtySlidesBefore),
  );
  const [indexCarousel, setIndexCarousel] = useState(qtySlidesBefore + 1);
  const [notTransitioning, setNotTransitioning] = useState(false);

  const handleNext = () => {
    setNotTransitioning(false);
    setTranslateCarousel((prev) => prev - percentToMove);
    setIndexCarousel((prev) => prev + 1);

    if (indexCarousel + 1 === totalSlides - 1) {
      setTimeout(() => {
        setTranslateCarousel(
          -(percentToMove * (qtySlidesBefore + qtySlidesAfter - 2)),
        );
        setIndexCarousel(qtySlidesBefore + qtySlidesAfter - 1);
        setNotTransitioning(true);
      }, timeTransition);
    }
  };

  const handlePrev = () => {
    setNotTransitioning(false);
    setTranslateCarousel((prev) => prev + percentToMove);
    setIndexCarousel((prev) => prev - 1);

    if (indexCarousel - 1 === 1) {
      setTimeout(() => {
        setTranslateCarousel(
          -(percentToMove * (totalSlides - qtySlidesAfter - qtySlidesBefore)),
        );
        setIndexCarousel(totalSlides - qtySlidesAfter - qtySlidesBefore + 1);
        setNotTransitioning(true);
      }, timeTransition);
    }
  };

  const carouselRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState(0);

  useEffect(() => {
    const updateSlideWidth = () => {
      if (carouselRef.current) {
        setSlideWidth(carouselRef.current.offsetWidth);
      }
    };

    // Cria uma versão "throttled" da função que só poderá ser executada a cada 200ms (por exemplo)
    const throttledUpdateSlideWidth = throttle(updateSlideWidth, 200);

    // Atualiza a largura inicialmente
    throttledUpdateSlideWidth();

    // Adiciona o listener para redimensionamento
    window.addEventListener("resize", throttledUpdateSlideWidth);

    // Remove o listener e cancela o throttle na desmontagem do componente
    return () => {
      window.removeEventListener("resize", throttledUpdateSlideWidth);
      throttledUpdateSlideWidth.cancel();
    };
  }, []);

  const slideStyle = {
    width: slideWidth * 1,
    height: slideWidth * 1,
    position: "relative" as const,
    flexShrink: 0,
  };

  return (
    <div
      ref={carouselRef}
      className={`relative mx-[-16x] mt-4 h-fit w-full overflow-hidden md:sticky md:ml-[18px] md:w-[50%] ${extraClassesForTopDiv}`}
    >
      <button
        className="absolute left-[1em] top-1/2 z-10 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full bg-[#fafafa]"
        onClick={handlePrev}
      >
        <FaChevronLeft color="#dcafad" size={16} />
      </button>
      <button
        className="absolute right-[1em] top-1/2 z-10 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full bg-[#fafafa]"
        onClick={handleNext}
      >
        <FaChevronRight color="#dcafad" size={16} />
      </button>
      <div
        className="flex w-fit"
        style={{
          transform: `translateX(${translateCarousel}%)`,
          transition: notTransitioning
            ? "none"
            : `transform ${timeTransition / 1000}s`,
        }}
      >
        {slides.slice(-qtySlidesBefore).map((slide, index) => (
          <div key={`Slide Before ${index + 1}`} style={slideStyle}>
            <Image
              src={slide}
              loader={({ src }) => src}
              alt={`Slide Before ${index + 1}`}
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        ))}
        {slides.map((slide, index) => (
          <div key={`Slide ${index + 1}`} style={slideStyle}>
            <Image
              src={slide}
              loader={({ src }) => src}
              alt={`Slide ${index + 1}`}
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        ))}
        {slides.slice(0, qtySlidesAfter).map((slide, index) => (
          <div key={`Slide After ${index + 1}`} style={slideStyle}>
            <Image
              src={slide}
              loader={({ src }) => src}
              alt={`Slide After ${index + 1}`}
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
