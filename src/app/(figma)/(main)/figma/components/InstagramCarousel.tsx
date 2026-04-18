"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import Image from "next/image";
import type { InstagramPost } from "@/lib/cms/directus/instagram";

import "swiper/css";

const DRAG_THRESHOLD_PX = 8;

function PlayIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.55)" />
      <path d="M19 15L34 24L19 33V15Z" fill="white" />
    </svg>
  );
}

type CardProps = {
  post: InstagramPost;
  registerVideo: (el: HTMLVideoElement | null) => void;
  onPlayRequest: (el: HTMLVideoElement) => void;
};

function InstagramCard({ post, registerVideo, onPlayRequest }: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasActivated, setHasActivated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    registerVideo(videoRef.current);
    return () => registerVideo(null);
  }, [hasActivated, registerVideo]);

  const togglePlayback = () => {
    if (!hasActivated) {
      setHasActivated(true);
      setIsPlaying(true);
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      onPlayRequest(v);
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;
    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) return;
    togglePlayback();
  };

  if (!post.videoUrl) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <Image
          src={post.thumbnailUrl}
          alt={post.descricao || "Post do Instagram"}
          fill
          sizes="(max-width: 1024px) 80vw, 320px"
          className="object-cover"
        />
      </div>
    );
  }

  const showOverlay = !hasActivated || !isPlaying;

  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => (pointerStartRef.current = null)}
    >
      {hasActivated ? (
        <video
          ref={videoRef}
          src={post.videoUrl}
          poster={post.thumbnailUrl}
          className="w-full h-full object-cover pointer-events-none"
          playsInline
          preload="metadata"
          autoPlay
          onPlay={(e) => {
            onPlayRequest(e.currentTarget);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      ) : (
        <Image
          src={post.thumbnailUrl}
          alt={post.descricao || "Reel do Instagram"}
          fill
          sizes="(max-width: 1024px) 80vw, 320px"
          className="object-cover pointer-events-none"
        />
      )}
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center transition-opacity pointer-events-none ${
          showOverlay ? "opacity-100" : "opacity-0"
        }`}
      >
        <PlayIcon />
      </div>
    </div>
  );
}

export function InstagramCarousel({ posts }: { posts: InstagramPost[] }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const videosRef = useRef<Set<HTMLVideoElement>>(new Set());

  const registerVideo = useCallback((el: HTMLVideoElement | null) => {
    const set = videosRef.current;
    if (el) set.add(el);
    else {
      // limpa referências soltas
      for (const v of set) if (!document.contains(v)) set.delete(v);
    }
  }, []);

  const handlePlayRequest = useCallback((current: HTMLVideoElement) => {
    for (const v of videosRef.current) {
      if (v !== current && !v.paused) v.pause();
    }
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="w-full py-8 lg:py-12 bg-white">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-4 lg:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 lg:w-7 lg:h-7 text-black"
              aria-hidden="true"
            >
              <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
            <h2 className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-black leading-normal">
              Nossa comunidade. Resultados reais na pele
            </h2>
          </div>

          <a
            href="https://www.instagram.com/cosmeticoslove_/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex font-cera-pro font-medium text-[14px] text-black underline decoration-solid [text-underline-position:from-font] hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            @cosmeticoslove_
          </a>
        </div>

        {/* Carrossel */}
        <div className="relative w-full">
          <Swiper
            onSwiper={(s) => {
              swiperRef.current = s;
              setIsBeginning(s.isBeginning);
              setIsEnd(s.isEnd);
            }}
            onSlideChange={(s) => {
              setIsBeginning(s.isBeginning);
              setIsEnd(s.isEnd);
            }}
            spaceBetween={16}
            slidesPerView="auto"
            className="!px-4 lg:!px-6 !pb-2"
          >
            {posts.map((post) => (
              <SwiperSlide
                key={post.id}
                style={{ width: "min(320px, calc((100vw - 2rem) / 1.2))" }}
                className="!h-auto"
              >
                <div className="aspect-[9/14] w-full">
                  <InstagramCard
                    post={post}
                    registerVideo={registerVideo}
                    onPlayRequest={handlePlayRequest}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Setas — apenas desktop */}
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={isBeginning}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-2 z-10 w-12 h-12 rounded-full bg-white/95 shadow-lg items-center justify-center hover:bg-white transition-all disabled:opacity-0 disabled:pointer-events-none"
          >
            <Image src="/new-home/icons/arrow-left.svg" alt="" width={48} height={48} />
          </button>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => swiperRef.current?.slideNext()}
            disabled={isEnd}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-2 z-10 w-12 h-12 rounded-full bg-white/95 shadow-lg items-center justify-center hover:bg-white transition-all disabled:opacity-0 disabled:pointer-events-none"
          >
            <Image src="/new-home/icons/arrow-right.svg" alt="" width={48} height={48} />
          </button>
        </div>

        {/* Link do perfil — mobile */}
        <div className="flex lg:hidden justify-center px-4">
          <a
            href="https://www.instagram.com/cosmeticoslove_/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-cera-pro font-medium text-[14px] text-black underline decoration-solid [text-underline-position:from-font] hover:opacity-70 transition-opacity"
          >
            @cosmeticoslove_
          </a>
        </div>
      </div>
    </section>
  );
}
