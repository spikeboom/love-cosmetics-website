"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CartProvider, useCart } from "./cart";
import { CouponProvider, useCoupon } from "./coupon";
import { ShippingProvider, useShipping } from "./shipping";
import { AuthProvider } from "./auth";
import { CartTotalsProvider } from "./cart-totals";
import { StorageService } from "@/core/storage/storage-service";

interface ComposedProviderProps {
  children: React.ReactNode;
}

/**
 * Provider interno que conecta Cart, Coupon e Totals
 * Necessário porque CartTotals precisa de dados de Cart e Coupon
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
 * Provider composto que organiza todos os contextos na ordem correta
 *
 * Hierarquia:
 * - AuthProvider (independente)
 * - ShippingProvider (independente)
 * - CartProvider (base)
 *   - CouponProvider (depende de Cart)
 *     - CartTotalsProvider (depende de Cart, Coupon e Shipping)
 */
export function ComposedProvider({ children }: ComposedProviderProps) {
  return (
    <AuthProvider>
      <ShippingProvider>
        <CartProviderWithCupons>
          <CouponCartConnector>
            <CartCouponTotalsConnector>
              {children}
            </CartCouponTotalsConnector>
          </CouponCartConnector>
        </CartProviderWithCupons>
      </ShippingProvider>
    </AuthProvider>
  );
}

/**
 * CartProvider que passa cupons para o addProductToCart
 */
function CartProviderWithCupons({ children }: { children: React.ReactNode }) {
  const [cupons, setCupons] = useState<any[]>([]);

  // Carregar cupons iniciais
  useEffect(() => {
    const initialData = StorageService.initializeFromStorage();
    setCupons(initialData.cupons || []);
  }, []);

  return <CartProvider cupons={cupons}>{children}</CartProvider>;
}
