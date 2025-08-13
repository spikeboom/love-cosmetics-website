import { useState, useEffect } from "react";
import { useMeuContexto } from "@/components/common/Context/context";
import { useUI } from "@/core/ui/UIContext";
import { useSuggestedProducts } from "./useModalCart/suggested-products";
import { useCouponLocal } from "./useModalCart/coupon-local";
import { useSnackbar } from "notistack";

// Hook SIMPLIFICADO - apenas o que é necessário para o modal
export function useModalCartSimplified() {
  // Dados do contexto (apenas o essencial)
  const { 
    cart, 
    total, 
    cupons, 
    descontos, 
    handleAddCupom, 
    handleCupom 
  } = useMeuContexto();
  
  // Estado de UI específico
  const { sidebarMounted, setSidebarMounted } = useUI();
  
  // Funcionalidades específicas do modal
  const suggestedData = useSuggestedProducts(cart);
  const couponData = useCouponLocal(cupons, handleAddCupom, handleCupom);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Estado local do modal apenas
  const animationDuration = 700;
  const [openCart, setOpenCart] = useState(false);
  const [forRefreshPage, setForRefreshPage] = useState(false);

  useEffect(() => {
    if (!openCart) {
      const timer = setTimeout(() => {
        setSidebarMounted(false);
        if (forRefreshPage) {
          // window.location.reload();
        }
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [openCart, animationDuration, setSidebarMounted, forRefreshPage]);

  useEffect(() => {
    if (sidebarMounted) {
      setOpenCart(true);
    }
  }, [sidebarMounted]);

  // Retorna APENAS o que o modal precisa
  return {
    // Estado essencial
    cart,
    total,
    cupons,
    descontos,
    
    // Estado do modal
    openCart,
    setOpenCart,
    sidebarMounted,
    setSidebarMounted,
    animationDuration,
    forRefreshPage,
    setForRefreshPage,
    
    // Produtos sugeridos
    suggestedProducts: suggestedData.suggestedProducts,
    loadingSuggested: suggestedData.loadingSuggested,
    
    // Cupons locais
    cupom: couponData.cupom,
    setCupom: couponData.setCupom,
    loadingCupom: couponData.loadingCupom,
    openCupom: couponData.openCupom,
    setOpenCupom: couponData.setOpenCupom,
    handleAddCupomLocal: couponData.handleAddCupomLocal,
    removeCoupon: couponData.removeCoupon,
    
    // Notificações
    enqueueSnackbar,
    closeSnackbar,
  };
}