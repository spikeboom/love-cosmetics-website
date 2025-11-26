/**
 * Retorna string indicando tipo de desconto do cupom (ex: "10%", "R$5,00", "10% + R$5,00")
 */
export const getTipoDesconto = (cupons: any[]): string => {
  if (!cupons || cupons.length === 0) return '';

  const tiposDesconto: string[] = [];
  cupons.forEach((c: any) => {
    const temPorcentagem = c.multiplacar && c.multiplacar < 1 && c.multiplacar > 0;
    const temValorFixo = c.diminuir && c.diminuir > 0;

    if (temPorcentagem) {
      const porcentagem = Math.round((1 - c.multiplacar) * 100);
      tiposDesconto.push(`${porcentagem}%`);
    }
    if (temValorFixo) {
      tiposDesconto.push(`R$${c.diminuir.toFixed(2).replace('.', ',')}`);
    }
  });

  return tiposDesconto.join(' + ');
};

export const calculateCartTotals = (cart: any, cupons: any, setDescontos: any, setTotal: any, firstRun: any, handleAddCupom: any, freightValue: number = 15) => {
  if (!firstRun) return;

  // Calculate base totals
  const items = Object.values(cart) as any[];
  const baseTotal = items.reduce(
    (sum: number, { preco, quantity }: any) => sum + preco * quantity,
    0,
  );
  const baseTotalPrecoDe = items.reduce(
    (sum: number, { preco_de, quantity }: any) => sum + preco_de * quantity,
    0,
  );

  // Ensure coupons is an array
  const validCupons = Array.isArray(cupons) ? cupons : [];

  // Compute cumulative coupon effect
  const couponEffect = validCupons.reduce(
    (acc, cupom) => ({
      multiplicar: acc.multiplicar * cupom.multiplacar,
      diminuir: acc.diminuir + cupom.diminuir,
    }),
    { multiplicar: 1, diminuir: 0 },
  );

  // Final totals with coupons
  const totalWithCupons =
    baseTotal * couponEffect.multiplicar - couponEffect.diminuir;
  const totalDiscount = baseTotal - totalWithCupons;
  const totalDiscountPrecoDe = baseTotalPrecoDe - baseTotal;

  // Apply the discount
  const descontoAplicado = totalDiscount;
  setDescontos(descontoAplicado);

  // Persist state
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("cupons", JSON.stringify(validCupons));

  // Compute and set final total including shipping
  const shippingFee = freightValue;
  const finalTotal = totalWithCupons + shippingFee;
  setTotal(finalTotal);

  // Handle one-time URL coupon
  const url = new URL(window.location.href);
  const queryCupom = url.searchParams.get("cupom");

  const loadQueryCupom = async () => {
    await handleAddCupom(queryCupom);
    // Clear used coupon from URL
    url.searchParams.delete("cupom");
    window.history.replaceState({}, "", url.toString());
  };

  if (queryCupom) {
    loadQueryCupom();
  }
};