/**
 * Calcula informações de preço a partir dos dados do produto
 */

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
  precoOriginal?: number | null
): PriceCalculationResult {
  // Preço original (de) - se não fornecido, usa null
  const precoOriginalValue = precoOriginal && precoOriginal > preco ? precoOriginal : null;

  // Calcula o desconto baseado no preço final e preço original
  let desconto = null;
  if (preco && precoOriginalValue && precoOriginalValue > preco) {
    const percentualDesconto = Math.round(
      ((precoOriginalValue - preco) / precoOriginalValue) * 100
    );
    desconto = `${percentualDesconto}% OFF`;
  }

  // Calcula o valor de cada parcela (3x sem juros)
  const valorParcela = preco > 0 ? (preco / 3).toFixed(2).replace(".", ",") : "0,00";
  const parcelas = `3x R$${valorParcela} sem juros`;

  // Formata preços para exibição
  const precoFormatado = preco.toFixed(2).replace(".", ",");
  const precoOriginalFormatado = precoOriginalValue
    ? precoOriginalValue.toFixed(2).replace(".", ",")
    : null;

  return {
    preco,
    precoOriginal: precoOriginalValue,
    desconto,
    parcelas,
    precoFormatado,
    precoOriginalFormatado,
  };
}
