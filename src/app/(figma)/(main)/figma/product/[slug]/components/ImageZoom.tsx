"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

interface ImageZoomProps {
  src: string;
  zoomSrc?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  zoomScale?: number;
}

/**
 * Desktop hover-zoom: mostra versão ampliada seguindo o cursor.
 * Renderiza a imagem normal + overlay com background-image ampliado.
 */
export function ImageZoom({
  src,
  zoomSrc,
  alt,
  width,
  height,
  className = "",
  zoomScale = 2.5,
}: ImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [bgPos, setBgPos] = useState("0% 0%");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setBgPos(`${x}% ${y}%`);
    },
    [],
  );

  const handleMouseEnter = useCallback(() => setIsZooming(true), []);
  const handleMouseLeave = useCallback(() => setIsZooming(false), []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, 803px"
        quality={88}
        className="w-full h-full object-cover"
        priority
      />

      {/* Overlay de zoom - desktop only */}
      {isZooming && (
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage: `url(${zoomSrc || src})`,
            backgroundSize: `${zoomScale * 100}%`,
            backgroundPosition: bgPos,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
}
