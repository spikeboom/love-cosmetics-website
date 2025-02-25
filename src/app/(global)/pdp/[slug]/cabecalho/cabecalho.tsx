"use client";
import { usePathname } from "next/navigation";
import IconCart from "../header/icon-cart";
import IconHambuger from "../header/icon-hamburger";
import IconLogin from "../header/icon-login";
import IconSearch from "../header/icon-search";
import "./styles.css";

export function Cabecalho() {
  const stylesPulseLove = {
    animatedBox: {
      color: "#333",
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
            <p className="p-[8px] text-center text-[12px] lowercase">
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
                }}
              >
                <IconHambuger />
              </span>
              {/* <span className="mr-[24px] flex items-center">
            <IconSearch />
          </span> */}
            </div>

            <div>
              <a
                href="/"
                className="font-playfair text-[32px]"
                style={stylesPulseLove.animatedBox}
              >
                LOVÉ
              </a>
            </div>

            <div className="flex flex-1 justify-end">
              {/* <span className="mx-[16px] flex items-center">
            <IconLogin />
          </span> */}
              <span className="ml-[8px] flex items-center">
                <IconCart />
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
