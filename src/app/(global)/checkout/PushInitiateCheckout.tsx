"use client";
import { useMeuContexto } from "@/components/context/context";
import { useEffect } from "react";

export function PushInitiateCheckout() {
  const { cart, total } = useMeuContexto();

  const cartItems = Object.values(cart).map((item: any) => ({
    id: item.id,
    nome: item.nome,
    preco: item.preco,
    quantity: item.quantity,
  }));

  useEffect(() => {
    const eventId = `initiatecheckout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "InitiateCheckout",
      event_id: eventId,
      ecommerce: {
        currency: "BRL",
        value: total,
        items: cartItems.map((item) => ({
          item_id: item.id,
          item_name: decodeURIComponent(item.nome),
          price: item.preco,
          quantity: item.quantity,
        })),
      },
    });
  }, []);

  return <></>;
}
