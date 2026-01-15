export interface Pagamento {
  id: string;
  info: any;
  status: string;
}

export interface Item {
  name: string;
  quantity: number;
  image_url: string;
  unit_amount: number;
  reference_id: string;
}

export interface Pedido {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  pais: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  total_pedido: number;
  frete_calculado: number;
  transportadora_nome?: string | null;
  transportadora_servico?: string | null;
  transportadora_prazo?: number | null;
  items: Item[];
  salvar_minhas_informacoes: boolean;
  aceito_receber_whatsapp: boolean;
  destinatario?: string | null;
  createdAt: string;
  pagamentos?: Pagamento[] | null;
  cupons: any[];
  notaFiscalGerada?: boolean;
  notaFiscalId?: string | null;
  notaFiscalErro?: string | null;
  status_entrega: string;
  status_pagamento?: string | null;
}
