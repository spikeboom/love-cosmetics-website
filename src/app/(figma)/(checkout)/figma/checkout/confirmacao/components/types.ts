export interface PedidoStatus {
  pedidoVinculado: boolean;
  cpfCadastrado: boolean;
  cpf: string;
  cpfMascarado: string;
  nome: string;
  email: string;
  statusPagamento: string;
}

export interface ProdutoItem {
  name: string;
  quantity: number;
  preco: number;
  preco_de?: number;
  desconto_percentual?: number;
  imagem?: string;
}

export interface PedidoDetalhes {
  id: string;
  cliente: {
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string;
    cpf: string;
  };
  endereco: {
    completo: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  produtos: {
    nomes: string[];
    subtotal: number;
    items: ProdutoItem[];
  };
  entrega: {
    transportadora: string;
    servico: string;
    prazo: number;
    valor: number;
    gratis: boolean;
  };
  descontos: number;
  total: number;
  status: {
    pagamento: string;
    entrega: string;
  };
  metodoPagamento: string;
  parcelas: number | null;
  cupons: string[];
  cupom_valor: number | null;
  cupom_descricao: string | null;
  vinculado: boolean;
}

export type PageStatus = "loading" | "create_account" | "login" | "success" | "error";
