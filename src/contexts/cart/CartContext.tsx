"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import {
  addProductToCart as addProductToCartUtil,
  addQuantityProductToCart as addQuantityProductToCartUtil,
  subtractQuantityProductToCart as subtractQuantityProductToCartUtil,
  removeProductFromCart as removeProductFromCartUtil,
  clearCart as clearCartUtil
} from "@/utils/cart-operations";
import { addProductEvent } from "@/core/tracking/product-tracking";
import { StorageService } from "@/core/storage/storage-service";
import { CartCalculations } from "@/core/utils/cart-calculations";
import type { CartProduct, CartContextType } from "./types";

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: React.ReactNode;
  cupons?: any[]; // Recebe cupons do CouponContext
}

export const CartProvider = ({ children, cupons = [] }: CartProviderProps) => {
  const [cart, setCart] = useState<Record<string, CartProduct>>({});
  const [loadingAddItem, setLoadingAddItem] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Carregar carrinho do localStorage
  useEffect(() => {
    const initialData = StorageService.initializeFromStorage();
    setCart(initialData.cart);
    setIsCartLoaded(true);
  }, []);

  const addProductToCart = useCallback((product: CartProduct) => {
    const cuponsAtuais = StorageService.loadCoupons();
    addProductToCartUtil(product, cart, setCart, setLoadingAddItem, cuponsAtuais, addProductEvent);
  }, [cart]);

  const addQuantityProductToCart = useCallback(({ product }: { product: CartProduct }) => {
    addQuantityProductToCartUtil({ product }, cart, setCart, addProductEvent);
  }, [cart]);

  const removeProductFromCart = useCallback(({ product }: { product: CartProduct }) => {
    removeProductFromCartUtil({ product }, cart, setCart);
  }, [cart]);

  const subtractQuantityProductToCart = useCallback(({ product }: { product: CartProduct }) => {
    subtractQuantityProductToCartUtil({ product }, cart, setCart, removeProductFromCart);
  }, [cart, removeProductFromCart]);

  const clearCart = useCallback(() => {
    clearCartUtil(setCart, () => {}); // setCupons será chamado pelo CouponContext
    localStorage.removeItem("cart");
  }, []);

  const qtdItemsCart = CartCalculations.getItemCount(cart);

  const value: CartContextType = {
    cart,
    setCart,
    isCartLoaded,
    loadingAddItem,
    addProductToCart,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    clearCart,
    qtdItemsCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
};

export { CartContext };
