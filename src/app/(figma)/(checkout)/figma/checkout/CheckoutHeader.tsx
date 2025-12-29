"use client";

import Image from "next/image";
import Link from "next/link";

export function CheckoutHeader() {
  return (
    <header className="w-full flex flex-col items-start">
      {/* Top bar - verde escuro com logo e "Compra segura" */}
      <div className="bg-[#254333] w-full h-[120px] flex items-center justify-between px-4 lg:px-[32px] py-0">
        {/* Logo */}
        <Link href="/figma/design" className="relative w-[80px] h-[64px] lg:w-[130px] lg:h-[104px]">
          <Image
            src="/new-home/header/logo.png"
            alt="Lové Cosméticos"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Compra segura */}
        <div className="flex gap-[8px] items-center">
          <p className="font-cera-pro font-light text-[16px] lg:text-[20px] text-white whitespace-nowrap leading-[normal]">
            Compra segura
          </p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
          </svg>
        </div>
      </div>
    </header>
  );
}
