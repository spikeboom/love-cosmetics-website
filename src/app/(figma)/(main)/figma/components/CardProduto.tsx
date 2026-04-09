"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts";
import { useNotifications } from "@/core/notifications/NotificationContext";
import { ucAddToCart } from "../../../_tracking/uc-ecommerce";

interface CardProdutoProps {
  id?: string;
  imagem: string;
  nome: string;
  descricao?: string;
  precoOriginal?: number;
  preco: number;
  desconto?: string;
  parcelas?: string;
  rating?: number;
  ultimasUnidades?: boolean;
  esgotado?: boolean;
  tipo?: "mini-banner" | "produto-completo";
  ranking?: number;
  fullWidth?: boolean;
  slug?: string;
  // Campos extras para o carrinho
  preco_de?: number;
  bling_number?: string;
  peso_gramas?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
}

export function CardProduto({
  id,
  imagem,
  nome,
  descricao,
  precoOriginal,
  preco,
  desconto,
  parcelas,
  rating = 3.5,
  ultimasUnidades = false,
  esgotado = false,
  tipo = "produto-completo",
  ranking,
  fullWidth = false,
  slug,
  preco_de,
  bling_number,
  peso_gramas,
  altura,
  largura,
  comprimento,
}: CardProdutoProps) {
  const { addProductToCart } = useCart();
  const { notify, enqueueSnackbar } = useNotifications();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (esgotado) return;

    if (!id) {
      notify("Erro ao adicionar produto", { variant: "error" });
      return;
    }

    addProductToCart({
      id,
      nome,
      preco,
      quantity: 1,
      slug,
      preco_de: preco_de || precoOriginal,
      bling_number,
      peso_gramas,
      altura,
      largura,
      comprimento,
      imagem,
    });

    ucAddToCart({
      item: {
        item_id: id,
        item_name: nome,
        price: preco,
        quantity: 1,
      },
    });

    enqueueSnackbar("", {
      variant: "addedToCart",
      productName: nome,
      productImage: imagem,
      productPrice: preco,
      autoHideDuration: 4000,
    } as any);
  };

  const cardContent = tipo === "mini-banner" ? (
    <div className="bg-white flex flex-col gap-4 items-start pb-4 pt-0 px-0 rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] w-full lg:w-[230px]">
      {/* Imagem */}
      <div className="relative w-full h-[230px] max-h-[312px] rounded-t-2xl overflow-hidden">
        <Image
          src={imagem}
          alt={nome}
          fill
          sizes="(max-width: 1024px) 77vw, 230px"
          className="object-cover rounded-t-2xl"
        />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-4 items-start px-4 w-full">
        {desconto && (
          <p className="font-cera-pro font-bold text-[20px] text-[#254333] leading-none">
            {desconto}
          </p>
        )}
        <div className="flex gap-2.5 items-center w-full">
          <p className="flex-1 font-cera-pro font-bold text-[20px] text-black leading-none min-h-0 min-w-0">
            {nome}
          </p>
        </div>
        {descricao && (
          <p className="font-cera-pro font-light text-[14px] text-black leading-none w-full">
            {descricao}
          </p>
        )}
      </div>
    </div>
  ) : (
    // Card de produto completo (para vitrines e mais vendidos)
    <div className={`bg-white box-border content-stretch flex flex-col gap-[16px] items-start pb-[16px] pt-0 px-0 relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] ${fullWidth ? "w-full" : "w-full lg:w-[230px]"}`}>
      {/* Imagem e Tag */}
      <div className="content-stretch flex gap-[10px] items-start justify-center relative shrink-0 w-full">
        <div className="w-full aspect-[4/3] relative rounded-tl-[16px] rounded-tr-[16px] overflow-hidden">
          <Image
            src={imagem}
            alt={nome}
            fill
            sizes="(max-width: 1024px) 77vw, 230px"
            className="object-cover pointer-events-none"
          />

          {/* Overlay esgotado */}
          {esgotado && (
            <div className="absolute inset-0 bg-black/40 rounded-t-[16px] z-10 flex flex-col items-center justify-center gap-[2px]">
              <p className="font-cera-pro font-bold text-white text-[18px] leading-[1.2] text-center">
                Indisponível<br />no momento
              </p>
              <p className="font-cera-pro font-medium text-white/80 text-[10px] uppercase tracking-[0.05em] text-center leading-[1.4]">
                Alta demanda — Reposição em breve
              </p>
            </div>
          )}

          {/* Badge esgotado - canto superior esquerdo */}
          {esgotado && (
            <div className="absolute top-[8px] left-[8px] z-20 bg-[#254333] text-white font-cera-pro font-bold text-[11px] uppercase tracking-wider px-[10px] py-[5px] rounded-full flex items-center gap-[5px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              ESGOTADO
            </div>
          )}
        </div>

        {/* Badge de ranking para mais vendidos */}
        {ranking && (
          <div className="absolute left-[max(8px,calc(50%-66px))] top-[-2px] w-[32px] h-[41px] flex items-center justify-center lg:translate-x-[-50%]">
            <Image
              src={`/new-home/icons/badge-ranking-${ranking}.svg`}
              alt={`Posição ${ranking}`}
              width={32}
              height={41}
              className="absolute"
            />
          </div>
        )}

        {/* Tag últimas unidades */}
        {!esgotado && ultimasUnidades ? (
          <div className="absolute content-stretch flex flex-col gap-[10px] items-center left-1/2 bottom-[8px] w-[90%] max-w-[214px] translate-x-[-50%]">
            <div className="bg-[#f8f3ed] box-border content-stretch flex gap-[4px] items-center justify-center px-[16px] py-[4px] relative rounded-[4px] shrink-0 w-full">
              <div className="relative shrink-0 size-[16px]">
                <Image
                  src="/new-home/icons/alert.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="w-full h-full"
                />
              </div>
              <p className="font-cera-pro font-light text-[14px] text-[#b3261e] leading-normal whitespace-nowrap">
                Últimas unidades
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Conteúdo */}
      <div className="box-border content-stretch flex flex-col gap-[16px] items-start px-[16px] py-0 relative shrink-0 w-full">
        <p className="font-cera-pro font-medium text-[16px] text-black leading-[1] min-w-full w-min">
          {nome}
        </p>

        {descricao && (
          <p className="font-cera-pro font-light text-[14px] text-black leading-[1.4] w-full overflow-hidden line-clamp-3">
            {descricao}
          </p>
        )}

        {/* Price Info */}
        <div className="content-stretch flex flex-col gap-[1px] items-start leading-[1] text-nowrap whitespace-pre relative shrink-0">
          {precoOriginal && (
            <p className="font-cera-pro font-light text-[12px] text-[#333333] line-through decoration-solid">
              R$ {precoOriginal.toFixed(2)}
            </p>
          )}
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
            <p className="font-cera-pro font-bold text-[20px] text-black">
              R$ {preco.toFixed(2)}
            </p>
            {desconto && (
              <p className="font-cera-pro font-light text-[14px] text-[#009142]">
                {desconto}
              </p>
            )}
          </div>
          {parcelas && (
            <p className="font-cera-pro font-light text-[12px] text-[#333333]">
              {parcelas}
            </p>
          )}
        </div>

        {/* Star Rating - abaixo do preço */}
        <div className="content-stretch flex items-center shrink-0">
          <div className="content-stretch flex gap-[2px] items-start">
            <div className="content-stretch flex h-[12px] items-center">
              {[...Array(5)].map((_, i) => {
                const filled = i < Math.floor(rating);
                const half = i < rating && i >= Math.floor(rating);

                return (
                  <div key={i} className="flex flex-col items-start shrink-0">
                    <div className="w-[24px] h-[24px] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M8 2L9.5 6.5L14 7L10.5 10L11.5 14.5L8 12L4.5 14.5L5.5 10L2 7L6.5 6.5L8 2Z"
                          fill={filled ? "#F5B100" : half ? "url(#half)" : "#E0E0E0"}
                        />
                        {half && (
                          <defs>
                            <linearGradient id="half">
                              <stop offset="50%" stopColor="#F5B100" />
                              <stop offset="50%" stopColor="#E0E0E0" />
                            </linearGradient>
                          </defs>
                        )}
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botão Comprar / Esgotado */}
        {id && (
          esgotado ? (
            <button
              disabled
              className="w-full py-[12px] px-[16px] bg-[#d4d4d4] text-[#666666] font-cera-pro font-medium text-[14px] rounded-[8px] cursor-not-allowed flex items-center justify-center gap-[8px]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              ESGOTADO
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-[12px] px-[16px] bg-[#254333] hover:bg-[#1a3025] text-white font-cera-pro font-medium text-[14px] rounded-[8px] transition-all duration-200 flex items-center justify-center gap-[8px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Comprar
            </button>
          )
        )}
      </div>
    </div>
  );

  // Se tiver slug, envolve com Link
  if (slug) {
    return (
      <Link href={`/figma/product/${slug}`} className="cursor-pointer hover:opacity-90 transition-opacity">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
