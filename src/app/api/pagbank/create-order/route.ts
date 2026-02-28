import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/utils/logMessage";
import type { PagBankOrderResponse, PagBankError } from "@/types/pagbank";
import {
  buildCardOrderRequest,
  buildCustomerFromPedido,
  buildItemsFromPedido,
  buildOrderUpdateData,
  buildPixOrderRequest,
  buildShippingFromPedido,
  buildTotalAmount,
  createPagBankOrder,
  extractPixResponseData,
  resolveNotificationUrls,
} from "@/lib/pagbank/create-order";
import { getPagBankApiUrl, getPagBankToken } from "@/utils/pagbank-config";

const logMessage = createLogger();

const CREATING_STATUS = "CREATING_PAYMENT";
const FAILURE_STATUSES = new Set(["DECLINED", "CANCELED", "PAYMENT_FAILED"]);

function isPaidStatus(status: unknown) {
  return status === "PAID" || status === "AUTHORIZED";
}

function isFailureStatus(status: unknown) {
  return typeof status === "string" && FAILURE_STATUSES.has(status);
}

function parseDateSafe(value: unknown): Date | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

function paymentMethodToDb(paymentMethod: string) {
  return paymentMethod === "pix" ? "pix" : "credit_card";
}

function paymentMethodLabel(paymentMethod: string) {
  return paymentMethod === "pix" ? "pix" : "credit_card";
}

async function getPedidoOr404(pedidoId: string) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
  });
  return pedido;
}

async function returnExistingPayment(pedido: any, paymentMethod: "pix" | "credit_card") {
  if (paymentMethod === "pix") {
    return NextResponse.json({
      success: true,
      orderId: pedido.pagbank_order_id,
      paymentMethod: "pix",
      qrCode: {
        text: pedido.pix_qr_code || "",
        imageUrl: pedido.pix_qr_code_url || "",
        expirationDate: pedido.pix_expiration || "",
      },
      reused: true,
    });
  }

  return NextResponse.json({
    success: true,
    orderId: pedido.pagbank_order_id,
    chargeId: pedido.pagbank_charge_id || null,
    paymentMethod: "credit_card",
    status: pedido.status_pagamento || null,
    reused: true,
  });
}

