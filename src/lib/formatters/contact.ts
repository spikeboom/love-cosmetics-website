/**
 * Utilitarios de formatacao de contato (telefone, CEP)
 */

/**
 * Formata telefone durante digitacao
 * Suporta fixo (10 digitos) e celular (11 digitos)
 * @param value - String de entrada do usuario
 * @returns String formatada ex: "(11) 99999-9999" ou "(11) 3333-3333"
 */
export function formatTelefone(value: string): string {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 14);
  }

  // Celular: (XX) XXXXX-XXXX
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

/**
 * Formata CEP durante digitacao
 * @param value - String de entrada do usuario
 * @returns String formatada ex: "01310-100"
 */
export function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
}

/**
 * Remove formatacao de telefone/CEP (apenas digitos)
 * @param value - String formatada
 * @returns Apenas digitos
 */
export function unformatContact(value: string): string {
  return value.replace(/\D/g, "");
}
