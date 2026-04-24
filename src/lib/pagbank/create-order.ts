import type {
  PagBankChargeRequest,
  PagBankCustomer,
  PagBankItem,
  PagBankOrderRequest,
  PagBankOrderResponse,
  PagBankPixOrderRequest,
  PagBankShipping,
} from "@/types/pagbank";
import { logPagBankRequest, logPagBankResponse } from "./pagbank-audit-logger";

type FreightService = {
  carrier: string;
  service: string;
  price: number;
  deliveryTime: number;
  serviceCode: string;
};

function isProductionEnv() {
  return process.env.NODE_ENV === "production" || process.env.STAGE === "PRODUCTION";
}

function cents(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function positiveInt(value: unknown, fallback = 1): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

export function buildCustomerFromPedido(pedido: any): PagBankCustomer {
  const cleanedPhone = String(pedido.telefone || "").replace(/\D/g, "");
  const cleanedCPF = String(pedido.cpf || "").replace(/\D/g, "");

  return {
    name: `${pedido.nome} ${pedido.sobrenome}`.trim(),
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

/**
 * Build PagBank items in cents, ensuring deterministic sums even with coupons + quantities.
 * We also add "Frete" as an item so sum(items) matches the amount value sent to PagBank.
 */
export function buildItemsFromPedido(pedido: any): PagBankItem[] {
  const rawItems = Array.isArray(pedido.items) ? (pedido.items as any[]) : [];

  const freteCents = Math.max(0, cents(pedido.frete_calculado));
  const totalCents = Math.max(0, cents(pedido.total_pedido));
  const targetProductsCents = Math.max(0, totalCents - freteCents);

  const productLines = rawItems
    .map((item: any, index: number) => {
      const referenceId = String(item.reference_id || item.id || `item-${index + 1}`);
      const name = String(item.name || "Item");
      const quantity = positiveInt(item.quantity, 1);
      const unitCents = Math.max(1, cents(item.unit_amount ?? item.preco ?? 0));

      return { index, referenceId, name, quantity, unitCents };
    })
    .filter((l) => l.quantity > 0);

  if (productLines.length === 0) {
    const items = freteCents > 0
      ? [
          {
            reference_id: `frete-${pedido.id || "pedido"}`,
            name: "Frete",
            quantity: 1,
            unit_amount: freteCents,
          },
        ]
      : [];

    return adjustItemsSumToTotalCents(items, totalCents, pedido.id);
  }

  const subtotalCents = productLines.reduce((acc, l) => acc + l.unitCents * l.quantity, 0);

  // No coupon (or total already equals subtotal): keep original unit amounts.
  if (subtotalCents <= 0 || targetProductsCents >= subtotalCents) {
    const items: PagBankItem[] = productLines.map((l) => ({
      reference_id: l.referenceId,
      name: l.name,
      quantity: l.quantity,
      unit_amount: l.unitCents,
    }));

    if (freteCents > 0) {
      items.push({
        reference_id: `frete-${pedido.id || "pedido"}`,
        name: "Frete",
        quantity: 1,
        unit_amount: freteCents,
      });
    }

    return adjustItemsSumToTotalCents(items, totalCents, pedido.id);
  }

  const discountCents = subtotalCents - targetProductsCents;

  // Allocate discount per line using largest remainder method.
  const allocations = productLines.map((l) => {
    const lineTotalCents = l.unitCents * l.quantity;
    const numerator = lineTotalCents * discountCents;
    const floorDiscount = Math.floor(numerator / subtotalCents);
    const remainder = numerator % subtotalCents;
    return { ...l, lineTotalCents, floorDiscount, remainder };
  });

  let distributed = allocations.reduce((acc, a) => acc + a.floorDiscount, 0);
  let remaining = discountCents - distributed;

  // Distribute leftover cents to lines with highest remainder.
  allocations
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((a) => {
      if (remaining <= 0) return;
      a.floorDiscount += 1;
      remaining -= 1;
    });

  // Rebuild items preserving original order.
  allocations.sort((a, b) => a.index - b.index);

  const result: PagBankItem[] = [];

  for (const a of allocations) {
    const lineDiscount = a.floorDiscount;
    const perUnitDiscount = Math.floor(lineDiscount / a.quantity);
    const extraUnits = lineDiscount % a.quantity; // these units get +1 cent discount

    const baseUnit = Math.max(1, a.unitCents - perUnitDiscount);
    const extraUnit = Math.max(1, baseUnit - 1);

    const qtyBase = a.quantity - extraUnits;
    if (qtyBase > 0) {
      result.push({
        reference_id: a.referenceId,
        name: a.name,
        quantity: qtyBase,
        unit_amount: baseUnit,
      });
    }
    if (extraUnits > 0) {
      result.push({
        reference_id: `${a.referenceId}-d`,
        name: a.name,
        quantity: extraUnits,
        unit_amount: extraUnit,
      });
    }
  }

  // Add shipping as an item so sum(items) matches the amount sent to PagBank.
  if (freteCents > 0) {
    result.push({
      reference_id: `frete-${pedido.id || "pedido"}`,
      name: "Frete",
      quantity: 1,
      unit_amount: freteCents,
    });
  }

  return adjustItemsSumToTotalCents(result, totalCents, pedido.id);
}

export function buildTotalAmount(pedido: any) {
  return Math.round(Number(pedido.total_pedido || 0) * 100);
}

function sumItemsCents(items: PagBankItem[]) {
  return items.reduce((acc, item) => acc + item.unit_amount * item.quantity, 0);
}

function isFreteItem(item: PagBankItem) {
  return item.name === "Frete" || String(item.reference_id || "").startsWith("frete-");
}

/**
 * Best-effort fix for rare cent-level divergences (rounding/clamps).
 * PagBank items are informational but we still try to keep sum(items) == total.
 */
function adjustItemsSumToTotalCents(
  items: PagBankItem[],
  totalCents: number,
  pedidoId?: string,
): PagBankItem[] {
  const result = items.map((i) => ({ ...i }));
  const current = sumItemsCents(result);
  let diff = totalCents - current;
  if (diff === 0) return result;

  const tryAdjustAtIndex = (idx: number) => {
    const it = result[idx];
    if (!it) return false;

    if (it.quantity === 1) {
      const newAmount = it.unit_amount + diff;
      if (newAmount < 1) return false;
      it.unit_amount = newAmount;
      diff = 0;
      return true;
    }

    // Split out 1 unit so we can adjust by arbitrary cents.
    const newAmount = it.unit_amount + diff;
    if (newAmount < 1) return false;

    it.quantity -= 1;
    const ref = String(it.reference_id || "item");
    result.splice(idx + 1, 0, {
      reference_id: `${ref}-adj`,
      name: it.name,
      quantity: 1,
      unit_amount: newAmount,
    });

    diff = 0;
    return true;
  };

  const freteIndex = result.findIndex(isFreteItem);
  if (freteIndex >= 0 && tryAdjustAtIndex(freteIndex)) return result;

  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].quantity === 1 && tryAdjustAtIndex(i)) return result;
  }

  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].quantity > 1 && tryAdjustAtIndex(i)) return result;
  }

  // If we need to add cents and couldn't adjust any existing line, append an adjustment item.
  if (diff > 0) {
    result.push({
      reference_id: `ajuste-${pedidoId || "pedido"}`,
      name: "Ajuste",
      quantity: 1,
      unit_amount: diff,
    });
  }

  return result;
}

