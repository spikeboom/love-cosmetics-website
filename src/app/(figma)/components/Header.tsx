"use client";

import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full flex flex-col items-start">
      {/* Top bar - verde escuro com logo, busca e ações */}
      <div className="bg-[#254333] w-full h-[120px] flex items-center justify-between px-8 relative">
        {/* Logo */}
        <Link href="/" className="relative w-[130px] h-[104px]">
          <Image
            src="/new-home/header/logo.png"
            alt="Lové Cosméticos"
            fill
            className="object-cover"
            priority
          />
        </Link>

        {/* Busca central */}
        <div className="absolute left-[431px] top-[45px] w-[550px]">
          <div className="bg-white flex gap-1.5 items-center p-2 rounded-2xl">
            <div className="w-4 h-4 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="#000" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Creme|"
              className="flex-1 font-cera-pro font-light text-[12px] text-black outline-none"
            />
          </div>
        </div>

        {/* Ações - Entrar e Carrinho */}
        <div className="flex gap-8 items-center">
          {/* Entrar */}
          <Link href="/login" className="flex gap-1 items-center">
            <div className="w-8 h-8 relative">
              <Image
                src="/new-home/header/person.svg"
                alt="Entrar"
                width={32}
                height={32}
              />
            </div>
            <p className="font-cera-pro font-bold text-[20px] text-white whitespace-pre leading-none">
              Entrar
            </p>
          </Link>

          {/* Carrinho com badge */}
          <Link href="/carrinho" className="flex gap-2.5 items-center relative">
            <div className="w-8 h-8 relative">
              <Image
                src="/new-home/header/shopping-cart.svg"
                alt="Carrinho"
                width={32}
                height={32}
              />
              {/* Badge */}
              <div className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">01</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Menu de navegação - branco */}
      <nav className="bg-white w-full flex items-start justify-between px-8 py-4 border-b border-[#f8f3ed]">
        <Link href="/kits" className="flex gap-2 items-center">
          <Image src="/new-home/header/box.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-black whitespace-pre leading-none">
            Kits
          </span>
        </Link>

        <Link href="/rotina-diaria" className="flex gap-2 items-center">
          <Image src="/new-home/header/routine.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-black whitespace-pre leading-none">
            Rotina diária
          </span>
        </Link>

        <Link href="/corporal" className="flex gap-2 items-center">
          <Image src="/new-home/header/corporal.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-black whitespace-pre leading-none">
            Corporal
          </span>
        </Link>

        <Link href="/argila" className="flex gap-2 items-center">
          <Image src="/new-home/header/waves.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-black whitespace-pre leading-none">
            Argila
          </span>
        </Link>

        <Link href="/promocoes" className="flex gap-2 items-center">
          <Image src="/new-home/header/promocoes.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-black whitespace-pre leading-none">
            Promoções
          </span>
        </Link>

        <Link href="/nossa-historia" className="flex gap-2 items-center">
          <Image src="/new-home/header/historia.svg" alt="" width={24} height={24} />
          <span className="font-cera-pro font-light text-[20px] text-black whitespace-pre leading-none">
            Conheça nossa história
          </span>
        </Link>
      </nav>

      {/* Aviso - Ciência e natureza */}
      <div className="bg-[#f8f3ed] w-full border-t border-[#ba7900]">
        <div className="flex gap-2.5 items-center justify-center py-2.5 px-[123px]">
          <p className="font-cera-pro font-light text-[16px] text-[#333333] text-center whitespace-pre leading-none">
            Ciência e natureza da Amazônia
          </p>
          <Image src="/new-home/header/eco.svg" alt="" width={24} height={24} />
        </div>
      </div>
    </header>
  );
}
