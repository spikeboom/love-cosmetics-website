/**
 * Utilitarios de formatacao de moeda
 */

/**
 * Formata um valor numerico para moeda brasileira (BRL)
 * @param value - Valor numerico a ser formatado
 * @returns String formatada ex: "R$ 99,90"
 */
export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Formata um valor numerico para moeda com espaco apos R$
 * @param value - Valor numerico a ser formatado
 * @returns String formatada ex: "R$ 99,90"
 */
export function formatCurrency(value: number): string {
  return value
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    .replace("R$", "R$ ");
}
