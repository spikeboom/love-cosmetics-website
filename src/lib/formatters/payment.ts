/**
 * Utilitarios de formatacao de pagamento (cartao de credito)
 */

/**
 * Formata numero do cartao de credito durante digitacao
 * @param value - String de entrada do usuario
 * @returns String formatada ex: "1234 5678 9012 3456"
 */
export function formatCardNumber(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{4})(\d)/, "$1 $2")
    .replace(/(\d{4})(\d)/, "$1 $2")
    .replace(/(\d{4})(\d)/, "$1 $2")
    .replace(/(\d{4})\d+?$/, "$1");
}

/**
 * Formata validade do cartao durante digitacao (MM/AA)
 * @param value - String de entrada do usuario
 * @returns String formatada ex: "12/26"
 */
export function formatValidade(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})\d+?$/, "$1");
}

/**
 * Formata CVV (limita a 3 ou 4 digitos)
 * @param value - String de entrada do usuario
 * @param maxLength - Tamanho maximo (3 para Visa/Master, 4 para Amex)
 * @returns String com apenas digitos
 */
export function formatCVV(value: string, maxLength: number = 4): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

/**
 * Remove formatacao do numero do cartao (apenas digitos)
 * @param value - String formatada
 * @returns Apenas digitos
 */
export function unformatCardNumber(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Mascara numero do cartao para exibicao (mostra apenas ultimos 4 digitos)
 * @param cardNumber - Numero do cartao (formatado ou nao)
 * @returns String mascarada ex: "**** **** **** 3456"
 */
export function maskCardNumber(cardNumber: string): string {
  const numbers = cardNumber.replace(/\D/g, "");
  const lastFour = numbers.slice(-4);
  return `**** **** **** ${lastFour}`;
}
