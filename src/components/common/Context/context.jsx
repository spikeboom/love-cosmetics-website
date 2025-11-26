"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
import {
  addProductToCart as addProductToCartUtil,
  addQuantityProductToCart as addQuantityProductToCartUtil,
  subtractQuantityProductToCart as subtractQuantityProductToCartUtil,
  removeProductFromCart as removeProductFromCartUtil,
  clearCart as clearCartUtil
} from "@/utils/cart-operations";
import { handleCupom as handleCupomUtil, handleAddCupom as handleAddCupomUtil } from "@/utils/coupon-operations";
import { calculateCartTotals } from "@/utils/cart-calculations";
import { addProductEvent } from "@/core/tracking/product-tracking";
import { processProdutosComOuSemCupom, processProdutosRevert } from "@/core/processing/product-processing";
import { StorageService } from "@/core/storage/storage-service";
import { CartCalculations } from "@/core/utils/cart-calculations";
import { useNotifications } from "@/core/notifications/NotificationContext";
import { useFreight } from "@/hooks/useFreight";
import { useCartValidation } from "@/hooks/useCartValidation";

const MeuContexto = createContext();

export const MeuContextoProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [cupons, setCupons] = useState([]);
  const [loadingAddItem, setLoadingAddItem] = useState(false);

  // Usar sistema de notificações consolidado
  const { notify, closeSnackbar } = useNotifications();
  
  // Hook de frete dinâmico
  const freight = useFreight();

  // Hook de validação do carrinho
  const cartValidation = useCartValidation();

  // Função para atualizar preços do carrinho com valores atuais do Strapi
  const refreshCartPrices = useCallback(async () => {
    if (Object.keys(cart).length === 0) return false;

    // Buscar dados atualizados
    const result = await cartValidation.validateCart(cart, cupons);
    if (!result) return false;

    let newCupons = cupons;
    let newCart = { ...cart };
    let houveAtualizacao = false;

    // Se há cupons inválidos, removê-los
    if (result.cuponsDesatualizados.length > 0) {
      newCupons = cupons.filter(
        c => !result.cuponsDesatualizados.some(cd => cd.codigo === c.codigo)
      );
      houveAtualizacao = true;
      notify("Cupom removido pois não é mais válido", { variant: "warning" });
    }

    // Atualizar preços dos produtos no carrinho
    for (const produtoAtualizado of result.produtosAtualizados) {
      const cartItem = newCart[produtoAtualizado.id];
      if (cartItem) {
        // Se cupom foi removido, usar preço sem cupom
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
      // Limpar validação antes de atualizar
      cartValidation.clearValidation();

      // Atualizar estado
      setCupons(newCupons);
      setCart(newCart);

      // Revalidar com novos valores após pequeno delay para setState processar
      setTimeout(async () => {
        await cartValidation.validateCart(newCart, newCupons);
      }, 100);

      notify("Carrinho atualizado com os preços atuais", { variant: "success" });
    } else {
      // Não havia nada para atualizar, apenas limpar a validação
      cartValidation.clearValidation();
      await cartValidation.validateCart(cart, cupons);
    }

    return true;
  }, [cart, cupons, cartValidation, notify]);

  const addProductToCart = (product) => {
    addProductToCartUtil(product, cart, setCart, setLoadingAddItem, cupons, addProductEvent);
  };

  const addQuantityProductToCart = ({ product }) => {
    addQuantityProductToCartUtil({ product }, cart, setCart, addProductEvent);
  };

  const subtractQuantityProductToCart = ({ product }) => {
    subtractQuantityProductToCartUtil({ product }, cart, setCart, removeProductFromCart);
  };

  const removeProductFromCart = ({ product }) => {
    removeProductFromCartUtil({ product }, cart, setCart);
  };

  const clearCart = () => {
    clearCartUtil(setCart, setCupons);
  };

  const [firstRun, setFirstRun] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  useEffect(() => {
    // Usar StorageService para carregar dados
    const initialData = StorageService.initializeFromStorage();
    setCart(initialData.cart);
    setCupons(initialData.cupons);
    setFirstRun(true);
    setIsCartLoaded(true);
  }, []);

  // Usar função extraída para cálculos
  const qtdItemsCart = CartCalculations.getItemCount(cart);


  const handleCupom = (cupom) => {
    handleCupomUtil(cupom, cupons, setCupons, cart, setCart);
  };


  const handleAddCupom = async (codigo) => {
    await handleAddCupomUtil(codigo, cupons, notify, closeSnackbar, handleCupom);
  };

  const [descontos, setDescontos] = useState(0);

  useEffect(() => {
    calculateCartTotals(cart, cupons, setDescontos, setTotal, firstRun, handleAddCupom, freight.freightValue);
  }, [cart, cupons, freight.freightValue]);

  return (
    <MeuContexto.Provider
      value={{
        cart,
        setCart,
        addProductToCart,
        addQuantityProductToCart,
        subtractQuantityProductToCart,
        removeProductFromCart,
        total,
        qtdItemsCart,
        clearCart,
        cupons,
        handleCupom,
        handleAddCupom,
        descontos,
        loadingAddItem,
        freight,
        cartValidation,
        refreshCartPrices,
        isCartLoaded,
      }}
    >
      {children}
    </MeuContexto.Provider>
  );
};

export const useMeuContexto = () => {
  const context = useContext(MeuContexto);
  if (!context) {
    throw new Error(
      "useMeuContexto deve ser usado dentro de um MeuContextoProvider",
    );
  }
  return context;
};
