"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomImageLoaded, setZoomImageLoaded] = useState(false);

  // Pré-carrega a imagem de zoom em background para evitar delay no hover
  useEffect(() => {
    const zoomUrl = zoomSrc || src;
    const img = new window.Image();
    img.onload = () => setZoomImageLoaded(true);
    img.src = zoomUrl;
  }, [zoomSrc, src]);

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
      {/* Skeleton enquanto a imagem principal carrega */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, 803px"
        quality={88}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        priority
        onLoad={() => setImageLoaded(true)}
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
            opacity: zoomImageLoaded ? 1 : 0,
            transition: "opacity 0.15s ease",
          }}
        />
      )}

      {/* Indicador de carregamento do zoom - aparece no hover enquanto zoom não carregou */}
      {isZooming && !zoomImageLoaded && (
        <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-xs font-cera-pro">Carregando zoom...</span>
          </div>
        </div>
      )}
    </div>
  );
}
