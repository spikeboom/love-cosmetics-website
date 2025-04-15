"use client";
import { useMeuContexto } from "@/components/context/context";
import { useEffect, useRef } from "react";

export function PushInitiateCheckout() {
  const { cart, total } = useMeuContexto();
  const hasPushedRef = useRef(false);

  const cartItems = Object.values(cart || {}).map((item: any) => ({
    id: item?.id,
    nome: item?.nome,
    preco: item?.preco,
    quantity: item?.quantity,
  }));

  useEffect(() => {
    if (
      hasPushedRef.current ||
      !cart ||
      Object.keys(cart).length === 0 ||
      !total || // false se undefined, null ou 0
      total <= 0
    )
      return;

    const eventId = `initiatecheckout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "InitiateCheckout",
      event_id: eventId,
      ecommerce: {
        currency: "BRL",
        value: total,
        items: cartItems.map((item) => ({
          item_id: item?.id ?? "",
          item_name: decodeURIComponent(item?.nome ?? ""),
          price: item?.preco ?? 0,
          quantity: item?.quantity ?? 1,
        })),
      },
    });

    hasPushedRef.current = true;
  }, [cart, total]);

  return null;
}
