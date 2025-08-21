"use client";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import IconCart from "@/components/layout/HeaderIcons/icon-cart";
import IconHamburger from "@/components/layout/HeaderIcons/icon-hamburger";
import IconLogin from "@/components/layout/HeaderIcons/icon-login";
import IconSearch from "@/components/layout/HeaderIcons/icon-search";
import "./styles.css";
import { useMeuContexto } from "@/components/common/Context/context";
import { useUI } from "@/core/ui/UIContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Opacity } from "@mui/icons-material";
import { FaUserCircle, FaSignOutAlt, FaUser, FaShoppingBag } from "react-icons/fa";
import Link from "next/link";

export function Cabecalho() {
  const { qtdItemsCart } = useMeuContexto();
  const { setSidebarMounted, setMenuMounted } = useUI();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAbrirCarrinho = () => {
    setSidebarMounted(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const stylesPulseLove = {
    animatedBox: {
      animation: "pulse 3s infinite",
    },
  };

  const pathname = usePathname();

  const isHome = pathname === "/home";

  return (
    <>
      <section
        className={`${isHome ? "cabecalhoLove" : ""} fixed top-0 z-[11] w-full bg-white`}
      >
        <div className="flex w-full justify-center bg-[#dcafad]">
          <div className="text-white">
            <p className="p-[8px] text-center text-[12px]">
              Entrega exclusiva para Manaus! 🚛
            </p>
          </div>
        </div>
        <div className="flex justify-center border-b border-b-[#e5e7eb] px-[16px] py-[0px]">
          <div className="flex w-full max-w-[1400px] items-center justify-between md:px-[18px]">
            <div className="flex flex-1">
              <span
                className="mr-[24px] flex cursor-pointer items-center"
                onClick={() => {
                  window?.dataLayer?.push({
                    event: "click_do_botao",
                    elemento_clicado: "meu-botao",
                    url_pagina: window.location.href,
                  });
                  setMenuMounted(true);
                }}
              >
                <IconHamburger />
              </span>
              {/* <span className="mr-[24px] flex items-center">
            <IconSearch />
          </span> */}
            </div>

            <div>
              <a href="/">
                <div className="relative mt-[2px] h-[40px] w-[140px]">
                  <Image
                    src={"/logo/logo_love_20250324_black.svg"}
                    alt={`logo love`}
                    fill
                    style={{
                      objectFit: "contain",
                      ...stylesPulseLove.animatedBox,
                    }}
                  />
                </div>
              </a>
            </div>

            <div className="flex flex-1 items-center justify-end gap-4">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
                    title={`${user?.nome} ${user?.sobrenome}`}
                  >
                    <FaUserCircle size={24} className="text-[#dcafad]" />
                    <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                      {user?.nome}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.nome} {user?.sobrenome}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          href="/minha-conta"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUser size={14} />
                          Minha Conta
                        </Link>
                        <Link
                          href="/minha-conta/pedidos"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaShoppingBag size={14} />
                          Meus Pedidos
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FaSignOutAlt size={14} />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/conta/entrar"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors"
                  title="Fazer Login"
                >
                  <IconLogin />
                  <span className="hidden md:block text-sm font-medium">Entrar</span>
                </Link>
              )}
              
              <span
                className="relative ml-[8px] flex cursor-pointer items-center"
                onClick={handleAbrirCarrinho}
              >
                <IconCart />
                {!!qtdItemsCart && (
                  <span className="absolute -right-2 -top-1 rounded-[100px] bg-[#333] px-[4px] text-[10px] font-semibold text-white">
                    {qtdItemsCart}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </section>
      <div
        className={`${isHome ? "headerBottomSpace" : ""} pt-[90px] font-lato text-[#333]`}
      ></div>
    </>
  );
}
