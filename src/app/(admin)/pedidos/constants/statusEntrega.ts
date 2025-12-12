// Status de entrega disponíveis
export const STATUS_ENTREGA = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
  PAGAMENTO_CONFIRMADO: "Pagamento Confirmado",
  EM_SEPARACAO: "Em Separação",
  EMBALADO: "Embalado",
  ENVIADO: "Enviado",
  EM_TRANSITO: "Em Trânsito",
  SAIU_PARA_ENTREGA: "Saiu para Entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
  DEVOLVIDO: "Devolvido",
} as const;

export type StatusEntregaKey = keyof typeof STATUS_ENTREGA;

// Usuários permitidos
export const USUARIOS_PERMITIDOS = [
  "Adriano",
  "Cassy",
  "Paulo",
  "Gerilza",
  "Isabelle",
] as const;

// Cores para cada status
export const STATUS_COLORS: Record<StatusEntregaKey, { bg: string; text: string; border: string }> = {
  AGUARDANDO_PAGAMENTO: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-300" },
  PAGAMENTO_CONFIRMADO: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-300" },
  EM_SEPARACAO: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" },
  EMBALADO: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-300" },
  ENVIADO: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-300" },
  EM_TRANSITO: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-300" },
  SAIU_PARA_ENTREGA: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-300" },
  ENTREGUE: { bg: "bg-green-50", text: "text-green-600", border: "border-green-300" },
  CANCELADO: { bg: "bg-red-50", text: "text-red-600", border: "border-red-300" },
  DEVOLVIDO: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300" },
};
