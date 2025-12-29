"use client";

import { useCart } from "../cart";
import { useCoupon } from "../coupon";
import { useShipping } from "../shipping";
import { useAuth } from "../auth";
import { useCartTotals } from "../cart-totals";

/**
 * Adapter de compatibilidade para migração gradual.
 * Expõe a MESMA API do useMeuContexto original, usando os novos contextos segmentados.
 *
 * @deprecated Use os hooks específicos: useCart, useCoupon, useShipping, useAuth, useCartTotals
 *
 * Mapeamento:
 * - cart, setCart, addProductToCart, etc -> useCart
 * - cupons, handleCupom, handleAddCupom -> useCoupon
 * - freight -> useShipping
 * - isLoggedIn, userName, refreshAuth -> useAuth
 * - total, descontos, cartValidation, refreshCartPrices -> useCartTotals
 */
export function useMeuContextoAdapter() {
  // Contextos segmentados
  const cart = useCart();
  const coupon = useCoupon();
  const shipping = useShipping();
  const auth = useAuth();
  const totals = useCartTotals();

  // Retorna a mesma interface do useMeuContexto original
  return {
    // === Cart ===
    cart: cart.cart,
    setCart: cart.setCart,
    addProductToCart: cart.addProductToCart,
    addQuantityProductToCart: cart.addQuantityProductToCart,
    subtractQuantityProductToCart: cart.subtractQuantityProductToCart,
    removeProductFromCart: cart.removeProductFromCart,
    clearCart: () => {
      cart.clearCart();
      coupon.clearCupons();
    },
    qtdItemsCart: cart.qtdItemsCart,
    loadingAddItem: cart.loadingAddItem,
    isCartLoaded: cart.isCartLoaded,

    // === Coupon ===
    cupons: coupon.cupons,
    handleCupom: coupon.handleCupom,
    handleAddCupom: coupon.handleAddCupom,

    // === Shipping (mantém o objeto freight completo para compatibilidade) ===
    freight: {
      cep: shipping.cep,
      setCep: shipping.setCep,
      freightValue: shipping.freightValue,
      deliveryTime: shipping.deliveryTime,
      isLoading: shipping.isLoading,
      error: shipping.error,
      hasCalculated: shipping.hasCalculated,
      availableServices: shipping.availableServices,
      selectedServiceIndex: shipping.selectedServiceIndex,
      calculateFreight: shipping.calculateFreight,
      clearError: shipping.clearError,
      setSelectedFreight: shipping.setSelectedFreight,
      resetFreight: shipping.resetFreight,
      getSelectedFreightData: shipping.getSelectedFreightData,
    },

    // === Auth ===
    isLoggedIn: auth.isLoggedIn,
    userName: auth.userName,
    refreshAuth: auth.refreshAuth,

    // === Totals & Validation ===
    total: totals.total,
    descontos: totals.descontos,
    cartValidation: {
      isValidating: totals.isValidating,
      isValid: totals.isValid,
      produtosDesatualizados: totals.produtosDesatualizados,
      cuponsDesatualizados: totals.cuponsDesatualizados,
      produtosAtualizados: totals.produtosAtualizados,
      lastValidation: totals.lastValidation,
      error: totals.error,
      validateCart: totals.validateCart,
      clearValidation: totals.clearValidation,
    },
    refreshCartPrices: totals.refreshCartPrices,
  };
}
