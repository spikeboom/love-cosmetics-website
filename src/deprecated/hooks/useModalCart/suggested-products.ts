import { useState, useEffect } from "react";
import { fetchProdutosSugeridosCarrinho } from "@/modules/produto/domain";

export interface SuggestedProduct {
  id: number;
  nome: string;
  preco: number;
  imageUrl: string;
  carouselImagensPrincipal?: any;
}

export function useSuggestedProducts(cart: any) {
  const [suggestedProductsRaw, setSuggestedProductsRaw] = useState<any[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  useEffect(() => {
    async function fetchSuggested() {
      setLoadingSuggested(true);
      try {
        const res = await fetchProdutosSugeridosCarrinho();
        setSuggestedProductsRaw(res.data || []);
      } catch (err) {
        setSuggestedProductsRaw([]);
      }
      setLoadingSuggested(false);
    }
    fetchSuggested();
  }, []);

  // Filtrar produtos sugeridos: remover os que já estão no carrinho e ajustar nome
  const suggestedProducts: SuggestedProduct[] = suggestedProductsRaw
    .filter((item) => {
      return !cart[item.id];
    })
    .map((item) => {
      const attrs = item;
      const imageUrl = attrs.carouselImagensPrincipal?.[0]?.imagem?.formats
        ?.thumbnail?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${attrs.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail?.url}`
        : "";
      const nomeOriginal: string = attrs.nome;
      const nomeAjustado = nomeOriginal.replace(/\{.*?\}/g, "").trim();
      return {
        id: item.id,
        nome: nomeAjustado,
        preco: attrs.preco,
        imageUrl,
        carouselImagensPrincipal: attrs.carouselImagensPrincipal,
        backgroundFlags: attrs.backgroundFlags,
        slug: attrs.slug,
      };
    });

  return {
    suggestedProductsRaw,
    setSuggestedProductsRaw,
    loadingSuggested,
    setLoadingSuggested,
    suggestedProducts
  };
}