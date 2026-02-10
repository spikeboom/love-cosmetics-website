import { fetchProdutosComFallback, fetchAndValidateCupom, PRICE_TOLERANCE } from "@/lib/strapi";
import { applyKitDiscountFromFinalPrice } from "@/core/pricing/kits";
import { calculateOrderTotals, centsToReais } from "@/core/pricing/order-totals";

interface OrderItem {
  reference_id: string;
  name: string;
  quantity: number;
  preco: number;
  unit_amount: number;
  image_url?: string;
  bling_number?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  calculatedTotal: number;
  calculatedDescontos: number;
  details?: {
    itemsSubtotal: number;
    cupomDesconto: number;
    freteValidado: number;
  };
}

function validateFrete(freteEnviado: number): { valid: boolean; error?: string } {
  if (freteEnviado < 0) {
    return { valid: false, error: "Valor de frete inválido (negativo)" };
  }
  if (freteEnviado > 150) {
    return { valid: false, error: "Valor de frete suspeito (muito alto)" };
  }
  return { valid: true };
}

export async function validateOrder(
  items: OrderItem[],
  cupons: string[],
  descontosEnviado: number,
  totalEnviado: number,
  freteEnviado: number
): Promise<ValidationResult> {
  try {
    // 1. Validar se há items
    if (!items || items.length === 0) {
      return {
        valid: false,
        error: "Carrinho vazio",
        code: "EMPTY_CART",
        calculatedTotal: 0,
        calculatedDescontos: 0,
      };
    }

    // 2. Buscar e validar cupom
    const cuponsData: Array<{ multiplacar: number; diminuir: number }> = [];

    if (cupons && cupons.length > 0) {
      const cupomCodigo = cupons[0];
      const cupomResult = await fetchAndValidateCupom(cupomCodigo);

      if (!cupomResult.valido || !cupomResult.cupom) {
        return {
          valid: false,
          error: `Cupom "${cupomCodigo}" inválido ou expirado`,
          code: "INVALID_COUPON",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      cuponsData.push({
        multiplacar: cupomResult.cupom.multiplacar,
        diminuir: cupomResult.cupom.diminuir,
      });
    }

    // 3. Buscar produtos do Strapi (com fallback por nome)
    const itemsParaBusca = items.map(item => ({
      id: item.reference_id,
      nome: item.name,
    }));
    const produtosReais = await fetchProdutosComFallback(itemsParaBusca);

    // 4. Validar cada item (preço base, sem cupom)
    const validatedItems: Array<{ preco: number; quantity: number }> = [];

    for (const item of items) {
      const produtoReal = produtosReais.get(item.reference_id);

      if (!produtoReal) {
        return {
          valid: false,
          error: `Produto não encontrado: ${item.name}`,
          code: "PRODUCT_NOT_FOUND",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      // Preço do Strapi já é o preço final (com desconto do kit aplicado)
      const precoStrapi = produtoReal.preco;
      const kitPricing = applyKitDiscountFromFinalPrice({
        finalPrice: precoStrapi,
        product: { nome: produtoReal.nome },
      });
      const precoOriginal = kitPricing?.preco ?? precoStrapi;
      const precoEnviado = item.preco;

      // Agora comparamos preço base (sem cupom) diretamente
      if (Math.abs(precoOriginal - precoEnviado) > PRICE_TOLERANCE) {
        return {
          valid: false,
          error: `O preço do produto "${item.name}" foi atualizado. Por favor, atualize seu carrinho.`,
          code: "PRICE_MISMATCH",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      if (item.quantity <= 0) {
        return {
          valid: false,
          error: `Quantidade inválida para "${item.name}"`,
          code: "INVALID_QUANTITY",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      if (item.quantity > 100) {
        return {
          valid: false,
          error: `Quantidade suspeita para "${item.name}" (máximo 100 unidades)`,
          code: "SUSPICIOUS_QUANTITY",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      validatedItems.push({ preco: precoOriginal, quantity: item.quantity });
    }

    // 5. Validar frete
    const freteValidacao = validateFrete(freteEnviado);
    if (!freteValidacao.valid) {
      return {
        valid: false,
        error: freteValidacao.error,
        code: "INVALID_FREIGHT",
        calculatedTotal: 0,
        calculatedDescontos: 0,
      };
    }

    // 6. Usar calculateOrderTotals como fonte de verdade
    const totals = calculateOrderTotals({
      items: validatedItems,
      cupons: cuponsData,
      frete: freteEnviado,
    });

    const descontoCalculado = centsToReais(totals.couponDiscountCents);
    const totalCalculado = centsToReais(totals.totalCents);
    const subtotalOriginal = centsToReais(totals.itemsSubtotalCents);

    // 7. Comparar valores
    if (Math.abs(descontoCalculado - descontosEnviado) > PRICE_TOLERANCE) {
      return {
        valid: false,
        error: `Valor do desconto divergente. Por favor, atualize seu carrinho.`,
        code: "DISCOUNT_MISMATCH",
        calculatedTotal: totalCalculado,
        calculatedDescontos: descontoCalculado,
      };
    }

    if (Math.abs(totalCalculado - totalEnviado) > PRICE_TOLERANCE) {
      return {
        valid: false,
        error: `Valor total divergente. Por favor, atualize seu carrinho.`,
        code: "TOTAL_MISMATCH",
        calculatedTotal: totalCalculado,
        calculatedDescontos: descontoCalculado,
      };
    }

    return {
      valid: true,
      calculatedTotal: totalCalculado,
      calculatedDescontos: descontoCalculado,
      details: {
        itemsSubtotal: subtotalOriginal,
        cupomDesconto: descontoCalculado,
        freteValidado: freteEnviado,
      },
    };
  } catch (error) {
    console.error("Erro na validação do pedido:", error);
    return {
      valid: false,
      error: "Erro interno ao validar pedido",
      code: "VALIDATION_ERROR",
      calculatedTotal: 0,
      calculatedDescontos: 0,
    };
  }
}
