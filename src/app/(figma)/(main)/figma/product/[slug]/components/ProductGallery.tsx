"use client";

import Image from "next/image";
import { NavigationArrows } from "../../../components/NavigationArrows";

interface ProductGalleryProps {
  imagesMain: string[];
  imagesThumbs: string[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
}

export function ProductGallery({
  imagesMain,
  imagesThumbs,
  selectedImage,
  onSelectImage,
}: ProductGalleryProps) {
  const handlePrevious = () => {
    onSelectImage(selectedImage === 0 ? imagesMain.length - 1 : selectedImage - 1);
  };

  const handleNext = () => {
    onSelectImage(selectedImage === imagesMain.length - 1 ? 0 : selectedImage + 1);
  };

  return (
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
            <Image
              src={image}
              alt={`Imagem ${index + 1}`}
              width={94}
              height={94}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Gallery */}
      <div className="relative w-full md:w-[803px] h-[424px] md:h-[704px]">
        <div className="w-full h-full bg-white overflow-hidden">
          <Image
            src={imagesMain[selectedImage]}
            alt="Produto Love Cosmeticos"
            width={803}
            height={704}
            className="w-full h-full object-cover"
            priority
          />
        </div>

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
  );
}
