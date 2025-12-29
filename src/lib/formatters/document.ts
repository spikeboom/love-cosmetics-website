/**
 * Utilitarios de formatacao de documentos (CPF, CNPJ)
 */

/**
 * Formata CPF durante digitacao
 * @param value - String de entrada do usuario
 * @returns String formatada ex: "123.456.789-01"
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

/**
 * Formata CNPJ durante digitacao
 * @param value - String de entrada do usuario
 * @returns String formatada ex: "12.345.678/0001-90"
 */
export function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    .slice(0, 18);
}

/**
 * Remove formatacao de CPF/CNPJ (apenas digitos)
 * @param value - String formatada
 * @returns Apenas digitos
 */
export function unformatDocument(value: string): string {
  return value.replace(/\D/g, "");
}
