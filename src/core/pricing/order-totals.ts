/**
 * Fonte de verdade para cálculo de desconto de cupom no total do pedido.
 * item.preco permanece como preço base (com desconto de kit, mas SEM cupom).
 * O desconto do cupom é aplicado apenas no total.
 */

export interface OrderTotalsInput {
  items: Array<{ preco: number; quantity: number }>;
  cupons: Array<{ multiplacar?: number; diminuir?: number }>;
  frete: number;
}

export interface OrderTotalsResult {
  itemsSubtotalCents: number;
  couponDiscountCents: number;
  itemsTotalAfterCouponCents: number;
  freteCents: number;
  totalCents: number;
}

export function calculateOrderTotals(input: OrderTotalsInput): OrderTotalsResult {
  const { items, cupons, frete } = input;

  // Subtotal em centavos (preço base * qty)
  const itemsSubtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.preco * 100) * (item.quantity || 1),
    0,
  );

  // Compor cupons: multiplicar = produto de todos multiplacar, diminuir = soma
  const validCupons = Array.isArray(cupons) ? cupons : [];
  const multiplicar = validCupons.reduce(
    (acc, c) => acc * (c.multiplacar ?? 1),
    1,
  );
  const diminuirCents = validCupons.reduce(
    (acc, c) => acc + Math.round((c.diminuir ?? 0) * 100),
    0,
  );

  // Aplicar cupom no subtotal
  const afterCouponCentsRaw = Math.round(itemsSubtotalCents * multiplicar) - diminuirCents;
  const afterCouponCents = Math.max(0, Math.min(afterCouponCentsRaw, itemsSubtotalCents));

  const couponDiscountCents = itemsSubtotalCents - afterCouponCents;

  const freteCents = Math.round(frete * 100);
  const totalCents = afterCouponCents + freteCents;

  return {
    itemsSubtotalCents,
    couponDiscountCents,
    itemsTotalAfterCouponCents: afterCouponCents,
    freteCents,
    totalCents,
  };
}

export function centsToReais(cents: number): number {
  return cents / 100;
}
