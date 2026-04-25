/**
 * Re-exporta de lib/cms/produtos para compatibilidade com imports legados.
 * Para novo código, importe de @/lib/cms/produtos diretamente.
 */
export type { ProdutoStrapi } from "@/lib/cms/types";
export {
  fetchProdutosByIds,
  fetchProdutosByNomes,
  fetchProdutosBySlugs,
  fetchProdutoComFallback as fetchProdutosComFallback,
} from "@/lib/cms/produtos";
