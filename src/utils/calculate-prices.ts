/**
 * Calcula informações de preço a partir dos dados do produto
 */

import { applyKitDiscountFromFinalPrice } from "@/core/pricing/kits";

interface PriceCalculationResult {
  preco: number;
  precoOriginal: number | null;
  desconto: string | null;
  parcelas: string;
  precoFormatado: string;
  precoOriginalFormatado: string | null;
}

export function calculateProductPrices(
  preco: number,
  precoOriginal?: number | null,
  product?: { nome?: string | null; slug?: string | null }
): PriceCalculationResult {
  // Preço do Strapi já é o preço final - calcula preco_de a partir do desconto
  const kitPricing = applyKitDiscountFromFinalPrice({
    finalPrice: preco,
    product: product ?? {},
  });

  const precoFinal = kitPricing?.preco ?? preco;

  // Preço original (de) - se não fornecido, usa null
  const precoOriginalValue =
    kitPricing?.preco_de ?? (precoOriginal && precoOriginal > precoFinal ? precoOriginal : null);

  // Calcula o desconto baseado no preço final e preço original
  let desconto = null;
  if (kitPricing) {
    desconto = kitPricing.desconto;
  } else if (precoFinal && precoOriginalValue && precoOriginalValue > precoFinal) {
    const percentualDesconto = Math.round(
      ((precoOriginalValue - precoFinal) / precoOriginalValue) * 100
    );
    desconto = `${percentualDesconto}% OFF`;
  }

  // Calcula o valor de cada parcela (3x sem juros)
  const valorParcela = precoFinal > 0 ? (precoFinal / 3).toFixed(2).replace(".", ",") : "0,00";
  const parcelas = `3x R$${valorParcela} sem juros`;

  // Formata preços para exibição
  const precoFormatado = precoFinal.toFixed(2).replace(".", ",");
  const precoOriginalFormatado = precoOriginalValue
    ? precoOriginalValue.toFixed(2).replace(".", ",")
    : null;

  return {
    preco: precoFinal,
    precoOriginal: precoOriginalValue,
    desconto,
    parcelas,
    precoFormatado,
    precoOriginalFormatado,
  };
}
