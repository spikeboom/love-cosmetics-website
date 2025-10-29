"use client";

import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full flex flex-col items-start">
      {/* Top bar - verde escuro com logo, busca e ações */}
      <div className="bg-[#254333] w-full h-[120px] flex items-center justify-between px-[32px] py-0 relative">
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

        {/* Ações - Entrar e Carrinho */}
        <div className="flex gap-[32px] items-center">
          {/* Entrar */}
          <Link href="/login" className="flex gap-[4px] items-center">
            <div className="w-[21px] h-[21px] relative shrink-0">
              <Image
                src="/new-home/header/person-icon.svg"
                alt="Entrar"
                width={32}
                height={32}
              />
            </div>
            <p className="font-cera-pro font-bold text-[20px] text-white whitespace-nowrap leading-[normal]">
              Entrar
            </p>
          </Link>

          {/* Carrinho com badge */}
          <div className="flex gap-[10px] items-center relative">
            <Link href="/carrinho" className="relative w-[32px] h-[32px] shrink-0">
              <Image
                src="/new-home/header/shopping-cart.svg"
                alt="Carrinho"
                width={32}
                height={32}
              />
            </Link>
            {/* Badge */}
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
                  01
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu de navegação - branco */}
      <nav className="bg-white w-full flex items-start justify-between px-[32px] py-[16px]">
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

      {/* Aviso - Ciência e natureza */}
      <div className="bg-[#f8f3ed] w-full border-t-[1px] border-[#ba7900]">
        <div className="flex gap-[10px] items-center justify-center py-[10px] px-[123px]">
          <p className="font-cera-pro font-light text-[16px] text-[#333333] text-center whitespace-nowrap leading-[normal]">
            Ciência e natureza da Amazônia
          </p>
          <Image src="/new-home/header/eco.svg" alt="" width={24} height={24} />
        </div>
      </div>
    </header>
  );
}
