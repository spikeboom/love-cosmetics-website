/**
 * Retorna string indicando tipo de desconto do cupom (ex: "10%", "R$5,00", "10% + R$5,00")
 */
export const getTipoDesconto = (cupons: any[]): string => {
  if (!cupons || cupons.length === 0) {
    return '';
  }

  const tiposDesconto: string[] = [];
  cupons.forEach((c: any) => {
    const temPorcentagem = c.multiplacar && c.multiplacar < 1 && c.multiplacar > 0;
    const temValorFixo = c.diminuir && c.diminuir !== 0;

    if (temPorcentagem) {
      const porcentagem = Math.round((1 - c.multiplacar) * 100);
      tiposDesconto.push(`${porcentagem}%`);
    }
    if (temValorFixo) {
      // Usar valor absoluto pois diminuir pode ser negativo
      tiposDesconto.push(`R$${Math.abs(c.diminuir).toFixed(2).replace('.', ',')}`);
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

  // Ensure coupons is an array
  const validCupons = Array.isArray(cupons) ? cupons : [];

  // Desconto só existe se houver cupom aplicado
  // Sem cupom: desconto = 0
  // Com cupom: desconto = preço original (backup) - preço com cupom
  // NOTA: preco_de do Strapi é apenas para exibição visual (preço riscado), não para cálculo de desconto
  const descontoAplicado = validCupons.length > 0
    ? items.reduce((sum: number, item: any) => {
        // Só conta desconto se o produto tem cupom aplicado
        if (item.cupom_applied_codigo) {
          const precoOriginal = item.backup?.preco || item.preco;
          const precoComCupom = item.preco;
          return sum + (precoOriginal - precoComCupom) * item.quantity;
        }
        return sum;
      }, 0)
    : 0;
  setDescontos(descontoAplicado);

  // Persist state
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("cupons", JSON.stringify(validCupons));

  // Compute and set final total including shipping
  // Total usa baseTotal (que já tem cupom aplicado nos preços)
  const shippingFee = freightValue;
  const finalTotal = baseTotal + shippingFee;
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