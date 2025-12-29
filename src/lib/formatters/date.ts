/**
 * Utilitarios de formatacao de data e hora
 */

/**
 * Formata uma data para o formato brasileiro (dd/mm/yyyy)
 * @param dateString - String de data ISO ou Date
 * @returns String formatada ex: "25/12/2024"
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("pt-BR");
}

/**
 * Formata data e hora para o formato brasileiro
 * @param dateString - String de data ISO ou Date
 * @returns String formatada ex: "25/12/2024, 14:30"
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return `${date.toLocaleDateString("pt-BR")}, ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/**
 * Formata apenas a hora
 * @param dateString - String de data ISO ou Date
 * @returns String formatada ex: "14:30"
 */
export function formatTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata segundos em formato mm:ss (para timers/contadores)
 * @param seconds - Total de segundos
 * @returns String formatada ex: "05:30"
 */
export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formata segundos em formato "Xm YYs" (para countdown visual)
 * @param seconds - Total de segundos
 * @returns String formatada ex: "5m 30s"
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

/**
 * Formata data de nascimento durante digitacao (dd/mm/yyyy)
 * @param value - String de entrada do usuario
 * @returns String formatada com mascara
 */
export function formatDateInput(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4})\d+?$/, "$1");
}
