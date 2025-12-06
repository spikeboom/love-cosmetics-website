/**
 * Função para criar link de pagamento no PagBank (API de Checkouts)
 *
 * Esta função encapsula a lógica de geração de link de pagamento
 * que redireciona o cliente para a página do PagBank.
 *
 * Usada para pedidos criados pelo admin que precisam de link externo.
 */

import { getBaseURL } from "@/utils/getBaseUrl";

// Tipos
interface CustomerPhone {
  country: string;
  area: string;
  number: string;
}

interface Customer {
  name: string;
  email: string;
  tax_id: string; // CPF sem formatação
  phone: CustomerPhone;
}

interface Item {
  reference_id: string;
  name: string;
  quantity: number;
  unit_amount: number; // Em centavos
}

interface CreateCheckoutLinkParams {
  pedidoId: string;
  items: Item[];
  customer: Customer;
  frete: number; // Em reais
  descontos?: number; // Em centavos
}

interface CreateCheckoutLinkResult {
  success: boolean;
  link?: string;
  error?: string;
  details?: unknown;
}

/**
 * Cria um link de pagamento no PagBank usando a API de Checkouts
 *
 * @param params - Parâmetros para criar o checkout
 * @returns Objeto com success, link ou error
 */
export async function createPagBankCheckoutLink(
  params: CreateCheckoutLinkParams
): Promise<CreateCheckoutLinkResult> {
  const { pedidoId, items, customer, frete, descontos = 0 } = params;

  try {
    const baseURL = getBaseURL({ STAGE: "PRODUCTION" });

    // Payload para API de Checkouts do PagSeguro
    const bodyCheckoutPagSeguro = {
      customer: {
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
        tax_id: customer.tax_id,
      },
      // Desconto em centavos (se houver)
      ...(descontos > 0 ? { discount_amount: descontos } : {}),
      // Frete em centavos
      additional_amount: Math.trunc(frete * 100),
      // Referência do pedido
      reference_id: pedidoId,
      // Permitir cliente modificar dados
      customer_modifiable: true,
      // Items do pedido
      items: items.map(item => ({
        reference_id: item.reference_id,
        name: item.name,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
      })),
      // URLs de callback
      redirect_url: `${baseURL}/confirmacao`,
      notification_urls: [
        `${baseURL}/api/checkout_notification`,
      ],
      payment_notification_urls: [
        `${baseURL}/api/payment_notification`,
      ],
    };

    console.log("[PagBank Checkout] Criando link para pedido:", pedidoId);
    console.log("[PagBank Checkout] Payload:", JSON.stringify(bodyCheckoutPagSeguro, null, 2));

    // Chamada para API de Checkouts do PagSeguro
    const response = await fetch("https://api.pagseguro.com/checkouts", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${process.env.PAGSEGURO_TOKEN_DEV}`,
        accept: "*/*",
      },
      body: JSON.stringify(bodyCheckoutPagSeguro),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[PagBank Checkout] Erro na API:", responseData);
      return {
        success: false,
        error: "Erro ao criar link de pagamento no PagBank",
        details: responseData,
      };
    }

    // Extrair link de pagamento (rel=PAY)
    const payLink = responseData.links?.find(
      (link: { rel: string; href: string }) => link.rel === "PAY"
    )?.href;

    if (!payLink) {
      console.error("[PagBank Checkout] Link PAY não encontrado:", responseData);
      return {
        success: false,
        error: "Link de pagamento não retornado pelo PagBank",
        details: responseData,
      };
    }

    console.log("[PagBank Checkout] Link gerado com sucesso:", payLink);

    return {
      success: true,
      link: payLink,
    };

  } catch (error) {
    console.error("[PagBank Checkout] Erro ao criar link:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar link",
    };
  }
}

/**
 * Helper para formatar dados do cliente para o checkout
 */
export function formatCustomerForCheckout(data: {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  telefone: string;
}): Customer {
  const cleanedPhone = data.telefone.replace(/\D/g, "");
  const cleanedCPF = data.cpf.replace(/\D/g, "");

  return {
    name: `${data.nome} ${data.sobrenome}`,
    email: data.email,
    tax_id: cleanedCPF,
    phone: {
      country: "+55",
      area: cleanedPhone.substring(0, 2),
      number: cleanedPhone.substring(2),
    },
  };
}

/**
 * Helper para formatar items para o checkout
 */
export function formatItemsForCheckout(items: Array<{
  id: string;
  nome: string;
  preco: number;
  quantity: number;
}>): Item[] {
  return items.map(item => ({
    reference_id: item.id,
    name: item.nome,
    quantity: item.quantity,
    unit_amount: Math.round(item.preco * 100), // Converter para centavos
  }));
}
