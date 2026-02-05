export interface Pagamento {
  id: string;
  info: any;
  status: string;
}

export interface Item {
  name: string;
  quantity: number;
  image_url: string;
  imagem?: string;
  unit_amount: number;
  reference_id: string;
  // Campos de apresentação (salvos no momento do pedido)
  preco?: number;
  preco_de?: number;
  desconto_percentual?: number;
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
  subtotal_produtos?: number | null;
  descontos?: number | null;
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
