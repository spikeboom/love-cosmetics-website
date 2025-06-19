import React from "react";
import PedidoForm from "./PedidoForm";
import { ModalCart } from "@/components/cart/ModalCart/modal-cart";
import { PushInitiateCheckout } from "./PushInitiateCheckout";

export const metadata = {
  title: "Lové Cosméticos - Checkout",
};

const CheckoutPage = () => {
  return (
    <>
      <PedidoForm />
      <ModalCart />
      <PushInitiateCheckout />
    </>
  );
};

export default CheckoutPage;
