"use client";
import Image from "next/image";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const timeTransition = 500;

const qtySlidesBefore = 2;
const qtySlidesAfter = 2;

export function CarouselImagensTop({
  imagens,
}: {
  imagens: { imagem: { formats: { medium: { url: string } } } }[];
}) {
  if (!imagens) {
    return null;
  }

  const slides = imagens.map(
    (item) =>
      `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}${item.imagem.formats.medium.url}`,
  );

  console.log({ slides });

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

  return (
    <div className="relative mx-[-16x] mt-4 h-fit w-full overflow-hidden">
      <button
        className="absolute left-[1em] top-[50%] z-10 flex h-[34px] w-[34px] -translate-y-2/4 items-center justify-center rounded-full bg-[#fafafa]"
        onClick={handlePrev}
      >
        <FaChevronLeft color="#FF69B4" size={16} />
      </button>
      <button
        className="absolute right-[1em] top-[50%] z-10 flex h-[34px] w-[34px] -translate-y-2/4 items-center justify-center rounded-full bg-[#fafafa]"
        onClick={handleNext}
      >
        <FaChevronRight color="#FF69B4" size={16} />
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
          <div
            key={`Slide Before ${index + 1}`}
            className="relative h-[342px] w-[342px]"
          >
            <Image
              src={slide}
              alt={`Slide Before ${index + 1}`}
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        ))}
        {slides.map((slide, index) => (
          <div
            key={`Slide ${index + 1}`}
            className="relative h-[342px] w-[342px]"
          >
            <Image
              src={slide}
              alt={`Slide ${index + 1}`}
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        ))}
        {slides.slice(0, qtySlidesAfter).map((slide, index) => (
          <div
            key={`Slide After ${index + 1}`}
            className="relative h-[342px] w-[342px]"
          >
            <Image
              src={slide}
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
