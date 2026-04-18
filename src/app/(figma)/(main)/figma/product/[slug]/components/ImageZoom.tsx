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
  const [zoomImageLoaded, setZoomImageLoaded] = useState(false);

  // Pré-carrega a imagem de zoom em background apenas no desktop, após idle,
  // para evitar competir com a LCP mobile.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 767px)").matches) return;
    const zoomUrl = zoomSrc || src;
    const load = () => {
      const img = new window.Image();
      img.onload = () => setZoomImageLoaded(true);
      img.src = zoomUrl;
    };
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(load, { timeout: 2000 });
    } else {
      setTimeout(load, 1500);
    }
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
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="803px"
        quality={88}
        loading="lazy"
        className="w-full h-full object-cover"
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
