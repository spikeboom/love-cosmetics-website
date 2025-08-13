import { useMeuContexto } from "@/components/common/Context/context";

export function useCartCore() {
  const {
    sidebarMounted,
    setSidebarMounted,
    cart,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    total,
    cupons,
    handleCupom,
    descontos,
    handleAddCupom,
    loadingAddItem,
    addProductToCart,
  } = useMeuContexto();
  
  return {
    sidebarMounted,
    setSidebarMounted,
    cart,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    total,
    cupons,
    handleCupom,
    descontos,
    handleAddCupom,
    loadingAddItem,
    addProductToCart,
  };
}