"use client";

import React, { useState, useEffect } from "react";
import { CartProvider, useCart } from "./cart";
import { CouponProvider, useCoupon } from "./coupon";
import { ShippingProvider, useShipping } from "./shipping";
import { CartTotalsProvider } from "./cart-totals";
import { StorageService } from "@/core/storage/storage-service";

interface FigmaProviderProps {
  children: React.ReactNode;
}

/**
 * Provider interno que conecta Cart, Coupon e Totals
 */
function CartCouponTotalsConnector({ children }: { children: React.ReactNode }) {
  const { cart, setCart } = useCart();
  const { cupons, setCupons, handleAddCupom } = useCoupon();
  const { freightValue } = useShipping();

  return (
    <CartTotalsProvider
      cart={cart}
      setCart={setCart}
      cupons={cupons}
      setCupons={setCupons}
      freightValue={freightValue}
      handleAddCupom={handleAddCupom}
    >
      {children}
    </CartTotalsProvider>
  );
}

/**
 * Provider interno que conecta Coupon ao Cart
 */
function CouponCartConnector({ children }: { children: React.ReactNode }) {
  const { cart, setCart } = useCart();

  return (
    <CouponProvider cart={cart} setCart={setCart}>
      {children}
    </CouponProvider>
  );
}

/**
 * CartProvider que passa cupons para o addProductToCart
 */
function CartProviderWithCupons({ children }: { children: React.ReactNode }) {
  const [cupons, setCupons] = useState<any[]>([]);

  useEffect(() => {
    const initialData = StorageService.initializeFromStorage();
    setCupons(initialData.cupons || []);
  }, []);

  return <CartProvider cupons={cupons}>{children}</CartProvider>;
}

/**
 * Provider para layouts Figma (figma-main, figma-checkout, figma-landing)
 *
 * NÃO inclui AuthProvider pois este já está no layout raiz.
 *
 * Hierarquia:
 * - ShippingProvider (independente)
 * - CartProvider (base)
 *   - CouponProvider (depende de Cart)
 *     - CartTotalsProvider (depende de Cart, Coupon e Shipping)
 */
export function FigmaProvider({ children }: FigmaProviderProps) {
  return (
    <ShippingProvider>
      <CartProviderWithCupons>
        <CouponCartConnector>
          <CartCouponTotalsConnector>
            {children}
          </CartCouponTotalsConnector>
        </CouponCartConnector>
      </CartProviderWithCupons>
    </ShippingProvider>
  );
}
