export type FormaPagamento = "pix" | "cartao";
export type Parcelas = 1 | 2 | 3;
export type TelaAtual = "selecao" | "pix" | "cartao";

export interface CheckoutData {
  identificacao: {
    cpf: string;
    dataNascimento: string;
    nome: string;
    email: string;
    telefone: string;
  } | null;
  entrega: {
    cep: string;
    rua: string;
    numero: string;
    semNumero: boolean;
    complemento: string;
    informacoesAdicionais: string;
    tipoEntrega: "normal" | "expressa";
  } | null;
}

export interface CartaoData {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
  parcelas: Parcelas;
}

export interface ResumoProps {
  cartArray: any[];
  subtotal: number;
  freteGratis: boolean;
  valorFrete: number;
  descontos: number;
  cupons?: any[];
  valorTotal: number;
  enderecoCompleto: string;
  formatPrice: (price: number) => string;
  onAlterarProdutos: () => void;
  onAlterarEntrega: () => void;
}
