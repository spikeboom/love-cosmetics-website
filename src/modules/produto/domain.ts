"use server";

import { cookies } from "next/headers";
import { fetchCupom } from "../cupom/domain";
import { formatPrice } from "@/utils/format-price";

export async function processProdutosNothing(rawData: any) {
  "use server";

  return rawData;
}

export async function processProdutos(rawData: any, cupom?: string) {
  "use server";
  // busca o cookie
  const cookieStore = cookies();
  const meuCookie = cupom || (await cookieStore).get("cupomBackend")?.value;

  // faz fetch do cupom se existir
  const dataCookie = meuCookie
    ? (await fetchCupom({ code: meuCookie }))?.data || null
    : null;

  if (!dataCookie) {
    return rawData;
  }

  const processedToReturn =
    rawData?.data?.map((p: any) => {
      const { ...dataLog } = p || {};

      const multiplicar = dataCookie?.[0]?.multiplacar || 1;
      const preco_de = dataLog?.preco || 0;
      const preco_multiplicado = dataLog?.preco * multiplicar || 0;

      return {
        ...dataLog,
        // se quiser aplicar desconto:
        // tag_desconto_1_modified
        preco_de: preco_de || 0,
        preco: preco_multiplicado || 0,
        tag_desconto_1: `-R$ ${formatPrice(preco_de - preco_multiplicado)}`,
        ...(dataLog?.tag_desconto_2
          ? {
              tag_desconto_2: `ECONOMIZA R$ ${formatPrice(preco_de - preco_multiplicado)}`,
            }
          : {}),
        backup: dataLog?.backup || dataLog,
      };
    }) || [];

  return { ...rawData, data: processedToReturn };
}

export async function processProdutosRevert(rawData: any) {
  "use server";

  const processedToReturn =
    rawData?.data?.map((p: any) => {
      const { ...dataLog } = p || {};

      return {
        ...dataLog,
        ...dataLog?.backup,
        backup: {},
      };
    }) || [];

  return { ...rawData, data: processedToReturn };
}

export const fetchProdutoBySlug = async ({
  slug,
}: {
  slug: string;
}): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?sort=updatedAt:desc&filters[slug][$eq]=${slug}&populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    throw new Error("Failed to fetch produto by slug");
  }

  return processProdutosNothing(await response.json());
};

export const fetchProdutosForHome = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?sort=updatedAt:desc&populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    // logue o por que do erro
    console.error("Failed to fetch produtos for home", response);
    throw new Error("Failed to fetch produtos for home");
  }

  return response.json();
};

export const fetchProdutosForHome_Kit = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?sort=updatedAt:desc&populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes&filters[nome][$containsi]=Kit`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    // logue o por que do erro
    console.error("Failed to fetch produtos for home", response);
    throw new Error("Failed to fetch produtos for home");
  }

  return processProdutosNothing(await response.json());
};

export const fetchProdutosForHome_NotKit = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?sort=updatedAt:desc&populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes&filters[nome][$notContainsi]=Kit`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    // logue o por que do erro
    console.error("Failed to fetch produtos for home", response);
    throw new Error("Failed to fetch produtos for home");
  }

  return processProdutosNothing(await response.json());
};

export const fetchProdutosForCarouselPDP = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?sort=updatedAt:desc&populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    // logue o por que do erro
    console.error("Failed to fetch produtos for home", response);
    throw new Error("Failed to fetch produtos for home");
  }

  return processProdutosNothing(await response.json());
};
