"use client";

import Image from "next/image";
import Link from "next/link";

export function CheckoutHeader() {
  return (
    <header className="w-full flex flex-col items-start">
      {/* Top bar - verde escuro com logo e "Compra segura" */}
      <div className="bg-[#254333] w-full h-[56px] lg:h-[120px] flex items-center justify-between px-4 lg:px-[32px] py-0">
        {/* Logo */}
        <Link href="/figma/design" className="relative w-[60px] h-[40px] lg:w-[130px] lg:h-[104px]">
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M6.95 13.55L12.6 7.9L11.175 6.475L6.95 10.7L4.85 8.6L3.425 10.025L6.95 13.55ZM8 20C5.68333 19.4167 3.77083 18.0875 2.2625 16.0125C0.754167 13.9375 0 11.6333 0 9.1V3L8 0L16 3V9.1C16 11.6333 15.2458 13.9375 13.7375 16.0125C12.2292 18.0875 10.3167 19.4167 8 20ZM8 17.9C9.73333 17.35 11.1667 16.25 12.3 14.6C13.4333 12.95 14 11.1167 14 9.1V4.375L8 2.125L2 4.375V9.1C2 11.1167 2.56667 12.95 3.7 14.6C4.83333 16.25 6.26667 17.35 8 17.9Z" fill="#E7A63A"/>
          </svg>
        </div>
      </div>
    </header>
  );
}
