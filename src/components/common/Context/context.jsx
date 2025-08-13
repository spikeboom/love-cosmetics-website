"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
import { IconButton } from "@mui/material";
import { IoCloseCircle } from "react-icons/io5";
import { 
  addProductToCart as addProductToCartUtil,
  addQuantityProductToCart as addQuantityProductToCartUtil,
  subtractQuantityProductToCart as subtractQuantityProductToCartUtil,
  removeProductFromCart as removeProductFromCartUtil,
  clearCart as clearCartUtil
} from "@/utils/cart-operations";
import { handleCupom as handleCupomUtil, handleAddCupom as handleAddCupomUtil } from "@/utils/coupon-operations";
import { calculateCartTotals } from "@/utils/cart-calculations";
import { waitForGTMReady } from "@/utils/gtm-ready-helper";

const MeuContexto = createContext();

export const MeuContextoProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [cupons, setCupons] = useState([]);
  const [loadingAddItem, setLoadingAddItem] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const addProductEvent = async (product) => {
    const gaData = await waitForGTMReady();

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "add_to_cart",
      event_id: `addtocart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ecommerce: {
        currency: "BRL",
        value: product.preco,
        items: [
          {
            item_id: product.id,
            item_name: decodeURIComponent(product.nome),
            price: product.preco,
            quantity: 1,
          },
        ],
      },
      ...gaData,
    });
  };

  const processProdutosComOuSemCupom = (data, cupom) => {
    const produtosNoCarrinho = Object.keys(cart);

    const novosProdutos = data.data.filter(
      (item) => !produtosNoCarrinho.includes(item.id.toString()),
    );

    const enviarComCupom = novosProdutos.length > 0;

    return enviarComCupom
      ? processProdutos(data, cupom)
      : processProdutos(data, "sem-cupom");
  };

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

  function processProdutosRevert(rawData) {
    rawData = Object.values(rawData.data);

    const processedToReturn = rawData?.map((p) => {
      return {
        ...p,
        ...p?.backup,
        backup: p?.backup,
      };
    });

    return { data: processedToReturn };
  }

  const handleCupom = (cupom) => {
    handleCupomUtil(cupom, cupons, setCupons, cart, setCart);
  };

  // função genérica para exibir snackbars
  const notify = (message, { variant = "default", persist = false } = {}) => {
    return enqueueSnackbar(message, {
      variant,
      persist,
      action: (key) => (
        <button
          onClick={() => closeSnackbar(key)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <IoCloseCircle size={20} />
        </button>
      ),
    });
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
