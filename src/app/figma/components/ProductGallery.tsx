"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex gap-[24px] w-full">
      {/* Thumbnails - Left Column */}
      <div className="flex flex-col gap-[24px] w-[94px] flex-shrink-0">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`w-[94px] h-[94px] rounded-[8px] overflow-hidden cursor-pointer transition-all ${
              selectedImage === index ? "ring-2 ring-[#254333]" : ""
            }`}
          >
            <Image
              src={image}
              alt={`${productName} - Imagem ${index + 1}`}
              width={94}
              height={94}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image - Center & Right */}
      <div className="relative w-[803px] h-[704px] rounded-[16px] overflow-hidden bg-[#f8f3ed]">
        <Image
          src={images[selectedImage]}
          alt={productName}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-[12px]">
          <button
            onClick={() =>
              setSelectedImage((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
              )
            }
            className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                fill="#254333"
              />
            </svg>
          </button>

          <button
            onClick={() =>
              setSelectedImage((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
              )
            }
            className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                fill="#254333"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
