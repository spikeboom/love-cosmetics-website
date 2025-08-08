"use client";
import { waitForGTMReady } from "@/utils/gtm-ready-helper";
import { useEffect } from "react";

export function ViewContentEvent({ produto }: any) {
  useEffect(() => {
    const pushEvent = async () => {
      if (typeof window !== "undefined") {
        const gaData = await waitForGTMReady();
        
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "ViewContent",
          event_id: `viewcontent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content_name: decodeURIComponent(produto?.nome),
          content_ids: [produto?.id],
          content_type: "product",
          value: produto?.preco,
          currency: "BRL",
          ...gaData,
        });
      }
    };
    
    pushEvent();
  }, [produto]);

  return <></>;
}
