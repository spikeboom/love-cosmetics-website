import qs from "qs";

const getBaseURL = () => process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const getToken = () => process.env.STRAPI_API_TOKEN;

export interface ProdutoStrapi {
  id: number;
  documentId: string;
  nome: string;
  preco: number;
}

/**
 * Busca produtos por id numérico OU documentId no Strapi
 */
export async function fetchProdutosByIds(ids: string[]): Promise<Map<string, ProdutoStrapi>> {
  if (ids.length === 0) return new Map();

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
    filters.$or = [
      { id: { $in: numericIds } },
      { documentId: { $in: documentIds } },
    ];
  } else if (numericIds.length > 0) {
    filters.id = { $in: numericIds };
  } else if (documentIds.length > 0) {
    filters.documentId = { $in: documentIds };
  }

  const query = qs.stringify(
    { filters, fields: ["id", "documentId", "nome", "preco"] },
    { encodeValuesOnly: true }
  );

  const response = await fetch(`${getBaseURL()}/api/produtos?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error("Falha ao buscar produtos");
  }

  const produtosMap = new Map<string, ProdutoStrapi>();
  for (const produto of result.data || []) {
    produtosMap.set(String(produto.id), produto);
    if (produto.documentId) {
      produtosMap.set(produto.documentId, produto);
    }
  }

  return produtosMap;
}

/**
 * Busca produtos por nome exato no Strapi (fallback quando ID muda)
 */
export async function fetchProdutosByNomes(nomes: string[]): Promise<Map<string, ProdutoStrapi>> {
  if (nomes.length === 0) return new Map();

  const filters = {
    $or: nomes.map(nome => ({ nome: { $eq: nome } }))
  };

  const query = qs.stringify(
    { filters, fields: ["id", "documentId", "nome", "preco"] },
    { encodeValuesOnly: true }
  );

  const response = await fetch(`${getBaseURL()}/api/produtos?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    return new Map();
  }

  const produtosMap = new Map<string, ProdutoStrapi>();
  for (const produto of result.data || []) {
    produtosMap.set(produto.nome, produto);
  }

  return produtosMap;
}

/**
 * Busca produtos por IDs com fallback por nome
 */
export async function fetchProdutosComFallback(
  items: Array<{ id: string; documentId?: string; nome: string }>
): Promise<Map<string, ProdutoStrapi>> {
  const productIds = items.map(item => item.documentId || item.id);
  let produtosReais = await fetchProdutosByIds(productIds);

  // Fallback por nome para produtos não encontrados
  const itemsNaoEncontrados = items.filter(item =>
    !produtosReais.has(item.documentId || item.id)
  );

  if (itemsNaoEncontrados.length > 0) {
    const produtosPorNome = await fetchProdutosByNomes(
      itemsNaoEncontrados.map(i => i.nome)
    );
    for (const item of itemsNaoEncontrados) {
      const produtoEncontrado = produtosPorNome.get(item.nome);
      if (produtoEncontrado) {
        produtosReais.set(item.documentId || item.id, produtoEncontrado);
      }
    }
  }

  return produtosReais;
}
