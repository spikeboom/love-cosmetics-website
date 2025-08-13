import { useMeuContexto } from "@/components/common/Context/context";

export function useCartCore() {
  const {
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