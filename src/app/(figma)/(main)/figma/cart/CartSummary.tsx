'use client';

import { ResumoCompraCard } from '@/components/checkout/ResumoCompraCard';

interface CartSummaryProps {
  cartItems: any[];
  frete: number;
  cupons?: any[];
  total: number;
  onCheckout: () => void;
  isMobile?: boolean;
  freteCalculado?: boolean;
  isCartValid?: boolean | null;
  isValidating?: boolean;
  onRefreshCart?: () => void;
}

export function CartSummary({
  cartItems,
  frete,
  cupons = [],
  total,
  onCheckout,
  isMobile = false,
  freteCalculado = false,
  isCartValid = null,
  isValidating = false,
  onRefreshCart,
}: CartSummaryProps) {
  return (
    <ResumoCompraCard
      mode="cart"
      cartItems={cartItems}
      frete={frete}
      cupons={cupons}
      onCheckout={onCheckout}
      isMobile={isMobile}
      freteCalculado={freteCalculado}
      isCartValid={isCartValid}
      isValidating={isValidating}
      onRefreshCart={onRefreshCart}
    />
  );
}
