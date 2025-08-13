"use server";

import qs from "qs";
import { fetchCupom } from "../cupom/domain";
import { formatPrice } from "@/utils/format-price";

// Common populate items used across all product queries
const COMMON_POPULATE_ITEMS = [
  "breadcrumbItems",
  "carouselImagensPrincipal.imagem",
  "listaDescricao",
  "o_que_ele_tem",
  "como_usar_essa_formula",
  "duvidas",
  "resultados.itens_resultado",
  "detalhe_notas",
  "avaliacoes",
];

export async function processProdutosNothing(rawData: any) {
  "use server";

  return rawData;
}

export async function processProdutos(rawData: any, cupom?: string) {
  "use server";
  
  if (!cupom || cupom === "sem-cupom") {
    return rawData;
  }

  // faz fetch do cupom se existir
  const dataCookie = (await fetchCupom({ code: cupom }))?.data || null;

  if (!dataCookie) {
    return rawData;
  }

  const processedToReturn =
    rawData?.data?.map((p: any) => {
      const { ...dataLog } = p || {};

      if (p?.cupom_applied === dataCookie?.[0]?.multiplacar) {
        // se o cupom já foi aplicado, não faz nada
        return {
          ...dataLog,
        };
      }

      const multiplicar = dataCookie?.[0]?.multiplacar || 1;
      const preco_de = dataLog?.preco_de || dataLog?.preco || 0;
      const preco_multiplicado = dataLog?.preco * multiplicar || 0;

      return {
        ...dataLog,
        // se quiser aplicar desconto:
        // tag_desconto_1_modified
        cupom_applied: dataCookie?.[0]?.multiplacar || null,
        preco_de: preco_de || 0,
        preco: preco_multiplicado || 0,
        tag_desconto_1: `-R$ ${formatPrice(preco_de - preco_multiplicado)}`,
        ...(dataLog?.tag_desconto_2
          ? {
              tag_desconto_2: `ECONOMIZA R$ ${formatPrice(preco_de - preco_multiplicado)}`,
            }
          : {}),
        backup: {
          ...(dataLog?.backup || dataLog),
          cupom_applied: null, // remove cupom_applied do backup
        },
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

  const query = qs.stringify(
    {
      sort: "updatedAt:desc",
      filters: {
        slug: { $eq: slug },
      },
      populate: COMMON_POPULATE_ITEMS,
    },
    { encodeValuesOnly: true },
  );

  const endpoint = `${baseURL}/api/produtos?${query}`;

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

export const fetchProdutosForHome_Kit = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const query = qs.stringify(
    {
      sort: "updatedAt:desc",
      filters: {
        nome: { $containsi: "Kit" },
        $or: [
          { backgroundFlags: { $notContainsi: "hide" } },
          { backgroundFlags: { $null: true } },
        ],
      },
      populate: COMMON_POPULATE_ITEMS,
    },
    { encodeValuesOnly: true },
  );

  const endpoint = `${baseURL}/api/produtos?${query}`;

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

  const query = qs.stringify(
    {
      sort: "updatedAt:desc",
      filters: {
        $and: [
          { nome: { $notContainsi: "Kit" } },
          {
            $or: [
              { backgroundFlags: { $notContainsi: "hide" } },
              { backgroundFlags: { $null: true } },
            ],
          },
        ],
      },
      populate: COMMON_POPULATE_ITEMS,
    },
    { encodeValuesOnly: true },
  );

  const endpoint = `${baseURL}/api/produtos?${query}`;

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

  const query = qs.stringify(
    {
      sort: "updatedAt:desc",
      filters: {
        $or: [
          { backgroundFlags: { $notContainsi: "hide" } },
          { backgroundFlags: { $null: true } },
        ],
      },
      populate: COMMON_POPULATE_ITEMS,
    },
    { encodeValuesOnly: true },
  );

  const endpoint = `${baseURL}/api/produtos?${query}`;

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

export const fetchProdutosSugeridosCarrinho = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const query = qs.stringify(
    {
      sort: "updatedAt:desc",
      filters: {
        backgroundFlags: { $containsi: "-showInCart" },
      },
      populate: COMMON_POPULATE_ITEMS,
    },
    { encodeValuesOnly: true },
  );

  const endpoint = `${baseURL}/api/produtos?${query}`;

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
    console.error("Failed to fetch produtos sugeridos", response);
    throw new Error("Failed to fetch produtos sugeridos");
  }

  return processProdutosNothing(await response.json());
};
