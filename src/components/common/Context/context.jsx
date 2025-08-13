"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
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

const MeuContexto = createContext();

export const MeuContextoProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [cupons, setCupons] = useState([]);
  const [loadingAddItem, setLoadingAddItem] = useState(false);

  // Usar sistema de notificações consolidado
  const { notify, closeSnackbar } = useNotifications();


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

  useEffect(() => {
    // Usar StorageService para carregar dados
    const initialData = StorageService.initializeFromStorage();
    setCart(initialData.cart);
    setCupons(initialData.cupons);
    setFirstRun(true);
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
    calculateCartTotals(cart, cupons, setDescontos, setTotal, firstRun, handleAddCupom);
  }, [cart, cupons]);

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
