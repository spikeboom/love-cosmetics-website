"use client";

import { useEffect } from "react";
import { IoClose, IoCloseCircle } from "react-icons/io5";
import { LuShoppingCart, LuTruck } from "react-icons/lu";
import "./style.css";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { IoMdPricetag } from "react-icons/io";
import { MdOutlineChevronRight } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";
import Link from "next/link";
import { CircularProgress, IconButton, InputBase, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useModalCart } from "@/hooks/useModalCart";
import { CartHeader } from "./CartHeader";
import { CartProductList } from "./CartProductList";
import { EmptyCartMessage } from "./EmptyCartMessage";
import { SuggestedProductsCarousel } from "./SuggestedProductsCarousel";
import { CartSummary } from "./CartSummary";

export function ModalCart() {
  const {
    sidebarMounted,
    setSidebarMounted,
    cart,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    total,
    cupons,
    descontos,
    loadingAddItem,
    addProductToCart,
    openCart,
    setOpenCart,
    animationDuration,
    forRefreshPage,
    cupom,
    setCupom,
    loadingCupom,
    openCupom,
    setOpenCupom,
    handleAddCupomLocal,
    removeCoupon,
    suggestedProducts,
    carouselIndex,
    setCarouselIndex,
    formatPrice,
    freteValue,
  } = useModalCart();

  useEffect(() => {
    if (!openCart) {
      const timer = setTimeout(() => {
        setSidebarMounted(false);
        if (forRefreshPage) {
          // window.location.reload();
        }
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [openCart, animationDuration]);

  useEffect(() => {
    if (sidebarMounted) {
      setOpenCart(true);
    }
  }, [sidebarMounted, animationDuration]);

  return (
    <>
      {sidebarMounted && (
        <>
          <div
            className="fixed top-0 z-[998] h-full w-full bg-black opacity-50 transition-all"
            style={{ left: 0, maxWidth: "100vw" }}
            onClick={() => setOpenCart(false)}
          ></div>
          <div
            className="fixed top-0 z-[999] h-full w-[calc(100%-20px)] bg-white font-poppins transition-all md:max-w-[600px]"
            style={{
              transitionDuration: `${animationDuration}ms`,
              right: openCart ? "0" : "-100%",
            }}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex h-full flex-col">
                <CartHeader onClose={() => setOpenCart(false)} />
                <CartProductList
                  cart={cart}
                  formatPrice={formatPrice}
                  addQuantityProductToCart={addQuantityProductToCart}
                  subtractQuantityProductToCart={subtractQuantityProductToCart}
                  removeProductFromCart={removeProductFromCart}
                />
                {loadingAddItem && <div className="barra my-[8px]"></div>}
              </div>
              {Object.keys(cart).length === 0 && !loadingAddItem && (
                <EmptyCartMessage />
              )}
              {suggestedProducts.length > 0 && (
                <>
                  <div className="flex-1" />
                  <SuggestedProductsCarousel
                    suggestedProducts={suggestedProducts}
                    carouselIndex={carouselIndex}
                    setCarouselIndex={setCarouselIndex}
                    addProductToCart={addProductToCart}
                    formatPrice={formatPrice}
                  />
                </>
              )}
              <CartSummary
                freteValue={freteValue}
                openCupom={openCupom}
                setOpenCupom={setOpenCupom}
                cupom={cupom}
                setCupom={setCupom}
                handleAddCupomLocal={handleAddCupomLocal}
                loadingCupom={loadingCupom}
                cupons={cupons}
                removeCoupon={removeCoupon}
                descontos={descontos}
                total={total}
                cart={cart}
                setOpenCart={setOpenCart}
                setSidebarMounted={setSidebarMounted}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
