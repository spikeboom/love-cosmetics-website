import React from "react";
import PedidoForm from "./PedidoForm";
import { ModalCart } from "../pdp/[slug]/modal-cart/modal-cart";

export const metadata = {
  title: "Lové Cosméticos - Checkout",
};

const CheckoutPage = () => {
  return (
    <>
      <PedidoForm />
      <ModalCart />
    </>
  );
};

export default CheckoutPage;
