/**
 * Mapa oficial de motivos de compra negada do PagBank.
 * Fonte: https://developer.pagbank.com.br/reference/motivos-de-compra-negada
 *
 * Mensagens seguem ABECS normativa nº021 e ja vem sem acentos da PagBank.
 */

export type DeclineSuggestion =
  | "RETRY_CARD" // ajustar dados e tentar mesmo cartao
  | "TRY_OTHER_CARD" // trocar de cartao
  | "USE_PIX" // pagar com Pix
  | "CONTACT_BANK" // ligar para o emissor
  | "WAIT" // tentar mais tarde
  | "CONTACT_SUPPORT"; // falar com suporte da loja

export interface DeclineInfo {
  titulo: string;
  acao: string;
  /** Se true, NAO oferecer botao de tentar novamente com o mesmo cartao. */
  doNotRetry: boolean;
  /** Sugestoes de acao na ordem em que devem aparecer no modal. */
  suggestions: DeclineSuggestion[];
}

const PAGBANK_DECLINE_MAP: Record<string, DeclineInfo> = {
  "10000": {
    titulo: "Pagamento bloqueado por seguranca",
    acao: "Sua transacao foi bloqueada por seguranca. Tente outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "10001": {
    titulo: "Limite de tentativas excedido",
    acao: "Voce excedeu o numero de tentativas para este cartao. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "10002": {
    titulo: "Cartao nao autorizado pelo banco",
    acao: "Seu banco recusou a transacao. Ligue na central do cartao ou tente outro cartao.",
    doNotRetry: false,
    suggestions: ["CONTACT_BANK", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "10003": {
    titulo: "Transacao invalida",
    acao: "Os dados enviados nao foram aceitos. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "10004": {
    titulo: "Transacao nao permitida",
    acao: "Esta transacao nao foi permitida. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20001": {
    titulo: "Contate a central do seu cartao",
    acao: "Seu cartao pode estar bloqueado ou com suspeita de fraude. Ligue na central do banco ou tente outro cartao.",
    doNotRetry: false,
    suggestions: ["CONTACT_BANK", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20003": {
    titulo: "Saldo ou limite insuficiente",
    acao: "Verifique o limite do seu cartao no app do banco ou pague com outro metodo.",
    doNotRetry: false,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX", "CONTACT_BANK"],
  },
  "20007": {
    titulo: "Verifique os dados do cartao",
    acao: "Confira numero, validade e CVV. Se estiver tudo certo, o cartao pode estar vencido.",
    doNotRetry: false,
    suggestions: ["RETRY_CARD", "TRY_OTHER_CARD"],
  },
  "20008": {
    titulo: "Parcelamento invalido",
    acao: "O numero de parcelas nao foi aceito. Tente um valor maior por parcela ou pague em menos vezes.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20012": {
    titulo: "Valor da transacao nao permitido",
    acao: "O valor desta compra nao e aceito pelo emissor. Tente outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20017": {
    titulo: "Transacao nao permitida",
    acao: "Esta transacao nao foi permitida. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20018": {
    titulo: "Contate a central do seu cartao",
    acao: "Seu emissor pediu que voce entre em contato com a central do cartao. Use outro cartao para pagar agora.",
    doNotRetry: true,
    suggestions: ["CONTACT_BANK", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20019": {
    titulo: "Falha de comunicacao com o banco",
    acao: "O banco emissor esta temporariamente fora do ar. Tente novamente em alguns minutos ou pague com Pix.",
    doNotRetry: false,
    suggestions: ["WAIT", "USE_PIX", "TRY_OTHER_CARD"],
  },
  "20039": {
    titulo: "Transacao nao permitida para este cartao",
    acao: "Este cartao nao aceita compras online. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20101": {
    titulo: "Senha invalida",
    acao: "A senha do cartao esta incorreta ou vencida. Use outro cartao ou pague com Pix.",
    doNotRetry: false,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20102": {
    titulo: "Senha invalida",
    acao: "A nova senha do cartao nao foi aceita. Use outro cartao ou pague com Pix.",
    doNotRetry: false,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20103": {
    titulo: "Tentativas de senha excedidas",
    acao: "Contate a central do seu cartao. Enquanto isso, use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["CONTACT_BANK", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20104": {
    titulo: "Valor excedido",
    acao: "O valor passou do limite definido pelo banco. Contate a central do cartao ou tente outro.",
    doNotRetry: false,
    suggestions: ["CONTACT_BANK", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20105": {
    titulo: "Quantidade de saques excedida",
    acao: "Contate a central do seu cartao para mais informacoes.",
    doNotRetry: false,
    suggestions: ["CONTACT_BANK", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20110": {
    titulo: "Conta destino invalida",
    acao: "Nao foi possivel concluir a operacao. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20111": {
    titulo: "Conta de origem invalida",
    acao: "Nao foi possivel concluir a operacao. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20112": {
    titulo: "Valor diferente do autorizado",
    acao: "O valor difere da autorizacao previa. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20113": {
    titulo: "Use a funcao credito",
    acao: "Este cartao foi cobrado na funcao errada. Confira se voce esta usando um cartao de credito.",
    doNotRetry: false,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20114": {
    titulo: "Use a funcao debito",
    acao: "Este cartao foi cobrado na funcao errada. Use um cartao de debito ou pague com Pix.",
    doNotRetry: false,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20115": {
    titulo: "Saque nao disponivel",
    acao: "Operacao nao disponivel para este cartao. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20116": {
    titulo: "Dados do cartao invalidos",
    acao: "Confira o numero do cartao. Se estiver correto, o emissor nao foi reconhecido.",
    doNotRetry: true,
    suggestions: ["RETRY_CARD", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20117": {
    titulo: "Erro no cartao",
    acao: "Houve um erro ao processar este cartao. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20118": {
    titulo: "Pagamento recorrente suspenso",
    acao: "O pagamento recorrente foi suspenso pelo emissor. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20119": {
    titulo: "Tente novamente",
    acao: "O emissor pediu que voce refaca a transacao. Tente novamente ou use outro cartao.",
    doNotRetry: false,
    suggestions: ["RETRY_CARD", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20158": {
    titulo: "Pagamento nao autorizado",
    acao: "O emissor recusou por politica ou seguranca. Tente em alguns minutos, use outro cartao ou pague com Pix.",
    doNotRetry: false,
    suggestions: ["WAIT", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20159": {
    titulo: "Autenticacao necessaria",
    acao: "O emissor pede autenticacao adicional. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX"],
  },
  "20301": {
    titulo: "Desbloqueie o cartao",
    acao: "Este cartao precisa ser desbloqueado pelo seu banco antes de usar. Use outro cartao ou pague com Pix.",
    doNotRetry: true,
    suggestions: ["CONTACT_BANK", "TRY_OTHER_CARD", "USE_PIX"],
  },
  "20999": {
    titulo: "Erro ao processar pagamento",
    acao: "Houve um erro inesperado. Tente outro cartao ou pague com Pix. Se persistir, fale com nosso atendimento.",
    doNotRetry: false,
    suggestions: ["TRY_OTHER_CARD", "USE_PIX", "CONTACT_SUPPORT"],
  },
};

/**
 * Resolve o motivo de uma recusa do PagBank em informacao amigavel para o usuario.
 *
 * Faz fallback inteligente: se o codigo nao esta mapeado, usa a mensagem do PagBank
 * (ja em PT-BR) e detecta o sufixo "NAO TENTE NOVAMENTE" para decidir o doNotRetry.
 */
export function getDeclineInfo(payment_response?: {
  code?: string | null;
  message?: string | null;
}): DeclineInfo {
  const code = payment_response?.code?.trim() || "";
  const message = payment_response?.message?.trim() || "";

  if (code && PAGBANK_DECLINE_MAP[code]) {
    return PAGBANK_DECLINE_MAP[code];
  }

  // Fallback: respeitar a mensagem oficial e o hint "NAO TENTE NOVAMENTE".
  const doNotRetry = /NAO TENTE NOVAMENTE/i.test(message);

  return {
    titulo: "Pagamento nao autorizado",
    acao: message || "Tente outro cartao ou pague com Pix. Se persistir, fale com nosso atendimento.",
    doNotRetry,
    suggestions: doNotRetry
      ? ["TRY_OTHER_CARD", "USE_PIX", "CONTACT_SUPPORT"]
      : ["RETRY_CARD", "TRY_OTHER_CARD", "USE_PIX"],
  };
}

/**
 * Texto amigavel para cada tipo de sugestao.
 */
export const SUGGESTION_LABELS: Record<DeclineSuggestion, string> = {
  RETRY_CARD: "Tentar novamente",
  TRY_OTHER_CARD: "Tentar outro cartao",
  USE_PIX: "Pagar com Pix",
  CONTACT_BANK: "Ligar para o banco",
  WAIT: "Aguardar e tentar mais tarde",
  CONTACT_SUPPORT: "Falar com nosso atendimento",
};
