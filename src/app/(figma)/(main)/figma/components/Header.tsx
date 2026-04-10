"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts";
import { useAuth } from "@/contexts/AuthContext";
import { Gift, Sparkles, LayoutGrid, BookOpen } from "lucide-react";
import { SearchBar } from "./SearchBar";
import RotatingAnnouncementBar from "./RotatingAnnouncementBar";
import { useLojaConfig } from "@/contexts/LojaConfigContext";

interface Produto {
  id: number;
  slug: string;
  nome: string;
  imagem: string;
}

interface HeaderProps {
  produtos?: Produto[];
}

export function Header({ produtos = [] }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { qtdItemsCart } = useCart();
  const { freteGratisValor } = useLojaConfig();
  const ANNOUNCEMENT_MESSAGES = [
    {
      text: "Ciência da Amazônia na sua pele",
      icon: "/new-home/header/eco.svg",
    },
    {
      text: `🚚 Frete grátis acima de R$ ${Math.floor(freteGratisValor)}`,
    },
  ];
  const { isLoggedIn } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside as EventListener);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as EventListener);
    };
  }, [isMenuOpen]);

  return (
    <header className="w-full flex flex-col items-start">
      {/* Top bar - verde escuro com logo, busca e ações */}
      <div className="bg-[#254333] w-full lg:h-[120px] h-[64px] flex items-center justify-between lg:px-[32px] px-4 py-0 relative">
        {/* Logo */}
        <Link href="/figma/design" className="relative lg:w-[120px] lg:h-[67px] w-[60px] h-[34px] shrink-0">
          <Image
            src="/new-home/header/logo.png"
            alt="Lové Cosméticos"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Busca - Mobile (inline) e Desktop (centralizada) */}
        <div className="lg:hidden flex-1 mx-3">
          <SearchBar produtos={produtos} mobile />
        </div>
        <div className="hidden lg:block absolute left-[431px] top-[45px]">
          <SearchBar produtos={produtos} />
        </div>

        {/* Ações - Menu/Carrinho (mobile) / Entrar e Carrinho (desktop) */}
        <div className="flex lg:gap-[32px] gap-3 items-center shrink-0">
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

          {/* Menu hamburguer - Mobile */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-6 h-6 flex flex-col justify-center gap-1"
            aria-label="Menu"
          >
            <span className={`w-full h-0.5 bg-white transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-full h-0.5 bg-white transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-full h-0.5 bg-white transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Menu de navegação - Desktop */}
      <nav className="hidden lg:flex bg-white w-full items-center justify-center gap-16 px-[32px] py-[16px]">
        <Link href="/figma/search?q=kit" className="flex gap-[8px] items-center hover:opacity-70 transition-opacity">
          <Gift size={24} strokeWidth={1.5} className="text-[#7c5c3e]" />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Kits
          </span>
        </Link>

        <Link href="/figma/search?q=rotina-essencial" className="flex gap-[8px] items-center hover:opacity-70 transition-opacity">
          <Sparkles size={24} strokeWidth={1.5} className="text-[#7c5c3e]" />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Rotina Essencial Lové
          </span>
        </Link>

        <Link href="/figma/search" className="flex gap-[8px] items-center hover:opacity-70 transition-opacity">
          <LayoutGrid size={24} strokeWidth={1.5} className="text-[#7c5c3e]" />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Todos os Produtos
          </span>
        </Link>

        <Link href="/figma/sobre" className="flex gap-[8px] items-center hover:opacity-70 transition-opacity">
          <BookOpen size={24} strokeWidth={1.5} className="text-[#7c5c3e]" />
          <span className="font-cera-pro font-light text-[20px] text-[#000000] whitespace-nowrap leading-[normal]">
            Conheça nossa história
          </span>
        </Link>
      </nav>

      {/* Menu Mobile - Dropdown */}
      {isMenuOpen && (
        <div ref={menuRef} className="lg:hidden bg-white w-full border-t border-gray-200">
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
              href="/figma/search?q=kit"
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Gift size={20} strokeWidth={1.5} className="text-[#7c5c3e]" />
              <span className="font-cera-pro font-light text-base text-black">Kits</span>
            </Link>

            <Link
              href="/figma/search?q=rotina-essencial"
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Sparkles size={20} strokeWidth={1.5} className="text-[#7c5c3e]" />
              <span className="font-cera-pro font-light text-base text-black">Rotina Essencial Lové</span>
            </Link>

            <Link
              href="/figma/search"
              className="flex gap-3 items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <LayoutGrid size={20} strokeWidth={1.5} className="text-[#7c5c3e]" />
              <span className="font-cera-pro font-light text-base text-black">Todos os Produtos</span>
            </Link>

            <Link
              href="/figma/sobre"
              className="flex gap-3 items-center px-4 py-3 active:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen size={20} strokeWidth={1.5} className="text-[#7c5c3e]" />
              <span className="font-cera-pro font-light text-base text-black">Conheça nossa história</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Aviso rotativo */}
      <div className="bg-[#f8f3ed] w-full border-t-[1px] border-[#ba7900]">
        <RotatingAnnouncementBar messages={ANNOUNCEMENT_MESSAGES} />
      </div>
    </header>
  );
}
