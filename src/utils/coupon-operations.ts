import { fetchCupom } from "@/modules/cupom/domain";
import { waitForGTMReady } from "@/utils/gtm-ready-helper";
import { processProdutos } from "@/modules/produto/domain";
import { processProdutosRevert } from "@/core/processing/product-processing";

export const handleCupom = (cupom: any, cupons: any, setCupons: any, cart: any, setCart: any) => {
  if (cupons.includes(cupom)) {
    setCupons(cupons.filter((c: any) => c !== cupom));

    let cartResult = processProdutosRevert({ data: cart });

    cartResult = cartResult?.data?.reduce((acc: any, item: any) => {
      acc[item.id] = item;
      return acc;
    }, {});
    setCart(cartResult);
  } else {
    processProdutos({ data: Object.values(cart) }, cupom?.codigo).then(
      (cartResult) => {
        cartResult = cartResult?.data?.reduce((acc: any, item: any) => {
          acc[item.id] = item;
          return acc;
        }, {});
        setCart(cartResult);

        setCupons([...cupons, cupom]);
      },
    );
  }
};

export const handleAddCupom = async (codigo: any, cupons: any, notify: any, closeSnackbar: any, handleCupomFn: any) => {
  // aviso de busca
  const loadingKey = notify("Buscando cupom...", {
    variant: "info",
    persist: true,
  });
  try {
    const { data } = await fetchCupom({ code: codigo });
    closeSnackbar(loadingKey);

    if (!data?.[0]) {
      notify(`Cupom "${codigo}" não encontrado!`, {
        variant: "error",
        persist: true,
      });
      return;
    }

    if (cupons.some((c: any) => c.codigo === data[0].codigo)) {
      notify("Esse cupom já foi adicionado!", {
        variant: "success",
      });
      return;
    }

    if (cupons.length >= 1) {
      notify("Só é possível aplicar um cupom por vez!", {
        variant: "error",
        persist: true,
      });
      return;
    }

    // Tracking do evento de aplicar cupom
    if (typeof window !== "undefined") {
      const gaData = await waitForGTMReady();

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "apply_coupon",
        event_id: `apply_coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cupom_codigo: data[0].codigo,
        cupom_nome: data[0].nome || data[0].codigo,
        cupom_titulo: data[0].titulo || data[0].codigo,
        elemento_clicado: "apply_coupon_button",
        url_pagina: window.location.href,
        ...gaData,
      });
    }

    handleCupomFn(data[0]);
    notify(`Cupom "${data[0].codigo}" aplicado com sucesso!`, {
      variant: "success",
    });
  } catch (err) {
    closeSnackbar(loadingKey);
    console.error(err);
    notify("Erro ao aplicar cupom.", { variant: "error" });
  }
};