import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/utils/logMessage";
import type { PagBankWebhookNotification } from "@/types/pagbank";

const logMessage = createLogger();

/**
 * Webhook para receber notificações do PagBank sobre mudanças no status do pagamento
 * Documentação: https://dev.pagbank.uol.com.br/reference/notificacoes
 */
export async function POST(req: NextRequest) {
  try {
    const body: PagBankWebhookNotification = await req.json();

    logMessage("Webhook PagBank recebido", {
      id: body.id,
      reference_id: body.reference_id,
      charges: body.charges,
    });

    // Verificar se o pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id: body.reference_id },
    });

    if (!pedido) {
      logMessage("Pedido não encontrado no webhook", {
        reference_id: body.reference_id,
      });
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar status do pedido baseado na cobrança
    const charge = body.charges?.[0];

    if (charge) {
      const updateData: any = {
        status_pagamento: charge.status,
      };

      // Se o pagamento foi confirmado, registrar a data
      if (charge.paid_at) {
        updateData.updatedAt = new Date(charge.paid_at);
      }

      logMessage("Atualizando status do pedido", {
        pedidoId: pedido.id,
        oldStatus: pedido.status_pagamento,
        newStatus: charge.status,
      });

      await prisma.pedido.update({
        where: { id: body.reference_id },
        data: updateData,
      });

      // TODO: Enviar email para cliente conforme status
      // - PAID: Pagamento confirmado
      // - DECLINED: Pagamento recusado
      // - CANCELED: Pagamento cancelado
      // - IN_ANALYSIS: Pagamento em análise

      // TODO: Se for PIX e foi pago, pode gerar nota fiscal automaticamente

      logMessage("Status do pedido atualizado com sucesso", {
        pedidoId: pedido.id,
        status: charge.status,
      });
    }

    // Armazenar notificação para auditoria
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

    // Mesmo com erro, retornar 200 para PagBank não reenviar
    // (salvar em log para investigação posterior)
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
 * GET para buscar status de um pedido específico no PagBank
 * Útil para verificar status manualmente
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId é obrigatório" },
        { status: 400 }
      );
    }

    const pagBankUrl = process.env.PAGBANK_API_URL || "https://sandbox.api.pagseguro.com";
    const token = process.env.PAGBANK_TOKEN_SANDBOX;

    if (!token) {
      return NextResponse.json(
        { error: "Token do PagBank não configurado" },
        { status: 500 }
      );
    }

    // Consultar status do pedido no PagBank
    const response = await fetch(`${pagBankUrl}/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      logMessage("Erro ao consultar pedido no PagBank", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const orderData = await response.json();

    return NextResponse.json({
      success: true,
      order: orderData,
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