/**
 * Create a PagBank order (API Orders) for an existing Pedido.
 * Supports PIX and credit card.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const pedidoId = String(body?.pedidoId || "");
    const paymentMethodRaw = body?.paymentMethod;
    const encryptedCard = body?.encryptedCard;
    const installments = Number(body?.installments ?? 1);

    if (!pedidoId) {
      return NextResponse.json({ error: "pedidoId e obrigatorio" }, { status: 400 });
    }

    if (paymentMethodRaw !== "pix" && paymentMethodRaw !== "credit_card") {
      return NextResponse.json({ error: "Metodo de pagamento invalido" }, { status: 400 });
    }

    const paymentMethod = paymentMethodRaw as "pix" | "credit_card";
    const paymentMethodDb = paymentMethodToDb(paymentMethod);

    if (paymentMethod === "credit_card" && !encryptedCard) {
      return NextResponse.json({ error: "Cartao criptografado nao fornecido" }, { status: 400 });
    }

    // Fetch current pedido state.
    const pedido = await getPedidoOr404(pedidoId);
    if (!pedido) {
      return NextResponse.json({ error: "Pedido nao encontrado" }, { status: 404 });
    }

    const pixExpiration = paymentMethod === "pix" ? parseDateSafe(pedido.pix_expiration) : null;
    const pixExpired =
      paymentMethod === "pix" && pixExpiration ? pixExpiration.getTime() <= Date.now() : false;

    // Block if already paid.
    if (isPaidStatus(pedido.status_pagamento)) {
      logMessage("Duplicate payment attempt (already paid)", {
        pedidoId,
        status_atual: pedido.status_pagamento,
      });

      return NextResponse.json(
        {
          error: "Este pedido ja foi pago",
          status: pedido.status_pagamento,
          code: "ORDER_ALREADY_PAID",
        },
        { status: 400 },
      );
    }

    // Prevent creating two different payment methods for the same pedido.
    if (pedido.payment_method && pedido.payment_method !== paymentMethodDb && !isFailureStatus(pedido.status_pagamento)) {
      return NextResponse.json(
        {
          error: "Pagamento ja iniciado com outro metodo",
          code: "PAYMENT_METHOD_LOCKED",
          payment_method: pedido.payment_method,
        },
        { status: 400 },
      );
    }

    // If a PagBank order already exists (and is not explicitly failed), do not create another.
    if (pedido.pagbank_order_id && !isFailureStatus(pedido.status_pagamento) && !pixExpired) {
      return returnExistingPayment(pedido, paymentMethod);
    }

    // If another request is creating the payment, ask client to retry shortly.
    if (pedido.status_pagamento === CREATING_STATUS) {
      return NextResponse.json(
        { error: "Pagamento em processamento. Tente novamente em alguns segundos." },
        { status: 409 },
      );
    }

    if (pixExpired) {
      logMessage("PIX expired - recreating PagBank order", {
        pedidoId,
        pix_expiration: pedido.pix_expiration,
      });
    }

    // Acquire lock: only one request can transition to CREATING and proceed.
    // Allowed states: no payment created yet (status null) OR terminal failure (allow retry).
    const allowedStatuses: Array<string | null> = [null, "DECLINED", "CANCELED", "PAYMENT_FAILED"];
    if (paymentMethod === "pix" && pixExpired) {
      allowedStatuses.push("AWAITING_PAYMENT");
    }

    const lock = await prisma.pedido.updateMany({
      where: {
        id: pedidoId,
        status_pagamento: {
          in: allowedStatuses as string[],
        },
      },
      data: {
        status_pagamento: CREATING_STATUS,
        payment_method: paymentMethodLabel(paymentMethod),
        // Reset previous payment data on retry, since we store only one PagBank order per Pedido.
        pagbank_order_id: null,
        pagbank_charge_id: null,
        pix_qr_code: null,
        pix_qr_code_url: null,
        pix_expiration: null,
        payment_card_info: null,
        pagbank_error: null,
      },
    });

    if (lock.count === 0) {
      const latest = await getPedidoOr404(pedidoId);
      if (latest?.pagbank_order_id) {
        return returnExistingPayment(latest, paymentMethod);
      }
      if (latest?.status_pagamento === CREATING_STATUS) {
        return NextResponse.json(
          { error: "Pagamento em processamento. Tente novamente em alguns segundos." },
          { status: 409 },
        );
      }

      return NextResponse.json({ error: "Nao foi possivel iniciar o pagamento" }, { status: 409 });
    }

    // Re-fetch pedido after lock.
    const pedidoLocked = await getPedidoOr404(pedidoId);
    if (!pedidoLocked) {
      return NextResponse.json({ error: "Pedido nao encontrado" }, { status: 404 });
    }

    const customer = buildCustomerFromPedido(pedidoLocked);
    const items = buildItemsFromPedido(pedidoLocked);
    const totalAmount = buildTotalAmount(pedidoLocked);

    // Notification URLs
    const { baseUrl, notificationUrls } = resolveNotificationUrls();
    logMessage("PagBank notification URL configured", {
      baseUrl,
      notification_url: notificationUrls[0],
    });

    let requestBody: any;
    const endpoint = "/orders";

    if (paymentMethod === "pix") {
      requestBody = buildPixOrderRequest({
        pedidoId,
        customer,
        items,
        totalAmount,
        notificationUrls,
      });
    } else {
      const shipping = buildShippingFromPedido(pedidoLocked);

      requestBody = buildCardOrderRequest({
        pedidoId,
        customer,
        items,
        shipping,
        totalAmount,
        encryptedCard,
        installments,
        notificationUrls,
      });
    }

    let pagBankUrl: string;
    try {
      pagBankUrl = getPagBankApiUrl();
    } catch (err) {
      logMessage("PagBank API URL not configured", { error: String(err) });
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status_pagamento: "PAYMENT_FAILED" },
      });
      return NextResponse.json({ error: "Configuracao de pagamento invalida" }, { status: 500 });
    }

    const token = getPagBankToken();
    if (!token) {
      logMessage("PagBank token not configured", {});
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status_pagamento: "PAYMENT_FAILED" },
      });
      return NextResponse.json({ error: "Configuracao de pagamento invalida" }, { status: 500 });
    }

    logMessage("Sending request to PagBank", {
      endpoint,
      paymentMethod,
      pedidoId,
    });

    const response = await createPagBankOrder({
      pagBankUrl,
      endpoint,
      token,
      requestBody,
    });

    const responseData: PagBankOrderResponse | PagBankError = response.data;

    if (!response.ok) {
      logMessage("PagBank API error", {
        status: response.status,
        error: responseData,
      });

      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          status_pagamento: "PAYMENT_FAILED",
          pagbank_error: JSON.stringify(responseData),
        },
      });

      return NextResponse.json(
        {
          error: "Erro ao processar pagamento",
          details: responseData,
        },
        { status: response.status },
      );
    }

    const orderResponse = responseData as PagBankOrderResponse;

    const updateData = buildOrderUpdateData({
      orderResponse,
      paymentMethod: paymentMethodLabel(paymentMethod),
    });

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: updateData,
    });

    if (paymentMethod === "pix") {
      const qrCode = extractPixResponseData(orderResponse);
      return NextResponse.json({
        success: true,
        orderId: orderResponse.id,
        paymentMethod: "pix",
        qrCode: {
          text: qrCode.text,
          imageUrl: qrCode.imageUrl,
          expirationDate: qrCode.expirationDate,
        },
      });
    }

    const charge = orderResponse.charges?.[0];
    return NextResponse.json({
      success: true,
      orderId: orderResponse.id,
      chargeId: charge?.id,
      paymentMethod: "credit_card",
      status: charge?.status,
      message:
        charge?.status === "PAID" || charge?.status === "AUTHORIZED"
          ? "Pagamento aprovado!"
          : "Pagamento em analise",
    });
  } catch (error) {
    const errorDetails =
      error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error;
    logMessage("Unexpected error while creating PagBank order", errorDetails);
    return NextResponse.json(
      {
        error: "Erro ao processar pagamento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