export function buildShippingFromPedido(pedido: any): PagBankShipping {
  const cleanedCEP = String(pedido.cep || "").replace(/\D/g, "");

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
  const isProd = isProductionEnv();

  // Never prioritize NGROK_URL in production.
  const baseUrl = isProd
    ? process.env.BASE_URL_PRODUCTION || "https://www.lovecosmetics.com.br"
    : process.env.NGROK_URL ||
      process.env.BASE_URL_LOCAL ||
      process.env.BASE_URL_PRODUCTION ||
      "http://localhost:3000";

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
            store: false,
          },
          holder: {
            name: customer.name,
            tax_id: customer.tax_id,
          },
        },
      },
    ],
    notification_urls: notificationUrls,
  };
}

/**
 * Build payload for /charges endpoint (legacy).
 */
export function buildCardChargeRequest({
  pedidoId,
  customer,
  totalAmount,
  encryptedCard,
  installments,
  notificationUrls,
}: {
  pedidoId: string;
  customer: PagBankCustomer;
  totalAmount: number;
  encryptedCard: string;
  installments: number;
  notificationUrls: string[];
}): PagBankChargeRequest {
  return {
    reference_id: pedidoId,
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
        store: false,
      },
      holder: {
        name: customer.name,
        tax_id: customer.tax_id,
      },
    },
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
  requestBody: PagBankOrderRequest | PagBankPixOrderRequest | PagBankChargeRequest;
}): Promise<{ ok: boolean; status: number; data: any }> {
  const url = `${pagBankUrl}${endpoint}`;
  const bodyJson = JSON.stringify(requestBody);

  const hasCharges = "charges" in requestBody && Array.isArray((requestBody as any).charges);
  const tipoPagamento = hasCharges ? "CARTAO" : endpoint === "/orders" ? "PIX" : "CARTAO";

  // [PAGBANK-AUDIT-LOG]
  logPagBankRequest({
    tipo: tipoPagamento,
    url,
    method: "POST",
    body: requestBody,
  });

  // Avoid logging full request bodies in production.
  if (!isProductionEnv()) {
    console.log(
      JSON.stringify({
        message: "PagBank Request Debug",
        url,
        tokenPrefix: token?.substring(0, 8) + "...",
        bodyLength: bodyJson.length,
      }),
    );
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: bodyJson,
  });

  const responseText = await response.text();

  if (!isProductionEnv()) {
    console.log(
      JSON.stringify({
        message: "PagBank Response Debug",
        status: response.status,
        statusText: response.statusText,
        responseLength: responseText.length,
        responseBody: responseText.substring(0, 1000),
      }),
    );
  }

  let data: any;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = { rawResponse: responseText, parseError: "Response is not valid JSON" };
  }

  // [PAGBANK-AUDIT-LOG]
  logPagBankResponse({
    tipo: tipoPagamento,
    status: response.status,
    body: data,
  });

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
    payment_method: paymentMethod === "pix" ? "pix" : "credit_card",
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

      if (charge.payment_method?.card) {
        updateData.payment_card_info = JSON.stringify({
          brand: charge.payment_method.card.brand,
          last_digits: charge.payment_method.card.last_digits,
          first_digits: charge.payment_method.card.first_digits,
        });
      }

      // Persiste o motivo da recusa para diagnostico (SAC, "Meus Pedidos", logs).
      if (charge.status === "DECLINED" && charge.payment_response) {
        updateData.pagbank_error = JSON.stringify(charge.payment_response);
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
