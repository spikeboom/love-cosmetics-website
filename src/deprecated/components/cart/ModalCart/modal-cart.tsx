"use client";

import { useEffect } from "react";
import "./style.css";
import { useModalCart } from "@/deprecated/hooks/useModalCart";
import { CartHeader } from "./CartHeader";
import { CartProductList } from "./CartProductList";
import { EmptyCartMessage } from "./EmptyCartMessage";
import { SuggestedProductsCarousel } from "./SuggestedProductsCarousel";
import { CartSummary } from "./CartSummary";
import { CheckoutActions } from "./CheckoutActions";

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
    freight,
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
            data-testid="cart-modal"
          >
            <div className="flex h-full flex-col">
              <CartHeader onClose={() => setOpenCart(false)} />

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <CartProductList
                  cart={cart}
                  formatPrice={formatPrice}
                  addQuantityProductToCart={addQuantityProductToCart}
                  subtractQuantityProductToCart={subtractQuantityProductToCart}
                  removeProductFromCart={removeProductFromCart}
                />
                {loadingAddItem && <div className="barra my-[8px]"></div>}

                {Object.keys(cart).length === 0 && !loadingAddItem && (
                  <EmptyCartMessage />
                )}

                {suggestedProducts.length > 0 && (
                  <SuggestedProductsCarousel
                    suggestedProducts={suggestedProducts}
                    carouselIndex={carouselIndex}
                    setCarouselIndex={setCarouselIndex}
                    addProductToCart={addProductToCart}
                    formatPrice={formatPrice}
                    onCloseCart={() => setSidebarMounted(false)}
                  />
                )}

                <CartSummary
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
                  showCheckoutActions={false}
                />
              </div>

              <div className="border-t border-gray-200 bg-white px-[12px] py-[12px]">
                <CheckoutActions
                  setOpenCart={setOpenCart}
                  cart={cart}
                  setSidebarMounted={setSidebarMounted}
                  freight={freight}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
