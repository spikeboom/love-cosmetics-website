import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/utils/logMessage";
import type { PagBankWebhookNotification } from "@/types/pagbank";
import { buildGtmPurchasePayload, sendGtmPurchaseEvent } from "@/lib/pagbank/gtm";
import { fetchPagBankOrder } from "@/lib/pagbank/orders";
import { validateWebhookSignature } from "@/lib/pagbank/signature";

const logMessage = createLogger();

/**
 * Webhook para receber notificacoes do PagBank sobre mudancas no status do pagamento
 * Documentacao: https://dev.pagbank.uol.com.br/reference/notificacoes
 */
export async function POST(req: NextRequest) {
  try {
    // Ler body como texto raw (necessario para validacao HMAC)
    const rawBody = await req.text();

    // Validar assinatura HMAC do PagBank
    const signatureHeader = req.headers.get("x-authenticity-token");
    const validation = await validateWebhookSignature({
      rawBody,
      signatureHeader,
      logMessage,
    });

    if (!validation.valid) {
      logMessage("Webhook rejeitado - assinatura invalida", {
        reason: validation.reason,
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      });
      return NextResponse.json(
        { error: "Unauthorized", reason: validation.reason },
        { status: 401 }
      );
    }

    // Parsear JSON apos validacao
    const body: PagBankWebhookNotification = JSON.parse(rawBody);

    logMessage("Webhook PagBank recebido (assinatura valida)", {
      id: body.id,
      reference_id: body.reference_id,
      charges: body.charges,
    });

    // Verificar se o pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id: body.reference_id },
      select: {
        id: true,
        status_pagamento: true,
        ga_session_id: true,
        ga_session_number: true,
      },
    });

    if (!pedido) {
      logMessage("Pedido nao encontrado no webhook", {
        reference_id: body.reference_id,
      });
      return NextResponse.json(
        { error: "Pedido nao encontrado" },
        { status: 404 }
      );
    }

    // Atualizar status do pedido baseado na cobranca
    // Webhook de /charges: dados direto no body (body.status, body.paid_at)
    // Webhook de /orders: dados em body.charges[0]
    const charge = body.charges?.[0];
    const isChargeWebhook = !charge && (body as any).status;

    // Determinar status e paid_at baseado no tipo de webhook
    const chargeStatus = charge?.status || (body as any).status;
    const chargePaidAt = charge?.paid_at || (body as any).paid_at;

    if (chargeStatus) {
      const updateData: any = {
        status_pagamento: chargeStatus,
      };

      logMessage("Atualizando status do pedido", {
        pedidoId: pedido.id,
        oldStatus: pedido.status_pagamento,
        newStatus: chargeStatus,
        paid_at: chargePaidAt,
        webhookType: isChargeWebhook ? "/charges" : "/orders",
      });

      await prisma.pedido.update({
        where: { id: body.reference_id },
        data: updateData,
      });

      logMessage("Status do pedido atualizado com sucesso", {
        pedidoId: pedido.id,
        status: chargeStatus,
      });

      // Se o pagamento foi confirmado (PAID), enviar evento para GTM
      if (chargeStatus === "PAID") {
        // Para /charges, criar objeto charge compatível com GTM
        const chargeForGtm = charge || {
          id: body.id,
          status: (body as any).status,
          paid_at: (body as any).paid_at,
          amount: (body as any).amount,
        };

        const gtmPayload = await buildGtmPurchasePayload({
          body,
          charge: chargeForGtm,
          pedido,
        });

        await sendGtmPurchaseEvent(gtmPayload, logMessage);
      }

      // TODO: Enviar email para cliente conforme status
      // - PAID: Pagamento confirmado
      // - DECLINED: Pagamento recusado
      // - CANCELED: Pagamento cancelado
      // - IN_ANALYSIS: Pagamento em analise

      // TODO: Se for PIX e foi pago, pode gerar nota fiscal automaticamente
    }

    // Armazenar notificacao para auditoria
    await prisma.statusPagamento.create({
      data: {
        info: body as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
    });
  } catch (error) {
    logMessage("Erro ao processar webhook PagBank", error);

    // Mesmo com erro, retornar 200 para PagBank nao reenviar
    // (salvar em log para investigacao posterior)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 }
    );
  }
}

/**
 * GET para buscar status de um pedido especifico no PagBank
 * Util para verificar status manualmente
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId e obrigatorio" },
        { status: 400 }
      );
    }

    const pagBankUrl = process.env.PAGBANK_API_URL || "https://sandbox.api.pagseguro.com";
    const token = process.env.PAGBANK_TOKEN_SANDBOX;

    if (!token) {
      return NextResponse.json(
        { error: "Token do PagBank nao configurado" },
        { status: 500 }
      );
    }

    const orderResult = await fetchPagBankOrder({
      pagBankUrl,
      token,
      orderId,
      logMessage,
    });

    if (!orderResult.ok) {
      return NextResponse.json(orderResult.data, { status: orderResult.status });
    }

    return NextResponse.json({
      success: true,
      order: orderResult.data,
    });
  } catch (error) {
    logMessage("Erro ao consultar status do pedido", error);
    return NextResponse.json(
      {
        error: "Erro ao consultar status do pedido",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
