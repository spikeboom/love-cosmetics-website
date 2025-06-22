"use client";
import { extractGaSessionData } from "@/utils/get-ga-cookie-info";
import { useEffect } from "react";

export function ViewContentEvent({ produto }: any) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "ViewContent",
        event_id: `viewcontent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content_name: decodeURIComponent(produto?.nome),
        content_ids: [produto?.id],
        content_type: "product",
        value: produto?.preco,
        currency: "BRL",
        ...extractGaSessionData("G-SXLFK0Y830"),
      });
    }
  }, [produto]);

  return <></>;
}
