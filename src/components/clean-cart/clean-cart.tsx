"use client";
import { useEffect } from "react";
import { useMeuContexto } from "../context/context";

export function ClearCart() {
  const { clearCart } = useMeuContexto();

  useEffect(() => {
    clearCart();
  }, []);

  return <></>;
}
