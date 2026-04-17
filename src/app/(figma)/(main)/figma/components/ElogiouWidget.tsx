"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { Depoimento } from "@/lib/cms/directus/depoimentos";

interface ElogiouWidgetProps {
  depoimentos: Depoimento[];
}

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-amber-400"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} />
      ))}
    </div>
  );
}

function AvatarInitial({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-[#254333] flex items-center justify-center flex-shrink-0">
      <span className="text-white font-bold text-sm">{initial}</span>
    </div>
  );
}

export function ElogiouWidget({ depoimentos }: ElogiouWidgetProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const updateProgress = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    setScrollProgress(el.scrollLeft / maxScroll);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => el.removeEventListener("scroll", updateProgress);
  }, []);

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragScrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragStartX.current;
    el.scrollLeft = dragScrollLeft.current - dx;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  if (!depoimentos || depoimentos.length === 0) return null;

  return (
    <section className="w-full max-w-[1440px] mx-auto min-w-0 px-4 lg:px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-cera-pro font-bold text-2xl lg:text-3xl text-[#254333]">
          O que nossas clientes dizem
        </h2>
        <div className="flex items-center gap-1.5 bg-[#254333]/5 rounded-full px-3 py-1">
          <StarIcon />
          <span className="font-cera-pro text-sm font-semibold text-[#254333]">5.0</span>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
        style={{ scrollSnapType: "x mandatory", scrollBehavior: isDragging ? "auto" : "smooth" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {depoimentos.map((d) => (
          <div
            key={d.id}
            className="flex-shrink-0 w-[calc(100%-48px)] sm:w-[300px] lg:w-[320px] bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              {d.avatarUrl ? (
                <Image
                  src={d.avatarUrl}
                  alt={d.nome}
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10"
                />
              ) : (
                <AvatarInitial name={d.nome} />
              )}
              <span className="font-cera-pro font-bold text-sm text-gray-900 line-clamp-1">
                {d.nome}
              </span>
            </div>

            {/* Stars */}
            <Stars count={d.estrelas} />

            {/* Text */}
            <p className="font-cera-pro text-sm text-gray-700 leading-relaxed flex-1">
              {d.texto}
            </p>

            {/* Date */}
            <span className="font-cera-pro text-xs text-gray-400 mt-auto">
              {d.data}
            </span>
          </div>
        ))}
      </div>

      {/* Scroll indicator bar */}
      <div className="mt-4 flex justify-center">
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#254333] rounded-full transition-all duration-150"
            style={{ width: "30%", marginLeft: `${scrollProgress * 70}%` }}
          />
        </div>
      </div>
    </section>
  );
}
