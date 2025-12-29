import { useState } from "react";
import { useSnackbar } from "notistack";
import React from "react";
import { removeCouponTracking } from "@/core/tracking/product-tracking";

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

    // Usar função de tracking movida para core/tracking
    removeCouponTracking(cupom);

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