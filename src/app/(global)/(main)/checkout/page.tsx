import React from "react";
import PedidoForm from "./PedidoForm";
import { PushInitiateCheckout } from "./PushInitiateCheckout";

export const metadata = {
  title: "Lové Cosméticos - Checkout",
};

const CheckoutPage = () => {
  return (
    <>
      <PedidoForm />
      <PushInitiateCheckout />
    </>
  );
};

export default CheckoutPage;
