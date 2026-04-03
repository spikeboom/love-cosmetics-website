import { calculateFreightFrenet } from "@/app/actions/freight-actions";
import { calculateOrderTotals, centsToReais } from "@/core/pricing/order-totals";
import { applyKitDiscountFromFinalPrice } from "@/core/pricing/kits";
import { fetchAndValidateCupom, fetchProdutosComFallback, PRICE_TOLERANCE } from "@/lib/strapi";
import { PRODUTOS_ESGOTADOS_SLUGS } from "@/config/produtos-esgotados";
import { FREE_SHIPPING_THRESHOLD, isEconomicaService } from "@/core/pricing/shipping-constants";

function formatCupomDescricao(cupons: Array<{ multiplacar?: number; diminuir?: number }>): string | null {
  if (!Array.isArray(cupons) || cupons.length === 0) return null;

  const partes: string[] = [];

  for (const c of cupons) {
    const multiplacar = typeof c.multiplacar === "number" ? c.multiplacar : null;
    const diminuir = typeof c.diminuir === "number" ? c.diminuir : null;

    const temPorcentagem = multiplacar !== null && multiplacar < 1 && multiplacar > 0;
    const temValorFixo = diminuir !== null && diminuir !== 0;

    if (temPorcentagem) {
      const porcentagem = Math.round((1 - multiplacar) * 100);
      partes.push(`${porcentagem}%`);
    }

    if (temValorFixo) {
      partes.push(`R$${Math.abs(diminuir).toFixed(2).replace(".", ",")}`);
    }
  }

  return partes.length > 0 ? partes.join(" + ") : null;
}

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
    cupomDescricao?: string | null;
    freteValidado: number;
    cupomCodigo?: string | null;
    cupomUsosRestantes?: number | null;
    freteService?: {
      carrier: string;
      service: string;
      deliveryTime: number;
      serviceCode: string;
    };
  };
}

type FrenetService = {
  carrier: string;
  service: string;
  price: number;
  deliveryTime: number;
  serviceCode: string;
};

function isProductionEnv() {
  return process.env.NODE_ENV === "production" || process.env.STAGE === "PRODUCTION";
}

function cleanCep(cep: unknown): string {
  return String(cep || "").replace(/\D/g, "");
}

function validateFrete(freteEnviado: number): { valid: boolean; error?: string } {
  if (!Number.isFinite(freteEnviado)) {
    return { valid: false, error: "Valor de frete invalido" };
  }
  if (freteEnviado < 0) {
    return { valid: false, error: "Valor de frete invalido (negativo)" };
  }
  if (freteEnviado > 500) {
    return { valid: false, error: "Valor de frete suspeito (muito alto)" };
  }
  return { valid: true };
}

function isDevFreightService(service: FrenetService) {
  return service.carrier === "[DEV]" || service.serviceCode === "DEV_TEST";
}

function findMatchingFreightServiceByPriceCents(services: FrenetService[], freteEnviado: number) {
  const targetCents = Math.round(freteEnviado * 100);
  let best: FrenetService | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const s of services) {
    const cents = Math.round(s.price * 100);
    const diff = Math.abs(cents - targetCents);
    if (diff <= 1 && diff < bestDiff) {
      best = s;
      bestDiff = diff;
    }
  }

  return best;
}

