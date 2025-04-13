"use client";
import { useEffect } from "react";

export function ViewContentEvent({ produto }: any) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log({ produto });
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "ViewContent",
        content_name: decodeURIComponent(produto.nome),
        content_ids: [produto.id],
        content_type: "product",
        value: produto.preco,
        currency: "BRL",
      });
    }
  }, [produto]);

  return <></>;
}
