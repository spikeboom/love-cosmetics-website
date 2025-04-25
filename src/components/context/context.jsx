"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
import { freteValue } from "@/utils/frete-value";
import { extractGaSessionData } from "@/utils/get-ga-cookie-info";
import { fetchCupom } from "@/modules/cupom/domain";
import { IconButton } from "@mui/material";
import { IoCloseCircle } from "react-icons/io5";
import Cookies from "js-cookie";
import {
  processProdutos,
  processProdutosRevert,
} from "@/modules/produto/domain";

const MeuContexto = createContext();

export const MeuContextoProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [cupons, setCupons] = useState([]);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const addProductEvent = (product) => {
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
      ...extractGaSessionData("G-SXLFK0Y830"),
    });
  };

  const addProductToCart = (product) => {
    const newCart = { ...cart };
    if (newCart[product.id]) {
      newCart[product.id].quantity += 1;
    } else {
      newCart[product.id] = { ...product, quantity: 1 };
    }
    setCart(newCart);

    addProductEvent(product);
  };

  const addQuantityProductToCart = ({ product }) => {
    const newCart = { ...cart };
    if (newCart[product.id]) {
      newCart[product.id].quantity += 1;
    }
    setCart(newCart);

    addProductEvent(product);
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
      try {
        document.cookie = "cupomBackend=; path=/; max-age=0"; // remove o cookie se existir
      } catch (e) {
        console.error("Erro ao tentar remover o cookie cupomBackend:", e);
      }

      processProdutosRevert({ data: Object.values(cart) }).then(
        (cartResult) => {
          cartResult = cartResult?.data?.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
          }, {});
          setCart(cartResult);
        },
      );
    } else {
      Cookies.set("cupomBackend", cupom?.codigo, { path: "/" });
      processProdutos({ data: Object.values(cart) }, cupom?.codigo).then(
        (cartResult) => {
          cartResult = cartResult?.data?.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
          }, {});
          setCart(cartResult);

          setCupons([...cupons, cupom]);
        },
      );
    }
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
    // aviso de busca
    const loadingKey = notify("Buscando cupom...", {
      variant: "info",
      persist: true,
    });
    try {
      const { data } = await fetchCupom({ code: codigo });
      closeSnackbar(loadingKey);

      if (!data?.[0]) {
        notify(`Cupom “${codigo}” não encontrado!`, {
          variant: "error",
          persist: true,
        });
        return;
      }

      if (cupons.some((c) => c.codigo === data[0].codigo)) {
        notify("Esse cupom já foi adicionado!", {
          variant: "success",
        });
        return;
      }

      if (cupons.length >= 1) {
        notify("Só é possível aplicar um cupom por vez!", {
          variant: "error",
          persist: true,
        });
        return;
      }

      handleCupom(data[0]);
      notify(`Cupom “${data[0].codigo}” aplicado com sucesso!`, {
        variant: "success",
      });
    } catch (err) {
      closeSnackbar(loadingKey);
      console.error(err);
      notify("Erro ao aplicar cupom.", { variant: "error" });
    }
  };

  const [descontos, setDescontos] = useState(0);

  useEffect(() => {
    if (!firstRun) return;

    // Calculate base totals
    const items = Object.values(cart);
    const baseTotal = items.reduce(
      (sum, { preco, quantity }) => sum + preco * quantity,
      0,
    );
    const baseTotalPrecoDe = items.reduce(
      (sum, { preco_de, quantity }) => sum + preco_de * quantity,
      0,
    );

    // Ensure coupons is an array
    const validCupons = Array.isArray(cupons) ? cupons : [];

    // Compute cumulative coupon effect
    const couponEffect = validCupons.reduce(
      (acc, cupom) => ({
        multiplicar: acc.multiplicar * cupom.multiplacar,
        diminuir: acc.diminuir + cupom.diminuir,
      }),
      { multiplicar: 1, diminuir: 0 },
    );

    // Final totals with coupons
    const totalWithCupons =
      baseTotal * couponEffect.multiplicar - couponEffect.diminuir;
    const totalDiscount = baseTotal - totalWithCupons;
    const totalDiscountPrecoDe = baseTotalPrecoDe - baseTotal;

    // Check for backend-specific coupon flags
    const hasCupomBackend = /(?:^|; )cupomBackend=([^;]+)/.test(
      document.cookie,
    );

    // Apply the correct discount based on backend coupon presence
    const descontoAplicado = hasCupomBackend
      ? totalDiscountPrecoDe
      : totalDiscount;
    setDescontos(descontoAplicado);

    // Persist state
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cupons", JSON.stringify(validCupons));

    // Compute and set final total including shipping
    const shippingFee = freteValue;
    const finalTotal =
      (hasCupomBackend ? baseTotal : totalWithCupons) + shippingFee;
    setTotal(finalTotal);

    // Handle one-time URL or cookie coupon
    const url = new URL(window.location.href);
    const queryCupom = url.searchParams.get("cupom");
    const cookieMatch = document.cookie.match(/(?:^|; )cupom=([^;]+)/);
    const cookieCupom = cookieMatch?.[1] && decodeURIComponent(cookieMatch[1]);

    const pendingCupom = cookieCupom || queryCupom;
    if (pendingCupom) {
      handleAddCupom(pendingCupom);
      // Clear used coupon
      document.cookie = "cupom=; path=/; max-age=0";
      url.searchParams.delete("cupom");
      window.history.replaceState({}, "", url.toString());
    }
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
