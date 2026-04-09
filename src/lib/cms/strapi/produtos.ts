/**
 * Implementação Strapi dos fetches de produtos
 * Mantém compatibilidade com a implementação original em src/lib/strapi/produtos.ts
 */

import qs from "qs";
import { getStrapiConfig } from "../client";
import type { ProdutoStrapi } from "../types";

export async function fetchProdutosByIds(ids: string[]): Promise<Map<string, ProdutoStrapi>> {
  if (ids.length === 0) return new Map();

  const { baseUrl, getHeaders } = getStrapiConfig();

  const numericIds: number[] = [];
  const documentIds: string[] = [];

  for (const id of ids) {
    if (!id) continue;
    const numId = parseInt(id, 10);
    if (!isNaN(numId) && String(numId) === id) {
      numericIds.push(numId);
    } else {
      documentIds.push(id);
    }
  }

  const filters: any = {};
  if (numericIds.length > 0 && documentIds.length > 0) {
    filters.$or = [{ id: { $in: numericIds } }, { documentId: { $in: documentIds } }];
  } else if (numericIds.length > 0) {
    filters.id = { $in: numericIds };
  } else if (documentIds.length > 0) {
    filters.documentId = { $in: documentIds };
  }

  const query = qs.stringify(
    { filters, fields: ["id", "documentId", "nome", "preco", "bling_number", "peso_gramas", "altura", "largura", "comprimento"] },
    { encodeValuesOnly: true }
  );

  const response = await fetch(`${baseUrl}/api/produtos?${query}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar produtos");

  const result = await response.json();
  const produtosMap = new Map<string, ProdutoStrapi>();
  for (const produto of result.data || []) {
    produtosMap.set(String(produto.id), produto);
    if (produto.documentId) produtosMap.set(produto.documentId, produto);
  }
  return produtosMap;
}

export async function fetchProdutosByNomes(nomes: string[]): Promise<Map<string, ProdutoStrapi>> {
  if (nomes.length === 0) return new Map();

  const { baseUrl, getHeaders } = getStrapiConfig();

  const query = qs.stringify(
    {
      filters: { $or: nomes.map((nome) => ({ nome: { $eq: nome } })) },
      fields: ["id", "documentId", "nome", "preco", "bling_number", "peso_gramas", "altura", "largura", "comprimento"],
    },
    { encodeValuesOnly: true }
  );

  const response = await fetch(`${baseUrl}/api/produtos?${query}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) return new Map();

  const result = await response.json();
  const produtosMap = new Map<string, ProdutoStrapi>();
  for (const produto of result.data || []) {
    produtosMap.set(produto.nome, produto);
  }
  return produtosMap;
}

export async function fetchProdutosBySlugs(slugs: string[]): Promise<Map<string, ProdutoStrapi>> {
  if (slugs.length === 0) return new Map();

  const { baseUrl, getHeaders } = getStrapiConfig();

  const query = qs.stringify(
    {
      filters: { slug: { $in: slugs } },
      fields: ["id", "documentId", "nome", "slug", "preco", "bling_number", "peso_gramas", "altura", "largura", "comprimento"],
    },
    { encodeValuesOnly: true }
  );

  const response = await fetch(`${baseUrl}/api/produtos?${query}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar produtos por slug");

  const result = await response.json();
  const produtosMap = new Map<string, ProdutoStrapi>();
  for (const produto of result.data || []) {
    if (produto.slug) produtosMap.set(produto.slug, produto);
  }
  return produtosMap;
}
