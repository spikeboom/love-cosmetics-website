"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, useAuth } from "@/contexts";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { qtdItemsCart } = useCart();
  const { isLoggedIn } = useAuth();

  return (
    <header className="w-full flex flex-col items-start">
      {/* Top bar - verde escuro com logo, busca e ações */}
      <div className="bg-[#254333] w-full lg:h-[120px] h-[64px] flex items-center justify-between lg:px-[32px] px-4 py-0 relative">
        {/* Menu hamburguer - Mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden w-6 h-6 flex flex-col justify-center gap-1"
          aria-label="Menu"
        >
          <span className={`w-full h-0.5 bg-white transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`w-full h-0.5 bg-white transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-full h-0.5 bg-white transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>

        {/* Logo */}
        <Link href="/figma/design" className="relative lg:w-[130px] lg:h-[104px] w-[80px] h-[64px]">
          <Image
            src="/new-home/header/logo.png"
            alt="Lové Cosméticos"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Busca central - Desktop only */}
        <div className="hidden lg:block absolute left-[431px] top-[45px] w-[550px]">
          <div className="bg-white flex gap-[5px] items-center p-[8px] rounded-[16px]">
            <div className="w-[16px] h-[16px] shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="#000000" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Creme|"
              className="flex-1 font-cera-pro font-light text-[12px] text-[#000000] outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Ações - Carrinho (mobile) / Entrar e Carrinho (desktop) */}
        <div className="flex lg:gap-[32px] gap-4 items-center">
          {/* Entrar/Minha Conta - Desktop only */}
          <Link
            href={isLoggedIn ? "/figma/minha-conta/pedidos" : "/figma/entrar"}
            className="hidden lg:flex gap-[4px] items-center"
          >
            <div className="w-[21px] h-[21px] relative shrink-0">
              <Image
                src="/new-home/header/person-icon.svg"
                alt={isLoggedIn ? "Minha Conta" : "Entrar"}
                width={32}
                height={32}
              />
            </div>
            {!isLoggedIn && (
              <p className="font-cera-pro font-bold text-[20px] text-white whitespace-nowrap leading-[normal]">
                Entrar
              </p>
            )}
          </Link>

          {/* Carrinho com badge */}
          <div className="flex gap-[10px] items-center relative">
            <Link href="/figma/cart" className="relative lg:w-[32px] lg:h-[32px] w-[24px] h-[24px] shrink-0">
              <Image
                src="/new-home/header/shopping-cart.svg"
                alt="Carrinho"
                width={32}
                height={32}
              />
            </Link>
            {/* Badge - só aparece se tiver itens */}
            {qtdItemsCart > 0 && (
              <div className="absolute bottom-1/2 left-1/2 right-0 top-0 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/new-home/header/badge-area.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="absolute inset-0"
                  />
                  <span className="text-[8px] font-cera-pro font-bold text-white relative z-10">
                    {qtdItemsCart.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu de navegação - Desktop */}
      <nav className="hidden lg:flex bg-white w-full items-start justify-between px-[32px] py-[16px]">
        <Link href="/kits" className="flex gap-[8px] items-center">
          <Image src="/new-home/header/person.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Kits
          </span>
        </Link>

        <Link href="/rotina-diaria" className="flex gap-[8px] items-center">
          <Image src="/new-home/header/box.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Rotina diária
          </span>
        </Link>

        <Link href="/corporal" className="flex gap-[8px] items-center">
          <Image src="/new-home/header/routine.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Corporal
          </span>
        </Link>

        <Link href="/argila" className="flex gap-[8px] items-center">
          <Image src="/new-home/header/corporal.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Argila
          </span>
        </Link>

        <Link href="/promocoes" className="flex gap-[8px] items-center">
          <Image src="/new-home/header/waves.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Promoções
          </span>
        </Link>

        <Link href="/nossa-historia" className="flex gap-[8px] items-center">
          <Image src="/new-home/header/promocoes.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Conheça nossa história
          </span>
        </Link>
      </nav>

      {/* Menu Mobile - Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white w-full border-t border-gray-200">
          {/* Busca Mobile */}
          <div className="p-4 border-b border-gray-200">
            <div className="bg-gray-100 flex gap-2 items-center p-3 rounded-lg">
              <div className="w-4 h-4 shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="#000000" strokeWidth="1.5"/>
                  <path d="M11 11L14 14" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="flex-1 font-cera-pro font-light text-sm text-black outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Links Mobile */}
          <nav className="flex flex-col">
            <Link
              href={isLoggedIn ? "/figma/minha-conta/pedidos" : "/figma/entrar"}
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image src="/new-home/header/person-icon.svg" alt="" width={20} height={20} />
              <span className="font-cera-pro font-light text-base text-black">
                {isLoggedIn ? "Minha Conta" : "Entrar"}
              </span>
            </Link>

            <Link
              href="/kits"
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image src="/new-home/header/person.svg" alt="" width={20} height={20} />
              <span className="font-cera-pro font-light text-base text-black">Kits</span>
            </Link>

            <Link
              href="/rotina-diaria"
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image src="/new-home/header/box.svg" alt="" width={20} height={20} />
              <span className="font-cera-pro font-light text-base text-black">Rotina diária</span>
            </Link>

            <Link
              href="/corporal"
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image src="/new-home/header/routine.svg" alt="" width={20} height={20} />
              <span className="font-cera-pro font-light text-base text-black">Corporal</span>
            </Link>

            <Link
              href="/argila"
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image src="/new-home/header/corporal.svg" alt="" width={20} height={20} />
              <span className="font-cera-pro font-light text-base text-black">Argila</span>
            </Link>

            <Link
              href="/promocoes"
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image src="/new-home/header/waves.svg" alt="" width={20} height={20} />
              <span className="font-cera-pro font-light text-base text-black">Promoções</span>
            </Link>

            <Link
              href="/nossa-historia"
              className="flex gap-3 items-center px-4 py-3 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image src="/new-home/header/promocoes.svg" alt="" width={20} height={20} />
              <span className="font-cera-pro font-light text-base text-black">Conheça nossa história</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Aviso - Ciência e natureza */}
      <div className="bg-[#f8f3ed] w-full border-t-[1px] border-[#ba7900]">
        <div className="flex gap-2 items-center justify-center py-2 lg:py-[10px] px-4 lg:px-[123px]">
          <p className="font-cera-pro font-light text-xs lg:text-[16px] text-[#333333] text-center leading-[normal]">
            Ciência e natureza da Amazônia
          </p>
          <Image src="/new-home/header/eco.svg" alt="" width={20} height={20} className="lg:w-6 lg:h-6" />
        </div>
      </div>
    </header>
  );
}
