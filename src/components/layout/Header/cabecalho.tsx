"use client";
import { usePathname } from "next/navigation";
import IconCart from "@/components/layout/HeaderIcons/icon-cart";
import IconHamburger from "@/components/layout/HeaderIcons/icon-hamburger";
import IconLogin from "@/components/layout/HeaderIcons/icon-login";
import IconSearch from "@/components/layout/HeaderIcons/icon-search";
import "./styles.css";
import { useMeuContexto } from "@/components/common/Context/context";
import { useUI } from "@/core/ui/UIContext";
import Image from "next/image";
import { Opacity } from "@mui/icons-material";

export function Cabecalho() {
  const { qtdItemsCart } = useMeuContexto();
  const { setSidebarMounted, setMenuMounted } = useUI();

  const handleAbrirCarrinho = () => {
    setSidebarMounted(true);
  };

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
                className="mr-[24px] flex items-center"
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

            <div className="flex flex-1 justify-end">
              {/* <span className="mx-[16px] flex items-center">
            <IconLogin />
          </span> */}
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
