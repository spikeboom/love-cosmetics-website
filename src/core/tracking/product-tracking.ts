import { waitForGTMReady } from "@/utils/gtm-ready-helper";
import { extractGaSessionData } from "@/utils/get-ga-cookie-info";

// MOVIDO EXATAMENTE do context.jsx linhas 30-51
export const addProductEvent = async (product: any) => {
  const gaData = await waitForGTMReady();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "add_to_cart",
    event_id: `addtocart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ecommerce: {
      currency: "BRL",
      value: product.preco,
      items: [
        {
          item_id: product.id,
          item_name: decodeURIComponent(product.nome),
          price: product.preco,
          quantity: 1,
        },
      ],
    },
    ...gaData,
  });
};

// MOVIDO do useModalCart/coupon-local.ts - tracking de remoção de cupom
export const removeCouponTracking = (cupom: any) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "remove_coupon",
      event_id: `remove_coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cupom_codigo: cupom.codigo,
      cupom_nome: cupom.nome || cupom.codigo,
      cupom_titulo: cupom.titulo || cupom.codigo,
      elemento_clicado: "remove_coupon_button",
      url_pagina: window.location.href,
      ...extractGaSessionData("G-SXLFK0Y830"),
    });
  }
};