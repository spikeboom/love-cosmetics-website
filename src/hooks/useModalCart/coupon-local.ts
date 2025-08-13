import { useState } from "react";
import { useSnackbar } from "notistack";
import React from "react";
import { extractGaSessionData } from "@/utils/get-ga-cookie-info";

export function useCouponLocal(cupons: any, handleAddCupom: any, handleCupom: any) {
  const [cupom, setCupom] = useState("");
  const [loadingCupom, setLoadingCupom] = useState(false);
  const [openCupom, setOpenCupom] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [couponToRemove, setCouponToRemove] = useState<any>(null);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleAddCupomLocal = async () => {
    if (!!cupom) {
      if (cupons.find((c: any) => c.codigo === cupom)) {
        enqueueSnackbar("Esse cupom já foi adicionado!", {
          variant: "error",
          persist: true,
          action: (key) =>
            React.createElement(
              "button",
              {
                onClick: () => closeSnackbar(key),
                "aria-label": "Fechar snackbar",
                style: {
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                },
              },
              "✕",
            ),
        });
        setOpenCupom(false);
        return;
      }
      setLoadingCupom(true);
      handleAddCupom(cupom);
      setLoadingCupom(false);
      setOpenCupom(false);
    }
  };

  const removeCoupon = (cupom: any) => {
    if (!cupom) return;

    // Tracking do evento de remoção de cupom
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

    handleCupom(cupom);
  };

  return {
    cupom,
    setCupom,
    loadingCupom,
    setLoadingCupom,
    openCupom,
    setOpenCupom,
    openRemoveModal,
    setOpenRemoveModal,
    couponToRemove,
    setCouponToRemove,
    handleAddCupomLocal,
    removeCoupon
  };
}