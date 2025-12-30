import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/utils/logMessage";
import type {
  PagBankOrderResponse,
  PagBankError,
} from "@/types/pagbank";
import {
  buildCardOrderRequest,
  buildCustomerFromPedido,
  buildItemsFromPedido,
  buildOrderUpdateData,
  buildPixOrderRequest,
  buildShippingFromPedido,
  buildTotalAmount,
  createPagBankOrder,
  extractChargeResponseData,
  extractPixResponseData,
  resolveNotificationUrls,
} from "@/lib/pagbank/create-order";

const logMessage = createLogger();

/**
 * Cria um pedido no PagBank usando a API Orders (Checkout Transparente)
 * Suporta pagamento com cartão de crédito e PIX
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pedidoId,
      paymentMethod, // "credit_card" ou "pix"
      encryptedCard, // apenas para cartão
      installments = 1, // número de parcelas
    } = body;

    // Buscar pedido no banco de dados
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o pedido já foi pago
    if (pedido.status_pagamento === "PAID" || pedido.status_pagamento === "AUTHORIZED") {
      logMessage("Tentativa de pagamento duplicado", {
        pedidoId,
        status_atual: pedido.status_pagamento,
      });

      return NextResponse.json(
        {
          error: "Este pedido já foi pago",
          details: "Não é possível criar um novo pagamento para um pedido já pago",
          status: pedido.status_pagamento,
        },
        { status: 400 }
      );
    }

    const customer = buildCustomerFromPedido(pedido);
    const items = buildItemsFromPedido(pedido);
    const totalAmount = buildTotalAmount(pedido);
    const shipping = buildShippingFromPedido(pedido);

    // URLs de notificação
    // Prioridade: NGROK_URL (dev local) > BASE_URL_PRODUCTION > fallback
    const { baseUrl, notificationUrls } = resolveNotificationUrls();

    logMessage("URL de notificação configurada", {
      baseUrl,
      notification_url: notificationUrls[0],
    });

    let requestBody;
    let endpoint: string;

    if (paymentMethod === "pix") {
      // ======= PAGAMENTO COM PIX =======
      requestBody = buildPixOrderRequest({
        pedidoId,
        customer,
        items,
        totalAmount,
        notificationUrls,
      });

      endpoint = "/orders";
    } else if (paymentMethod === "credit_card") {
      // ======= PAGAMENTO COM CARTÃO =======
      if (!encryptedCard) {
        return NextResponse.json(
          { error: "Cartão criptografado não fornecido" },
          { status: 400 }
        );
      }

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

      endpoint = "/orders";
    } else {
      return NextResponse.json(
        { error: "Método de pagamento inválido" },
        { status: 400 }
      );
    }

    // Fazer requisição para PagBank
    const pagBankUrl = process.env.PAGBANK_API_URL || "https://sandbox.api.pagseguro.com";
    const token = process.env.PAGBANK_TOKEN_SANDBOX;

    if (!token) {
      logMessage("Token do PagBank não configurado", { error: "PAGBANK_TOKEN_SANDBOX não encontrado" });
      return NextResponse.json(
        { error: "Configuração de pagamento inválida" },
        { status: 500 }
      );
    }

    logMessage("Enviando requisição para PagBank", {
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
      logMessage("Erro na API PagBank", {
        status: response.status,
        error: responseData,
      });

      // Atualizar status do pedido
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
        { status: response.status }
      );
    }

    const orderResponse = responseData as PagBankOrderResponse;
    logMessage("Resposta PagBank", orderResponse);

    // Atualizar pedido no banco de dados
    const updateData = buildOrderUpdateData({
      orderResponse,
      paymentMethod,
    });

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: updateData,
    });

    // Retornar resposta apropriada
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
    } else {
      const charge = extractChargeResponseData(orderResponse);
      return NextResponse.json({
        success: true,
        orderId: orderResponse.id,
        chargeId: charge.chargeId,
        paymentMethod: "credit_card",
        status: charge.status,
        message:
          charge.status === "PAID" || charge.status === "AUTHORIZED"
            ? "Pagamento aprovado!"
            : "Pagamento em análise",
      });
    }
  } catch (error) {
    logMessage("Erro ao processar pagamento", error);
    return NextResponse.json(
      {
        error: "Erro ao processar pagamento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
