"use client";

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { calculateCartTotals } from "@/utils/cart-calculations";
import { useCartValidation } from "@/deprecated/hooks/useCartValidation";
import { useNotifications } from "@/core/notifications/NotificationContext";
import { useCart } from "@/contexts/cart";
import type { CartTotalsContextType } from "./types";

const CartTotalsContext = createContext<CartTotalsContextType | null>(null);

interface CartTotalsProviderProps {
  children: React.ReactNode;
  cart: Record<string, any>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  cupons: any[];
  setCupons: React.Dispatch<React.SetStateAction<any[]>>;
  freightValue: number;
  handleAddCupom: (codigo: string) => Promise<void>;
}

export const CartTotalsProvider = ({
  children,
  cart,
  setCart,
  cupons,
  setCupons,
  freightValue,
  handleAddCupom,
}: CartTotalsProviderProps) => {
  const [total, setTotal] = useState(0);
  const [descontos, setDescontos] = useState(0);
  const [subtotalOriginal, setSubtotalOriginal] = useState(0);
  const [subtotalAfterCoupons, setSubtotalAfterCoupons] = useState(0);
  const [firstRun, setFirstRun] = useState(false);
  const [isCartHydrated, setIsCartHydrated] = useState(false);

  const { notify } = useNotifications();
  const cartValidation = useCartValidation();
  const { isCartLoaded } = useCart();
  const autoRefreshTriggeredRef = useRef(false);

  // Marcar que já carregou após primeiro render
  useEffect(() => {
    setFirstRun(true);
  }, []);

  // Calcular totais quando cart, cupons ou frete mudam
  useEffect(() => {
    calculateCartTotals(cart, cupons, setDescontos, setTotal, firstRun, handleAddCupom, freightValue, setSubtotalAfterCoupons);
  }, [cart, cupons, freightValue, firstRun, handleAddCupom]);

  // Calcular subtotal original (soma dos preco_de riscados)
  useEffect(() => {
    const cartArray = Object.values(cart);
    const subtotal = cartArray.reduce((acc: number, item: any) => {
      const precoAtual = item.preco;
      const precoOriginal = item.preco_de && item.preco_de > precoAtual
        ? item.preco_de
        : precoAtual;

      return acc + (precoOriginal * (item.quantity || 1));
    }, 0);
    setSubtotalOriginal(subtotal);
  }, [cart]);

  // Função para atualizar preços e dimensões do carrinho com valores atuais do CMS
  const refreshCartPrices = useCallback(async (options?: { silent?: boolean }): Promise<boolean> => {
    if (Object.keys(cart).length === 0) return false;
    const silent = options?.silent === true;

    const result = await cartValidation.validateCart(cart, cupons);
    if (!result) return false;

    let newCupons = cupons;
    let newCart = { ...cart };
    let houveAtualizacaoPreco = false;
    let houveAtualizacaoDimensoes = false;

    // Se há cupons inválidos, removê-los
    if (result.cuponsDesatualizados.length > 0) {
      newCupons = cupons.filter(
        (c: any) => !result.cuponsDesatualizados.some((cd: any) => cd.codigo === c.codigo)
      );
      houveAtualizacaoPreco = true;
      if (!silent) notify("Cupom removido pois não é mais válido", { variant: "warning" });
    }

    // Atualizar preços e dimensões dos produtos no carrinho (sempre preço base, sem cupom)
    for (const produtoAtualizado of result.produtosAtualizados) {
      const cartItem = newCart[produtoAtualizado.id];
      if (!cartItem) continue;

      const novoPreco = produtoAtualizado.precoAtual;
      const precoMudou = Math.abs(cartItem.preco - novoPreco) > 0.01;

      // Cada campo de frete é avaliado independentemente: se o CMS define um
      // valor, atualiza; se vier undefined, preserva o que está no cart.
      const updates: Partial<typeof cartItem> = {};
      let dimsMudaram = false;
      const fields = ["peso_gramas", "altura", "largura", "comprimento"] as const;
      for (const f of fields) {
        const novo = (produtoAtualizado as any)[f];
        if (novo === undefined) continue;
        if ((cartItem as any)[f] !== novo) {
          (updates as any)[f] = novo;
          dimsMudaram = true;
        }
      }

      if (precoMudou || dimsMudaram) {
        newCart[produtoAtualizado.id] = {
          ...cartItem,
          preco: novoPreco,
          documentId: produtoAtualizado.documentId,
          ...updates,
        };
        if (precoMudou) houveAtualizacaoPreco = true;
        if (dimsMudaram) houveAtualizacaoDimensoes = true;
      }

      // Se cupom foi removido, limpar flags
      if (result.cuponsDesatualizados.length > 0) {
        newCart[produtoAtualizado.id] = {
          ...newCart[produtoAtualizado.id],
          cupom_applied: null,
          cupom_applied_codigo: null,
        };
      }
    }

    const houveAtualizacao = houveAtualizacaoPreco || houveAtualizacaoDimensoes;

    if (houveAtualizacao) {
      cartValidation.clearValidation();
      setCupons(newCupons);
      setCart(newCart);

      setTimeout(async () => {
        await cartValidation.validateCart(newCart, newCupons);
      }, 100);

      // Só notifica quando preço mudou ou cupom removido — atualização silenciosa de dimensões
      // não merece notificação (é correção interna pra cálculo de frete)
      if (!silent && houveAtualizacaoPreco) {
        notify("Carrinho atualizado com os preços atuais", { variant: "success" });
      }
    } else {
      cartValidation.clearValidation();
      await cartValidation.validateCart(cart, cupons);
    }

    return true;
  }, [cart, cupons, cartValidation, notify, setCart, setCupons]);

  // Auto-refresh do carrinho ao hidratar: sincroniza preço/dimensões com o CMS uma vez
  // por sessão. Resolve o caso "produto editado no CMS depois de já ter sido adicionado".
  useEffect(() => {
    if (!isCartLoaded) return;
    if (autoRefreshTriggeredRef.current) return;
    autoRefreshTriggeredRef.current = true;

    if (Object.keys(cart).length === 0) {
      setIsCartHydrated(true);
      return;
    }

    refreshCartPrices({ silent: true })
      .catch(() => { /* falha silenciosa: cart antigo continua válido */ })
      .finally(() => setIsCartHydrated(true));
  }, [isCartLoaded, cart, refreshCartPrices]);

  const value: CartTotalsContextType = {
    total,
    descontos,
    subtotalOriginal,
    subtotalAfterCoupons,
    isValidating: cartValidation.isValidating,
    isValid: cartValidation.isValid,
    produtosDesatualizados: cartValidation.produtosDesatualizados,
    cuponsDesatualizados: cartValidation.cuponsDesatualizados,
    produtosAtualizados: cartValidation.produtosAtualizados,
    lastValidation: cartValidation.lastValidation,
    error: cartValidation.error,
    refreshCartPrices,
    validateCart: cartValidation.validateCart,
    clearValidation: cartValidation.clearValidation,
    isCartHydrated,
  };

  return <CartTotalsContext.Provider value={value}>{children}</CartTotalsContext.Provider>;
};

export const useCartTotals = (): CartTotalsContextType => {
  const context = useContext(CartTotalsContext);
  if (!context) {
    throw new Error("useCartTotals deve ser usado dentro de um CartTotalsProvider");
  }
  return context;
};

export { CartTotalsContext };
