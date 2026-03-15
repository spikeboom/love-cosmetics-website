"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * Lightbox fullscreen com pinch-to-zoom restrito à imagem.
 * Swipe horizontal navega entre imagens. Tap no X ou fundo fecha.
 */
export function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Refs para gesture tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPinchDist = useRef(0);
  const lastTouchCount = useRef(0);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const isSwiping = useRef(false);
  const isPanning = useRef(false);

  // Animação de entrada
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Fechar com animação
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  }, [onClose]);

  // Reset ao trocar de imagem
  const resetTransform = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      resetTransform();
      setCurrentIndex(idx);
    },
    [resetTransform],
  );

  const goPrev = useCallback(() => {
    goTo(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, goTo]);

  const goNext = useCallback(() => {
    goTo(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, goTo]);

  // Fechar com Escape / navegar com setas
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose, goPrev, goNext]);

  // Bloquear scroll do body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ---- Touch handlers (pinch + pan + swipe) ----

  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      lastTouchCount.current = e.touches.length;

      if (e.touches.length === 2) {
        // Pinch start
        lastPinchDist.current = getDistance(e.touches[0], e.touches[1]);
        isSwiping.current = false;
        isPanning.current = false;
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (scale > 1) {
          // Pan start (imagem ampliada)
          isPanning.current = true;
          isSwiping.current = false;
          panStart.current = { x: touch.clientX, y: touch.clientY };
          translateStart.current = { ...translate };
        } else {
          // Possível swipe
          isSwiping.current = true;
          isPanning.current = false;
          swipeStartX.current = touch.clientX;
          swipeStartY.current = touch.clientY;
        }
      }
    },
    [scale, translate],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        const dist = getDistance(e.touches[0], e.touches[1]);
        if (lastPinchDist.current > 0) {
          const ratio = dist / lastPinchDist.current;
          setScale((prev) => {
            const next = prev * ratio;
            return Math.max(1, Math.min(next, 5));
          });
        }
        lastPinchDist.current = dist;
      } else if (e.touches.length === 1 && isPanning.current && scale > 1) {
        // Pan
        const touch = e.touches[0];
        const dx = touch.clientX - panStart.current.x;
        const dy = touch.clientY - panStart.current.y;
        setTranslate({
          x: translateStart.current.x + dx,
          y: translateStart.current.y + dy,
        });
      }
    },
    [scale],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const prevCount = lastTouchCount.current;
      lastTouchCount.current = e.touches.length;

      // Se soltou de pinch, resetar
      if (prevCount === 2 && e.touches.length < 2) {
        lastPinchDist.current = 0;
        // Se zoom voltou pra 1, resetar translate
        if (scale <= 1.05) {
          resetTransform();
        }
        return;
      }

      // Swipe detection (apenas quando scale === 1)
      if (isSwiping.current && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - swipeStartX.current;
        const dy = touch.clientY - swipeStartY.current;

        // Swipe horizontal significativo (> 60px e mais horizontal que vertical)
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (dx > 0) goPrev();
          else goNext();
        }
      }

      isSwiping.current = false;
      isPanning.current = false;
    },
    [scale, goPrev, goNext, resetTransform],
  );

  // Double-tap to toggle zoom
  const lastTap = useRef(0);
  const handleTap = useCallback(
    (e: React.TouchEvent) => {
      // Só funciona com 1 dedo
      if (e.touches.length > 0) return;
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // Double-tap
        if (scale > 1) {
          resetTransform();
        } else {
          setScale(2.5);
          // Centralizar no ponto do tap
          const touch = e.changedTouches[0];
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            setTranslate({
              x: (cx - touch.clientX) * 1.5,
              y: (cy - touch.clientY) * 1.5,
            });
          }
        }
      }
      lastTap.current = now;
    },
    [scale, resetTransform],
  );

  // Desktop: scroll wheel zoom (registered with { passive: false } to allow preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setScale((prev) => {
        const next = prev - e.deltaY * 0.002;
        if (next <= 1) {
          setTranslate({ x: 0, y: 0 });
          return 1;
        }
        return Math.min(next, 5);
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const animating = isVisible && !isClosing;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none transition-all duration-250 ease-out"
      style={{
        backgroundColor: animating ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all duration-250"
        style={{ opacity: animating ? 1 : 0 }}
        aria-label="Fechar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Counter */}
      <div
        className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 transition-all duration-250"
        style={{ opacity: animating ? 1 : 0 }}
      >
        <span className="font-cera-pro text-white text-sm">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Navigation arrows - desktop */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all duration-250"
            style={{ opacity: animating ? 1 : 0 }}
            aria-label="Anterior"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all duration-250"
            style={{ opacity: animating ? 1 : 0 }}
            aria-label="Próximo"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden touch-none transition-all duration-250 ease-out"
        style={{
          opacity: animating ? 1 : 0,
          transform: animating ? "scale(1)" : "scale(0.92)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => {
          handleTouchEnd(e);
          handleTap(e);
        }}
      >
        <div
          className="relative transition-transform duration-100"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <Image
            src={images[currentIndex]}
            alt={`Imagem ${currentIndex + 1}`}
            width={1200}
            height={1200}
            className="w-[100vw] md:max-w-[90vw] max-h-[85vh] md:w-auto h-auto object-contain pointer-events-none"
            draggable={false}
            priority
          />
        </div>
      </div>

      {/* Dot indicators - mobile */}
      {images.length > 1 && (
        <div
          className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 md:hidden transition-all duration-250"
          style={{ opacity: animating ? 1 : 0 }}
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all duration-200 ${
                idx === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 w-2"
              }`}
              aria-label={`Imagem ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
