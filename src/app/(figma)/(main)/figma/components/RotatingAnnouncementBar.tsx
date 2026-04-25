"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface AnnouncementMessage {
  text: string;
  icon?: string;
  iconAlt?: string;
  iconWidth?: number;
  iconHeight?: number;
}

interface RotatingAnnouncementBarProps {
  messages: AnnouncementMessage[];
  intervalMs?: number;
}

export default function RotatingAnnouncementBar({
  messages,
  intervalMs = 4000,
}: RotatingAnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const advance = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
      setIsVisible(true);
    }, 200);
  }, [messages.length]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(advance, intervalMs);
    return () => clearInterval(timer);
  }, [advance, intervalMs, messages.length]);

  const message = messages[currentIndex];

  return (
    <div
      className="flex gap-2 items-center justify-center py-2 lg:py-[10px] px-4 lg:px-[123px] h-[36px] lg:h-[42px]"
      aria-live="polite"
    >
      <p
        className={`font-cera-pro font-light text-xs lg:text-[16px] text-[#333333] text-center leading-[normal] transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {message.text}
      </p>
      {message.icon && (
        <Image
          src={message.icon}
          alt={message.iconAlt ?? ""}
          width={message.iconWidth ?? 20}
          height={message.iconHeight ?? 20}
          className={`lg:w-6 lg:h-6 transition-opacity duration-200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
