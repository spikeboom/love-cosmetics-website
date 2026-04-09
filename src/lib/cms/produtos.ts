/**
 * Fachada de produtos - delega para Strapi ou Directus conforme CMS_PROVIDER
 */

import { getCmsProvider } from "./client";
import type { ProdutoStrapi } from "./types";

// Lazy imports para não carregar os dois providers ao mesmo tempo
async function getImpl() {
  if (getCmsProvider() === "directus") {
    return import("./directus/produtos");
  }
  return import("./strapi/produtos");
}

export async function fetchProdutosByIds(ids: string[]): Promise<Map<string, ProdutoStrapi>> {
  const impl = await getImpl();
  return impl.fetchProdutosByIds(ids);
}

export async function fetchProdutosByNomes(nomes: string[]): Promise<Map<string, ProdutoStrapi>> {
  const impl = await getImpl();
  return impl.fetchProdutosByNomes(nomes);
}

export async function fetchProdutosBySlugs(slugs: string[]): Promise<Map<string, ProdutoStrapi>> {
  const impl = await getImpl();
  return impl.fetchProdutosBySlugs(slugs);
}

export async function fetchProdutoComFallback(
  items: Array<{ id: string; documentId?: string; nome: string }>
): Promise<Map<string, ProdutoStrapi>> {
  const productIds = items.map((item) => item.documentId || item.id);
  let produtosReais = await fetchProdutosByIds(productIds);

  const itemsNaoEncontrados = items.filter(
    (item) => !produtosReais.has(item.documentId || item.id)
  );

  if (itemsNaoEncontrados.length > 0) {
    const produtosPorNome = await fetchProdutosByNomes(itemsNaoEncontrados.map((i) => i.nome));
    for (const item of itemsNaoEncontrados) {
      const produtoEncontrado = produtosPorNome.get(item.nome);
      if (produtoEncontrado) {
        produtosReais.set(item.documentId || item.id, produtoEncontrado);
      }
    }
  }

  return produtosReais;
}