export async function validateOrder(
  items: OrderItem[],
  cupons: string[],
  descontosEnviado: number,
  totalEnviado: number,
  freteEnviado: number,
  cepDestino: string,
): Promise<ValidationResult> {
  try {
    // 1. Validar se ha items
    if (!items || items.length === 0) {
      return {
        valid: false,
        error: "Carrinho vazio",
        code: "EMPTY_CART",
        calculatedTotal: 0,
        calculatedDescontos: 0,
      };
    }

    // 2. Validar CEP
    const cepLimpo = cleanCep(cepDestino);
    if (cepLimpo.length !== 8) {
      return {
        valid: false,
        error: "CEP invalido",
        code: "INVALID_CEP",
        calculatedTotal: 0,
        calculatedDescontos: 0,
      };
    }

    // 3. Buscar e validar cupom (server-side)
    const cuponsData: Array<{ multiplacar: number; diminuir: number }> = [];
    let cupomCodigoValidado: string | null = null;
    let cupomUsosRestantes: number | null = null;

    if (Array.isArray(cupons) && cupons.length > 1) {
      return {
        valid: false,
        error: "Apenas 1 cupom por pedido",
        code: "MULTIPLE_COUPONS_NOT_ALLOWED",
        calculatedTotal: 0,
        calculatedDescontos: 0,
      };
    }

    if (cupons && cupons.length > 0) {
      const cupomCodigo = String(cupons[0] || "").trim();
      const cupomResult = await fetchAndValidateCupom(cupomCodigo);

      if (!cupomResult.valido || !cupomResult.cupom) {
        return {
          valid: false,
          error: `Cupom \"${cupomCodigo}\" invalido ou expirado`,
          code: "INVALID_COUPON",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      cuponsData.push({
        multiplacar: cupomResult.cupom.multiplacar,
        diminuir: cupomResult.cupom.diminuir,
      });
      cupomCodigoValidado = cupomResult.cupom.codigo;
      cupomUsosRestantes =
        typeof cupomResult.cupom.usos_restantes === "number" ? cupomResult.cupom.usos_restantes : null;
    }

    // 4. Buscar produtos do Strapi (com fallback por nome)
    const itemsParaBusca = items.map((item) => ({
      id: item.reference_id,
      nome: item.name,
    }));
    const produtosReais = await fetchProdutosComFallback(itemsParaBusca);

    // 4b. Validar se algum produto esta esgotado
    for (const item of items) {
      const produtoReal = produtosReais.get(item.reference_id);
      if (produtoReal?.slug && PRODUTOS_ESGOTADOS_SLUGS.includes(produtoReal.slug)) {
        return {
          valid: false,
          error: `O produto "${item.name}" está esgotado e não pode ser comprado no momento.`,
          code: "PRODUCT_OUT_OF_STOCK",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }
    }

    // 5. Validar cada item (preco base, sem cupom)
    const validatedItems: Array<{ preco: number; quantity: number }> = [];
    const itemsParaFrete: Array<{
      quantity: number;
      peso_gramas?: number;
      altura?: number;
      largura?: number;
      comprimento?: number;
      bling_number?: number;
      preco: number;
    }> = [];

    for (const item of items) {
      const produtoReal = produtosReais.get(item.reference_id);

      if (!produtoReal) {
        return {
          valid: false,
          error: `Produto nao encontrado: ${item.name}`,
          code: "PRODUCT_NOT_FOUND",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      // Preco do Strapi ja e o preco final (com desconto do kit aplicado)
      const precoStrapi = produtoReal.preco;
      const kitPricing = applyKitDiscountFromFinalPrice({
        finalPrice: precoStrapi,
        product: { nome: produtoReal.nome },
      });
      const precoOriginal = kitPricing?.preco ?? precoStrapi;
      const precoEnviado = item.preco;

      // Comparar preco base (sem cupom) diretamente
      if (Math.abs(precoOriginal - precoEnviado) > PRICE_TOLERANCE) {
        return {
          valid: false,
          error: `O preco do produto \"${item.name}\" foi atualizado. Por favor, atualize seu carrinho.`,
          code: "PRICE_MISMATCH",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      if (item.quantity <= 0) {
        return {
          valid: false,
          error: `Quantidade invalida para \"${item.name}\"`,
          code: "INVALID_QUANTITY",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      if (item.quantity > 100) {
        return {
          valid: false,
          error: `Quantidade suspeita para \"${item.name}\" (maximo 100 unidades)`,
          code: "SUSPICIOUS_QUANTITY",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      validatedItems.push({ preco: precoOriginal, quantity: item.quantity });
      itemsParaFrete.push({
        quantity: item.quantity,
        peso_gramas: produtoReal.peso_gramas,
        altura: produtoReal.altura,
        largura: produtoReal.largura,
        comprimento: produtoReal.comprimento,
        bling_number: produtoReal.bling_number,
        preco: precoOriginal,
      });
    }

    // 6. Validar frete enviado e recalcular no server (Frenet)
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

    let freteValidado = freteEnviado;
    let freteService: FrenetService | undefined;

    const freteResult = await calculateFreightFrenet(cepLimpo, itemsParaFrete);
    if (!freteResult.success) {
      if (isProductionEnv()) {
        return {
          valid: false,
          error: freteResult.error || "Nao foi possivel validar o frete no momento",
          code: "FREIGHT_UNAVAILABLE",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }
    } else {
      const devFreightEnabled = process.env.NEXT_PUBLIC_DEV_TOOLS === "true";
      const services = (devFreightEnabled
        ? freteResult.services
        : freteResult.services.filter((s) => !isDevFreightService(s))) as FrenetService[];

      // 6b. Verificar frete gratis: se frete enviado = 0, validar server-side
      if (freteEnviado === 0) {
        // Calcular subtotal apos cupons server-side
        const totalsForFreeShipping = calculateOrderTotals({
          items: validatedItems,
          cupons: cuponsData,
          frete: 0,
        });
        const subtotalAfterCoupons = centsToReais(totalsForFreeShipping.itemsTotalAfterCouponCents);

        // Verificar se Economica existe nos servicos disponiveis
        const economicaService = services.find((s) => isEconomicaService(s.carrier, s.service));

        if (subtotalAfterCoupons >= FREE_SHIPPING_THRESHOLD && economicaService) {
          // Frete gratis valido - aceitar 0 e usar servico Economica
          freteValidado = 0;
          freteService = economicaService;
        } else {
          // Frete gratis nao se aplica - rejeitar
          const cheapest = services.reduce((min, s) => (s.price < min.price ? s : min), services[0]);
          freteValidado = cheapest?.price ?? 0;

          const totalsForError = calculateOrderTotals({
            items: validatedItems,
            cupons: cuponsData,
            frete: freteValidado,
          });

          return {
            valid: false,
            error: "Frete grátis não se aplica. Volte e recalcule o frete.",
            code: "FREIGHT_MISMATCH",
            calculatedTotal: centsToReais(totalsForError.totalCents),
            calculatedDescontos: centsToReais(totalsForError.couponDiscountCents),
            details: {
              itemsSubtotal: centsToReais(totalsForError.itemsSubtotalCents),
              cupomDesconto: centsToReais(totalsForError.couponDiscountCents),
              freteValidado,
            },
          };
        }
      } else {
        const match = findMatchingFreightServiceByPriceCents(services, freteEnviado);
        if (!match) {
          const cheapest = services.reduce((min, s) => (s.price < min.price ? s : min), services[0]);
          freteValidado = cheapest?.price ?? freteEnviado;

          const totalsForError = calculateOrderTotals({
            items: validatedItems,
            cupons: cuponsData,
            frete: freteValidado,
          });

          return {
            valid: false,
            error: "Frete desatualizado. Volte e recalcule o frete para continuar.",
            code: "FREIGHT_MISMATCH",
            calculatedTotal: centsToReais(totalsForError.totalCents),
            calculatedDescontos: centsToReais(totalsForError.couponDiscountCents),
            details: {
              itemsSubtotal: centsToReais(totalsForError.itemsSubtotalCents),
              cupomDesconto: centsToReais(totalsForError.couponDiscountCents),
              freteValidado,
            },
          };
        }

        freteValidado = match.price;
        freteService = match;
      }
    }

    // 7. Usar calculateOrderTotals como fonte de verdade
    const totals = calculateOrderTotals({
      items: validatedItems,
      cupons: cuponsData,
      frete: freteValidado,
    });

    const descontoCalculado = centsToReais(totals.couponDiscountCents);
    const totalCalculado = centsToReais(totals.totalCents);
    const subtotalOriginal = centsToReais(totals.itemsSubtotalCents);
    const cupomDescricao = cupomCodigoValidado ? formatCupomDescricao(cuponsData) : null;

    // 8. Comparar valores (defesa em profundidade / carrinho desatualizado)
    if (Math.abs(descontoCalculado - descontosEnviado) > PRICE_TOLERANCE) {
      return {
        valid: false,
        error: "Valor do desconto divergente. Por favor, atualize seu carrinho.",
        code: "DISCOUNT_MISMATCH",
        calculatedTotal: totalCalculado,
        calculatedDescontos: descontoCalculado,
      };
    }

    if (Math.abs(totalCalculado - totalEnviado) > PRICE_TOLERANCE) {
      return {
        valid: false,
        error: "Valor total divergente. Por favor, atualize seu carrinho.",
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
        cupomDescricao,
        freteValidado,
        cupomCodigo: cupomCodigoValidado,
        cupomUsosRestantes,
        ...(freteService
          ? {
              freteService: {
                carrier: freteService.carrier,
                service: freteService.service,
                deliveryTime: freteService.deliveryTime,
                serviceCode: freteService.serviceCode,
              },
            }
          : {}),
      },
    };
  } catch (error) {
    console.error("Erro na validacao do pedido:", error);
    return {
      valid: false,
      error: "Erro interno ao validar pedido",
      code: "VALIDATION_ERROR",
      calculatedTotal: 0,
      calculatedDescontos: 0,
    };
  }
}
