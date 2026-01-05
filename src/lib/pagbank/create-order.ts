import type {
  PagBankOrderRequest,
  PagBankOrderResponse,
  PagBankPixOrderRequest,
  PagBankCustomer,
  PagBankItem,
  PagBankShipping,
} from "@/types/pagbank";

export function buildCustomerFromPedido(pedido: any) {
  const cleanedPhone = pedido.telefone.replace(/\D/g, "");
  const cleanedCPF = pedido.cpf.replace(/\D/g, "");

  return {
    name: `${pedido.nome} ${pedido.sobrenome}`,
    email: pedido.email,
    tax_id: cleanedCPF,
    phones: [
      {
        country: "55",
        area: cleanedPhone.substring(0, 2),
        number: cleanedPhone.substring(2),
        type: "MOBILE" as const,
      },
    ],
  };
}

export function buildItemsFromPedido(pedido: any) {
  return (pedido.items as any[]).map((item: any) => ({
    reference_id: item.reference_id || item.id,
    name: item.name,
    quantity: item.quantity,
    unit_amount: Math.round(item.unit_amount * 100),
  }));
}

export function buildTotalAmount(pedido: any) {
  return Math.round((pedido.total_pedido + (pedido.frete_calculado || 0)) * 100);
}

export function buildShippingFromPedido(pedido: any) {
  const cleanedCEP = pedido.cep.replace(/\D/g, "");

  return {
    address: {
      street: pedido.endereco,
      number: pedido.numero,
      complement: pedido.complemento || undefined,
      locality: pedido.bairro,
      city: pedido.cidade,
      region_code: pedido.estado,
      country: "BRA" as const,
      postal_code: cleanedCEP,
    },
  };
}

export function resolveNotificationUrls() {
  const baseUrl =
    process.env.NGROK_URL ||
    process.env.BASE_URL_PRODUCTION ||
    "https://www.lovecosmetics.com.br";

  return {
    baseUrl,
    notificationUrls: [`${baseUrl}/api/pagbank/webhook`],
  };
}

export function buildPixOrderRequest({
  pedidoId,
  customer,
  items,
  totalAmount,
  notificationUrls,
}: {
  pedidoId: string;
  customer: PagBankCustomer;
  items: PagBankItem[];
  totalAmount: number;
  notificationUrls: string[];
}): PagBankPixOrderRequest {
  return {
    reference_id: pedidoId,
    customer,
    items,
    qr_codes: [
      {
        amount: {
          value: Math.round(totalAmount),
          currency: "BRL",
        },
        expiration_date: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    ],
    notification_urls: notificationUrls,
  };
}

export function buildCardOrderRequest({
  pedidoId,
  customer,
  items,
  shipping,
  totalAmount,
  encryptedCard,
  installments,
  notificationUrls,
}: {
  pedidoId: string;
  customer: PagBankCustomer;
  items: PagBankItem[];
  shipping: PagBankShipping;
  totalAmount: number;
  encryptedCard: string;
  installments: number;
  notificationUrls: string[];
}): PagBankOrderRequest {
  return {
    reference_id: pedidoId,
    customer,
    items,
    shipping,
    charges: [
      {
        reference_id: `charge-${pedidoId}`,
        description: `Pedido Love Cosmetics #${pedidoId}`,
        amount: {
          value: Math.round(totalAmount),
          currency: "BRL",
        },
        payment_method: {
          type: "CREDIT_CARD",
          installments,
          capture: true,
          card: {
            encrypted: encryptedCard,
          },
        },
      },
    ],
    notification_urls: notificationUrls,
  };
}

export async function createPagBankOrder({
  pagBankUrl,
  endpoint,
  token,
  requestBody,
}: {
  pagBankUrl: string;
  endpoint: string;
  token: string;
  requestBody: PagBankOrderRequest | PagBankPixOrderRequest;
}): Promise<{ ok: boolean; status: number; data: any }> {
  const response = await fetch(`${pagBankUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export function buildOrderUpdateData({
  orderResponse,
  paymentMethod,
}: {
  orderResponse: PagBankOrderResponse;
  paymentMethod: string;
}) {
  const updateData: any = {
    pagbank_order_id: orderResponse.id,
  };

  if (paymentMethod === "pix") {
    const qrCode = orderResponse.qr_codes?.[0];
    if (qrCode) {
      updateData.pix_qr_code = qrCode.text;
      updateData.pix_qr_code_url = qrCode.links.find((l) => l.rel === "QRCODE.PNG")?.href;
      updateData.pix_expiration = qrCode.expiration_date;
      updateData.status_pagamento = "AWAITING_PAYMENT";
    }
  } else {
    const charge = orderResponse.charges?.[0];
    if (charge) {
      updateData.pagbank_charge_id = charge.id;
      updateData.status_pagamento = charge.status;

      if (charge.payment_method.card) {
        updateData.payment_card_info = JSON.stringify({
          brand: charge.payment_method.card.brand,
          last_digits: charge.payment_method.card.last_digits,
          first_digits: charge.payment_method.card.first_digits,
        });
      }
    }
  }

  return updateData;
}

export function extractPixResponseData(orderResponse: PagBankOrderResponse) {
  const qrCode = orderResponse.qr_codes?.[0];
  return {
    text: qrCode?.text,
    imageUrl: qrCode?.links.find((l) => l.rel === "QRCODE.PNG")?.href,
    expirationDate: qrCode?.expiration_date,
  };
}

export function extractChargeResponseData(orderResponse: PagBankOrderResponse) {
  const charge = orderResponse.charges?.[0];
  return {
    chargeId: charge?.id,
    status: charge?.status,
  };
}
