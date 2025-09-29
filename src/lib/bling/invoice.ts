import { createLogger } from "@/utils/logMessage";
import { mapProductToBling } from "./product-mapping";

const logMessage = createLogger();

const BLING_API_BASE_URL = "https://api.bling.com.br/Api/v3";

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
}

// Interface para dados do pedido
interface OrderData {
  id: string;
  items: OrderItem[];
  additionalInfo?: string;
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

// Cria uma nota fiscal no Bling
export async function createInvoice(
  accessToken: string,
  orderData: OrderData
): Promise<BlingNFResponse> {
  try {
    // Monta os itens da nota fiscal
    const items = orderData.items.map(item => {
      // O item vem com structure diferente do esperado
      const productId = item.reference_id || item.id;
      const unitValue = (item.unit_amount ? item.unit_amount / 100 : item.preco) || item.value;

      const blingProduct = mapProductToBling(productId);

      return {
        codigo: blingProduct.codigo, // Campo obrigatório como string
        quantidade: item.quantity,
        valor: unitValue,
        ...(item.discount && item.discount > 0 ? { desconto: item.discount } : {})
      };
    });


    // Monta o corpo da requisição
    const invoiceData = {
      tipo: 1, // Nota fiscal de saída
      serie: 1,
      dataOperacao: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0], // Data e hora atual
      numeroPedidoLoja: `LV-${orderData.id}`,
      contato: {
        nome: "Roberto de Almeida Cruz Neto",
        tipoPessoa: "F", // Pessoa Física
        numeroDocumento: "01055044248", // CPF sem pontuação
        contribuinte: 9, // Não contribuinte
        endereco: {
          endereco: "Rua Professor Lázaro Gonçalves",
          numero: "SN",
          complemento: "Bloco J, apto 201",
          bairro: "Japiim",
          cep: "69.077-747",
          municipio: "Manaus",
          uf: "AM"
        }
      },
      naturezaOperacao: { id: 15106222880 }, // ID fornecido no exemplo
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
    const response = await fetch(`${BLING_API_BASE_URL}/nfe`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
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
    const response = await fetch(`${BLING_API_BASE_URL}/nfe/${invoiceId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
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