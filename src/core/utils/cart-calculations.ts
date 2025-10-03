// MOVIDO EXATAMENTE do context.jsx
export class CartCalculations {
  // EXATO da linha 69-72 do context.jsx
  static getItemCount(cart: any): number {
    return Object.values(cart).reduce(
      (acc: number, product: any) => acc + product.quantity,
      0,
    );
  }

  // Função para calcular subtotal
  static getSubtotal(cart: any): number {
    return Object.values(cart).reduce(
      (acc: number, product: any) => acc + (product.preco * product.quantity),
      0,
    );
  }

  // Função para calcular desconto total aplicado
  static getTotalDiscount(cart: any, cupons: any[]): number {
    const subtotal = CartCalculations.getSubtotal(cart);
    const validCupons = Array.isArray(cupons) ? cupons : [];
    
    // Mesmo cálculo do calculateCartTotals
    const couponEffect = validCupons.reduce(
      (acc: any, cupom: any) => ({
        multiplicar: acc.multiplicar * cupom.multiplacar,
        diminuir: acc.diminuir + cupom.diminuir,
      }),
      { multiplicar: 1, diminuir: 0 },
    );

    const totalWithCupons = subtotal * couponEffect.multiplicar - couponEffect.diminuir;
    return subtotal - totalWithCupons;
  }
}