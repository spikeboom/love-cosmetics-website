export interface CartTotalsState {
  total: number;
  descontos: number;
  subtotalOriginal: number; // Soma dos preco_de (preços originais riscados)
  subtotalAfterCoupons: number; // Total dos itens após cupons, SEM frete
  isCartHydrated: boolean; // true após o auto-refresh inicial concluir (sucesso ou falha)
}

export interface CartValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  produtosDesatualizados: any[];
  cuponsDesatualizados: any[];
  produtosAtualizados: any[];
  lastValidation: Date | null;
  error: string | null;
}

export interface CartTotalsOperations {
  refreshCartPrices: (options?: { silent?: boolean }) => Promise<boolean>;
  validateCart: (cart: Record<string, any>, cupons: any[]) => Promise<any>;
  clearValidation: () => void;
}

export interface CartTotalsContextType extends CartTotalsState, CartValidationState, CartTotalsOperations {}
