import { useState, useEffect } from "react";
import { freteValue } from "@/utils/frete-value";
import { formatPrice } from "@/utils/format-price";
import { useCartCore } from "./useModalCart/core";
import { useSuggestedProducts } from "./useModalCart/suggested-products";
import { useModalState } from "./useModalCart/modal-state";
import { useCouponLocal } from "./useModalCart/coupon-local";
import { useSnackbar } from "notistack";

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
  const coreData = useCartCore();
  const suggestedData = useSuggestedProducts(coreData.cart);
  const modalData = useModalState();
  const couponData = useCouponLocal(coreData.cupons, coreData.handleAddCupom, coreData.handleCupom);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (modalData.sidebarMounted) {
      modalData.setOpenCart(true);
    }
  }, [modalData.sidebarMounted, modalData.animationDuration]);

  const [carouselIndex, setCarouselIndex] = useState(0);

  return {
    // Contexto
    sidebarMounted: modalData.sidebarMounted,
    setSidebarMounted: modalData.setSidebarMounted,
    cart: coreData.cart,
    addQuantityProductToCart: coreData.addQuantityProductToCart,
    subtractQuantityProductToCart: coreData.subtractQuantityProductToCart,
    removeProductFromCart: coreData.removeProductFromCart,
    total: coreData.total,
    cupons: coreData.cupons,
    handleCupom: coreData.handleCupom,
    descontos: coreData.descontos,
    handleAddCupom: coreData.handleAddCupom,
    loadingAddItem: coreData.loadingAddItem,
    addProductToCart: coreData.addProductToCart,
    // Estado local
    suggestedProductsRaw: suggestedData.suggestedProductsRaw,
    setSuggestedProductsRaw: suggestedData.setSuggestedProductsRaw,
    loadingSuggested: suggestedData.loadingSuggested,
    setLoadingSuggested: suggestedData.setLoadingSuggested,
    openCart: modalData.openCart,
    setOpenCart: modalData.setOpenCart,
    animationDuration: modalData.animationDuration,
    forRefreshPage: modalData.forRefreshPage,
    setForRefreshPage: modalData.setForRefreshPage,
    cupom: couponData.cupom,
    setCupom: couponData.setCupom,
    loadingCupom: couponData.loadingCupom,
    setLoadingCupom: couponData.setLoadingCupom,
    openCupom: couponData.openCupom,
    setOpenCupom: couponData.setOpenCupom,
    openRemoveModal: couponData.openRemoveModal,
    setOpenRemoveModal: couponData.setOpenRemoveModal,
    couponToRemove: couponData.couponToRemove,
    setCouponToRemove: couponData.setCouponToRemove,
    handleAddCupomLocal: couponData.handleAddCupomLocal,
    removeCoupon: couponData.removeCoupon,
    suggestedProducts: suggestedData.suggestedProducts,
    carouselIndex,
    setCarouselIndex,
    enqueueSnackbar,
    closeSnackbar,
    freteValue,
    formatPrice,
  };
}
