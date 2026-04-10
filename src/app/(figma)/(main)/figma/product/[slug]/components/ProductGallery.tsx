"use client";

import { useState } from "react";
import Image from "next/image";
import { NavigationArrows } from "../../../components/NavigationArrows";
import { ImageZoom } from "./ImageZoom";
import { ImageLightbox } from "./ImageLightbox";

interface ProductGalleryProps {
  imagesMain: string[];
  imagesZoom?: string[];
  imagesThumbs: string[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
}

export function ProductGallery({
  imagesMain,
  imagesZoom,
  imagesThumbs,
  selectedImage,
  onSelectImage,
}: ProductGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handlePrevious = () => {
    onSelectImage(selectedImage === 0 ? imagesMain.length - 1 : selectedImage - 1);
  };

  const handleNext = () => {
    onSelectImage(selectedImage === imagesMain.length - 1 ? 0 : selectedImage + 1);
  };

  return (
    <>
      <div className="flex items-start justify-between w-full md:w-[921px]">
        {/* Thumbnails - Hidden on mobile */}
        <div className="hidden md:flex flex-col gap-[24px] items-start w-[94px]">
          {imagesThumbs.map((image, index) => (
            <button
              key={index}
              onClick={() => onSelectImage(index)}
              className={`w-[94px] h-[94px] bg-white overflow-hidden flex-shrink-0 transition-all ${
                selectedImage === index ? "" : "opacity-50 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Gallery */}
        <div className="relative w-full md:w-[803px] h-[424px] md:h-[704px]">
          {/* Desktop: hover zoom */}
          <div className="hidden md:block w-full h-full bg-white overflow-hidden">
            <ImageZoom
              src={imagesMain[selectedImage]}
              zoomSrc={imagesZoom?.[selectedImage]}
              alt="Produto Love Cosmeticos"
              width={803}
              height={704}
              className="w-full h-full"
            />
          </div>

          {/* Mobile: tap abre lightbox */}
          <button
            type="button"
            className="md:hidden w-full h-full bg-white overflow-hidden"
            onClick={() => setLightboxOpen(true)}
            aria-label="Ampliar imagem"
          >
            <Image
              src={imagesMain[selectedImage]}
              alt="Produto Love Cosmeticos"
              width={803}
              height={704}
              sizes="100vw"
              quality={85}
              className="w-full h-full object-cover"
              priority
            />
            {/* Ícone de zoom - mobile */}
            <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-5.2-5.2M10 4a6 6 0 100 12 6 6 0 000-12zM10 7v6M7 10h6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </button>

          <NavigationArrows
            onPrevious={handlePrevious}
            onNext={handleNext}
            position="center"
            containerWidth="w-full md:w-[803px]"
            arrowSize={56}
            leftIcon="/new-home/icons/arrow-left.svg"
            rightIcon="/new-home/icons/arrow-right.svg"
          />
        </div>
      </div>

      {/* Lightbox fullscreen */}
      {lightboxOpen && (
        <ImageLightbox
          images={imagesMain}
          initialIndex={selectedImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
