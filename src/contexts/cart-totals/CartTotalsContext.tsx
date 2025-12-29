"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { calculateCartTotals } from "@/utils/cart-calculations";
import { useCartValidation } from "@/deprecated/hooks/useCartValidation";
import { useNotifications } from "@/core/notifications/NotificationContext";
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
  const [firstRun, setFirstRun] = useState(false);

  const { notify } = useNotifications();
  const cartValidation = useCartValidation();

  // Marcar que já carregou após primeiro render
  useEffect(() => {
    setFirstRun(true);
  }, []);

  // Calcular totais quando cart, cupons ou frete mudam
  useEffect(() => {
    calculateCartTotals(cart, cupons, setDescontos, setTotal, firstRun, handleAddCupom, freightValue);
  }, [cart, cupons, freightValue, firstRun, handleAddCupom]);

  // Função para atualizar preços do carrinho com valores atuais do Strapi
  const refreshCartPrices = useCallback(async (): Promise<boolean> => {
    if (Object.keys(cart).length === 0) return false;

    const result = await cartValidation.validateCart(cart, cupons);
    if (!result) return false;

    let newCupons = cupons;
    let newCart = { ...cart };
    let houveAtualizacao = false;

    // Se há cupons inválidos, removê-los
    if (result.cuponsDesatualizados.length > 0) {
      newCupons = cupons.filter(
        (c: any) => !result.cuponsDesatualizados.some((cd: any) => cd.codigo === c.codigo)
      );
      houveAtualizacao = true;
      notify("Cupom removido pois não é mais válido", { variant: "warning" });
    }

    // Atualizar preços dos produtos no carrinho
    for (const produtoAtualizado of result.produtosAtualizados) {
      const cartItem = newCart[produtoAtualizado.id];
      if (cartItem) {
        const novoPreco = result.cuponsDesatualizados.length > 0
          ? produtoAtualizado.precoAtual
          : produtoAtualizado.precoComCupom;

        if (Math.abs(cartItem.preco - novoPreco) > 0.01) {
          newCart[produtoAtualizado.id] = {
            ...cartItem,
            preco: novoPreco,
            preco_de: produtoAtualizado.precoAtual,
            documentId: produtoAtualizado.documentId,
          };
          houveAtualizacao = true;
        }
      }
    }

    if (houveAtualizacao) {
      cartValidation.clearValidation();
      setCupons(newCupons);
      setCart(newCart);

      setTimeout(async () => {
        await cartValidation.validateCart(newCart, newCupons);
      }, 100);

      notify("Carrinho atualizado com os preços atuais", { variant: "success" });
    } else {
      cartValidation.clearValidation();
      await cartValidation.validateCart(cart, cupons);
    }

    return true;
  }, [cart, cupons, cartValidation, notify, setCart, setCupons]);

  const value: CartTotalsContextType = {
    total,
    descontos,
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
