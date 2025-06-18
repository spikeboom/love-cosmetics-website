import { useState, useEffect, useRef } from "react";
import { fetchProdutosSugeridosCarrinho } from "@/modules/produto/domain";
import { useMeuContexto } from "@/components/context/context";
import { useSnackbar } from "notistack";
import { freteValue } from "@/utils/frete-value";
import { formatPrice } from "@/utils/format-price";
import React from "react";

// Tipos para produtos do carrinho e sugeridos
export interface CartProduct {
  id: string;
  nome: string;
  preco: number;
  quantity: number;
  slug?: string;
  preco_de?: number;
  tag_desconto_1?: string;
  tag_desconto_2?: string;
  carouselImagensPrincipal?: any;
}

export interface SuggestedProduct {
  id: number;
  nome: string;
  preco: number;
  imageUrl: string;
  carouselImagensPrincipal?: any;
}

export function useModalCart() {
  const {
    sidebarMounted,
    setSidebarMounted,
    cart,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    total,
    cupons,
    handleCupom,
    descontos,
    handleAddCupom,
    loadingAddItem,
    addProductToCart,
  } = useMeuContexto();

  const [suggestedProductsRaw, setSuggestedProductsRaw] = useState<any[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const animationDuration = 700;
  const [openCart, setOpenCart] = useState(false);
  const [forRefreshPage, setForRefreshPage] = useState(false);

  useEffect(() => {
    if (!openCart) {
      const timer = setTimeout(() => {
        setSidebarMounted(false);
        if (forRefreshPage) {
          // window.location.reload();
        }
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [openCart, animationDuration]);

  useEffect(() => {
    if (sidebarMounted) {
      setOpenCart(true);
    }
  }, [sidebarMounted, animationDuration]);

  const [cupom, setCupom] = useState("");
  const [loadingCupom, setLoadingCupom] = useState(false);
  const [openCupom, setOpenCupom] = useState(false);

  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [couponToRemove, setCouponToRemove] = useState<any>(null);

  const handleAddCupomLocal = async () => {
    if (!!cupom) {
      if (cupons.find((c: any) => c.codigo === cupom)) {
        enqueueSnackbar("Esse cupom já foi adicionado!", {
          variant: "error",
          persist: true,
          action: (key) =>
            React.createElement(
              "button",
              {
                onClick: () => closeSnackbar(key),
                "aria-label": "Fechar snackbar",
                style: {
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                },
              },
              "✕",
            ),
        });
        setOpenCupom(false);
        return;
      }
      setLoadingCupom(true);
      handleAddCupom(cupom);
      setLoadingCupom(false);
      setOpenCupom(false);
      setForRefreshPage(true);
    }
  };

  const removeCoupon = (cupom: any) => {
    if (!cupom) return;
    handleCupom(cupom);
    setForRefreshPage(true);
  };

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
      };
    });

  const [carouselIndex, setCarouselIndex] = useState(0);

  return {
    // Contexto
    sidebarMounted,
    setSidebarMounted,
    cart,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    total,
    cupons,
    handleCupom,
    descontos,
    handleAddCupom,
    loadingAddItem,
    addProductToCart,
    // Estado local
    suggestedProductsRaw,
    setSuggestedProductsRaw,
    loadingSuggested,
    setLoadingSuggested,
    openCart,
    setOpenCart,
    animationDuration,
    forRefreshPage,
    setForRefreshPage,
    cupom,
    setCupom,
    loadingCupom,
    setLoadingCupom,
    openCupom,
    setOpenCupom,
    openRemoveModal,
    setOpenRemoveModal,
    couponToRemove,
    setCouponToRemove,
    handleAddCupomLocal,
    removeCoupon,
    suggestedProducts,
    carouselIndex,
    setCarouselIndex,
    enqueueSnackbar,
    closeSnackbar,
    freteValue,
    formatPrice,
  };
}
