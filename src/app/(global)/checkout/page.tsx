import React from "react";
import PedidoForm from "./PedidoForm";
import { ModalCart } from "../pdp/[slug]/modal-cart/modal-cart";
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
