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

      // Verificar se o cupom já foi aplicado (usando codigo do cupom, não multiplacar)
      const cupomCodigo = dataCookie?.[0]?.codigo;
      if (p?.cupom_applied_codigo === cupomCodigo) {
        // se o cupom já foi aplicado, não faz nada
        return {
          ...dataLog,
        };
      }

      const multiplicar = dataCookie?.[0]?.multiplacar || 1;
      const diminuir = dataCookie?.[0]?.diminuir || 0;

      // Cupom deve aplicar em cima do preço atual do item (que já pode incluir desconto próprio do kit)
      const precoBaseSemCupom = dataLog?.preco || 0;
      const preco_modificado = precoBaseSemCupom * multiplicar - diminuir || 0;

      // Tag de desconto representa apenas o efeito do cupom (sem misturar com preco_de / promo do Strapi)
      const preco_desconto = precoBaseSemCupom - preco_modificado;

      return {
        ...dataLog,
        // se quiser aplicar desconto:
        // tag_desconto_1_modified
        cupom_applied: dataCookie?.[0]?.multiplacar || null,
        cupom_applied_codigo: dataCookie?.[0]?.codigo || null,
        // `preco_de` é apenas visual (preço riscado). Não deve ser sobrescrito pelo cupom.
        preco_de: dataLog?.preco_de,
        preco: preco_modificado || 0,
        tag_desconto_1: `${preco_desconto >= 0 ? "-" : "+"}R$ ${formatPrice(Math.abs(preco_desconto))}`,
        ...(dataLog?.tag_desconto_2
          ? {
              tag_desconto_2: `ECONOMIZA ${preco_desconto >= 0 ? "-" : "+"}R$ ${formatPrice(Math.abs(preco_desconto))}`,
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

      const { quantity: backupQuantity, ...backupWithoutQuantity } = dataLog?.backup || {};
      
      return {
        ...dataLog,
        ...backupWithoutQuantity,
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

export const fetchProdutosForDesign = async (): Promise<any> => {
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
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch produtos for design", response);
    throw new Error("Failed to fetch produtos for design");
  }

  return processProdutosNothing(await response.json());
};

/**
 * Busca produtos por query string ou lista de termos
 * @param q - Query string para busca (ex: "kit", "rotina-essencial")
 * @param termos - Lista de termos para busca OR (ex: ["espuma", "hidratante", "sérum"])
 */
export const fetchProdutosForSearch = async ({
  q,
  termos
}: {
  q?: string;
  termos?: string[];
}): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // Monta os filtros baseado na query de busca
  const buildFilters = () => {
    // Filtro base: produtos visíveis (não escondidos)
    const baseFilter = {
      $or: [
        { backgroundFlags: { $notContainsi: "hide" } },
        { backgroundFlags: { $null: true } },
      ],
    };

    // Se tem lista de termos, usa ela (busca OR)
    if (termos && termos.length > 0) {
      return {
        $or: termos.map(termo => ({ nome: { $containsi: termo } })),
      };
    }

    // Se não tem query, retorna todos os produtos visíveis
    if (!q || q.trim() === "") {
      return baseFilter;
    }

    // Busca especial para "Rotina Essencial Lové"
    // Produtos específicos: Kit Uso Diário + Manteiga Corporal + Máscara de Argila
    if (q.toLowerCase().includes("rotina-essencial") || q.toLowerCase().includes("rotina essencial")) {
      return {
        $or: [
          { nome: { $containsi: "kit uso diário" } },
          { nome: { $containsi: "kit uso diario" } },
          { nome: { $containsi: "manteiga corporal" } },
          { nome: { $containsi: "máscara de argila" } },
          { nome: { $containsi: "mascara de argila" } },
        ],
      };
    }

    // Busca por termo simples (apenas no nome)
    return {
      nome: { $containsi: q },
    };
  };

  const filters = buildFilters();

  const query = qs.stringify(
    {
      sort: "updatedAt:desc",
      filters,
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
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch produtos for search. Status:", response.status, "Error:", errorText);
    throw new Error("Failed to fetch produtos for search");
  }

  return processProdutosNothing(await response.json());
};
