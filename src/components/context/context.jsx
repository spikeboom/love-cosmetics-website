"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { SnackbarProvider } from "notistack";

const MeuContexto = createContext();

export const MeuContextoProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [sidebarMounted, setSidebarMounted] = useState(false);

  const addProductToCart = (product) => {
    setCart((prevState) => {
      const newCart = { ...prevState };
      if (newCart[product.id]) {
        // newCart[product.id].quantity += 1;
      } else {
        newCart[product.id] = { ...product, quantity: 1 };
      }
      return newCart;
    });
  };

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

  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (cart) {
      setCart(JSON.parse(cart));
    }
  }, []);

  useEffect(() => {
    const total = Object.values(cart).reduce(
      (acc, product) => acc + product.preco * product.quantity,
      0,
    );
    localStorage.setItem("cart", JSON.stringify(cart));
    setTotal(total);
  }, [cart]);

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
