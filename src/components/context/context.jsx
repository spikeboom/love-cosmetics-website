"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { SnackbarProvider } from "notistack";
import { useRouter, useSearchParams } from "next/navigation";

const MeuContexto = createContext();

export const MeuContextoProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [cupons, setCupons] = useState([]);
  const [actualProductToAddToCart, setActualProductToAddToCart] =
    useState(null);

  const addProductToCart = (product) => {
    const newCart = { ...cart };
    if (newCart[product.id]) {
      newCart[product.id].quantity += 1;
    } else {
      newCart[product.id] = { ...product, quantity: 1 };
    }
    setCart(newCart);
  };

  const searchParams = useSearchParams();
  const router = useRouter();

  const [addExecuting, setAddExecuting] = useState(false);

  useEffect(() => {
    if (
      addExecuting ||
      !searchParams.has("addToCart") ||
      !actualProductToAddToCart
    ) {
      setActualProductToAddToCart(null);
      return;
    }
    setAddExecuting(true);
    const addToCart = searchParams.get("addToCart");
    if (Number(addToCart) > 0 && actualProductToAddToCart) {
      router.push(window.location.pathname);
      addProductToCart(actualProductToAddToCart);
      setSidebarMounted(true);
    }
    setAddExecuting(false);
  }, [searchParams, actualProductToAddToCart]);

  const addQuantityProductToCart = ({ product }) => {
    const newCart = { ...cart };
    if (newCart[product.id]) {
      newCart[product.id].quantity += 1;
    }
    setCart(newCart);
  };

  const subtractQuantityProductToCart = ({ product }) => {
    const newCart = { ...cart };
    if (newCart[product.id] && newCart[product.id].quantity > 1) {
      newCart[product.id].quantity -= 1;
    } else if (newCart[product.id] && newCart[product.id].quantity === 1) {
      removeProductFromCart({ product });
      return;
    }
    setCart(newCart);
  };

  const removeProductFromCart = ({ product }) => {
    const newCart = { ...cart };
    if (newCart[product.id]) {
      delete newCart[product.id];
    }
    setCart(newCart);
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("cupons");
    setCart({});
    setCupons({});
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
    if (cupons.includes(cupom)) {
      setCupons(cupons.filter((c) => c !== cupom));
    } else {
      setCupons([...cupons, cupom]);
    }
  };

  const [descontos, setDescontos] = useState(0);

  useEffect(() => {
    if (!firstRun) return;

    let total = Object.values(cart).reduce(
      (acc, product) => acc + product.preco * product.quantity,
      0,
    );
    // interation cupons para cada cupom modificar total
    const cupomResult = cupons.reduce(
      (acc, cupom) => {
        return {
          multiplicar: acc.multiplicar * cupom.multiplacar,
          diminuir: acc.diminuir + cupom.diminuir,
        };
      },
      { multiplicar: 1, diminuir: 0 },
    );
    const totalFinal = total * cupomResult.multiplicar - cupomResult.diminuir;
    const totalDescontos = total - totalFinal;
    setDescontos(totalDescontos);
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cupons", JSON.stringify(cupons));
    setTotal(totalFinal + 15); // 15 de frete
  }, [cart, cupons]);

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MeuContexto.Provider
        value={{
          cart,
          setCart,
          sidebarMounted,
          setSidebarMounted,
          addProductToCart,
          addQuantityProductToCart,
          subtractQuantityProductToCart,
          removeProductFromCart,
          total,
          qtdItemsCart,
          clearCart,
          cupons,
          handleCupom,
          descontos,
          setActualProduct: setActualProductToAddToCart,
        }}
      >
        {children}
      </MeuContexto.Provider>
    </SnackbarProvider>
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
