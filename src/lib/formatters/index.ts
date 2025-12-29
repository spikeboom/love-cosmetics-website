/**
 * Utilitarios de Formatacao
 *
 * Centralizacao de funcoes de formatacao usadas em todo o projeto
 * para evitar duplicacao e garantir consistencia.
 */

// Moeda
export { formatPrice, formatCurrency } from "./currency";

// Data e Hora
export {
  formatDate,
  formatDateTime,
  formatTime,
  formatSecondsToTime,
  formatCountdown,
  formatDateInput,
} from "./date";

// Documentos (CPF, CNPJ)
export { formatCPF, formatCNPJ, unformatDocument } from "./document";

// Contato (Telefone, CEP)
export { formatTelefone, formatCEP, unformatContact } from "./contact";

// Pagamento (Cartao)
export {
  formatCardNumber,
  formatValidade,
  formatCVV,
  unformatCardNumber,
  maskCardNumber,
} from "./payment";
