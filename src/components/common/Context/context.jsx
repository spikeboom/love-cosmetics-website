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
import { createNotify } from "@/core/notifications/notification-system";

const MeuContexto = createContext();

export const MeuContextoProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [cupons, setCupons] = useState([]);
  const [loadingAddItem, setLoadingAddItem] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  
  // notify agora é criado usando a factory function
  const notify = createNotify(enqueueSnackbar, closeSnackbar);


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
    const cart = localStorage.getItem("cart");
    if (cart) {
      setCart(JSON.parse(cart));
    }

    const cupons = localStorage.getItem("cupons");
    if (cupons) {
      setCupons(JSON.parse(cupons));
    }
    setFirstRun(true);
  }, []);

  const qtdItemsCart = Object.values(cart).reduce(
    (acc, product) => acc + product.quantity,
    0,
  );


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
        sidebarMounted,
        setSidebarMounted,
        menuMounted,
        setMenuMounted,
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
