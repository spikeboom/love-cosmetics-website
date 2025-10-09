import { createLogger } from "@/utils/logMessage";
import { makeAuthenticatedRequest } from "./simple-auth";

const logMessage = createLogger();

const BLING_API_BASE_URL = "https://api.bling.com.br/Api/v3";

// Interface para dados de tributação do produto
interface TributacaoProduto {
  origem?: number;
  ncm?: string;
  cest?: string;
}

// Interface para resposta do produto do Bling
interface BlingProdutoResponse {
  data?: {
    tributacao?: TributacaoProduto;
  };
}

// Interface para item do pedido
interface OrderItem {
  id: number | string;
  name: string;
  quantity: number;
  value: number;
  discount?: number;
  reference_id?: string | number;
  unit_amount?: number;
  preco?: number;
  bling_number?: number;
}

// Interface para dados do pedido
interface OrderData {
  id: string;
  items: OrderItem[];
  additionalInfo?: string;
  // Dados do cliente do formulário
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
}

// Interface para resposta da API do Bling
interface BlingNFResponse {
  data?: {
    id: number;
    numero: number;
    serie: number;
  };
  errors?: Array<{
    message: string;
    code: string;
  }>;
}

// Busca dados fiscais do produto no Bling
async function getProdutoTributacao(produtoId: number): Promise<TributacaoProduto> {
  try {
    const response = await makeAuthenticatedRequest(
      `${BLING_API_BASE_URL}/produtos/${produtoId}`
    );

    if (!response.ok) {
      logMessage("Erro ao buscar dados do produto", {
        produtoId,
        status: response.status
      });
      return {};
    }

    const data: BlingProdutoResponse = await response.json();
    return data.data?.tributacao || {};
  } catch (error) {
    logMessage("Erro ao buscar tributação do produto", {
      produtoId,
      error
    });
    return {};
  }
}

// Cria uma nota fiscal no Bling
export async function createInvoice(
  accessToken: string,
  orderData: OrderData
): Promise<BlingNFResponse> {
  try {
    // Busca dados fiscais de todos os produtos em paralelo
    const produtosComTributacao = await Promise.all(
      orderData.items.map(async (item) => {
        if (!item.bling_number) {
          throw new Error(`Produto ${item.name} não possui bling_number`);
        }
        const tributacao = await getProdutoTributacao(Number(item.bling_number));
        return { item, tributacao };
      })
    );

    // Monta os itens da nota fiscal
    const items = produtosComTributacao.map(({ item, tributacao }) => {
      const unitValue = (item.unit_amount ? item.unit_amount / 100 : item.preco) || item.value;

      const itemNF: any = {
        codigo: String(item.bling_number),
        descricao: item.name,
        unidade: "UN",
        quantidade: item.quantity,
        valor: unitValue,
        tipo: "P", // P = Produto
      };

      // Adiciona dados fiscais se disponíveis
      if (tributacao.origem !== undefined) {
        itemNF.origem = tributacao.origem;
      }
      if (tributacao.ncm) {
        itemNF.classificacaoFiscal = tributacao.ncm;
      }
      if (tributacao.cest) {
        itemNF.cest = tributacao.cest;
      }

      // Adiciona desconto se houver
      if (item.discount && item.discount > 0) {
        itemNF.desconto = item.discount;
      }

      return itemNF;
    });


    // Monta o corpo da requisição
    const invoiceData = {
      tipo: 1, // Nota fiscal de saída
      numero: orderData.id, // Campo obrigatório - usando ID do pedido
      dataOperacao: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0], // Data e hora atual
      numeroPedidoLoja: `LV-${orderData.id}`,
      contato: {
        nome: `${orderData.nome} ${orderData.sobrenome}`,
        tipoPessoa: "F", // Pessoa Física
        numeroDocumento: orderData.cpf.replace(/\D/g, ""), // CPF sem pontuação
        email: orderData.email,
        telefone: orderData.telefone,
        contribuinte: 9, // Não contribuinte
        endereco: {
          endereco: orderData.endereco,
          numero: orderData.numero,
          ...(orderData.complemento ? { complemento: orderData.complemento } : {}),
          bairro: orderData.bairro,
          cep: orderData.cep.replace(/\D/g, ""), // CEP sem pontuação
          municipio: orderData.cidade,
          uf: orderData.estado
        }
      },
      naturezaOperacao: { id: 15106222870 }, // ID fornecido no exemplo
      presenca: 2, // Venda pela internet
      consumidorFinal: true,
      informacoesComplementares: orderData.additionalInfo || `Venda pela Internet. Pedido LV-${orderData.id}`,
      itens: items,
      transporte: {
        modalidadeFrete: "1", // Frete por conta do destinatário
        volumes: [{ quantidade: 1 }]
      }
    };

    logMessage("Dados da NF para envio ao Bling", {
      orderId: orderData.id,
      itemsCount: items.length,
      invoiceData
    });

    // Faz a requisição para criar a nota fiscal
    const response = await makeAuthenticatedRequest(`${BLING_API_BASE_URL}/nfe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      logMessage("Erro ao criar nota fiscal no Bling", {
        status: response.status,
        response: responseData,
        orderId: orderData.id
      });
      throw new Error(`Erro ao criar nota fiscal: ${response.status}`);
    }

    logMessage("Nota fiscal criada com sucesso", {
      orderId: orderData.id,
      nfId: responseData.data?.id,
      nfNumero: responseData.data?.numero
    });

    return responseData;
  } catch (error) {
    logMessage("Erro na criação da nota fiscal", {
      orderId: orderData.id,
      error
    });
    throw error;
  }
}

// Consulta uma nota fiscal no Bling
export async function getInvoice(
  accessToken: string,
  invoiceId: number
): Promise<BlingNFResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${BLING_API_BASE_URL}/nfe/${invoiceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      logMessage("Erro ao consultar nota fiscal", {
        invoiceId,
        status: response.status,
        error: errorData
      });
      throw new Error(`Erro ao consultar nota fiscal: ${response.status}`);
    }

    const invoiceData = await response.json();
    logMessage("Nota fiscal consultada com sucesso", {
      invoiceId,
      numero: invoiceData.data?.numero
    });

    return invoiceData;
  } catch (error) {
    logMessage("Erro na consulta da nota fiscal", {
      invoiceId,
      error
    });
    throw error;
  }
}