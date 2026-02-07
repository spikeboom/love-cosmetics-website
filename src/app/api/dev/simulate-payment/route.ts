import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

/**
 * Simula pagamento aprovado diretamente no banco (sem PagBank).
 * Apenas funciona em ambiente sandbox.
 */
export async function POST(req: NextRequest) {
  // Bloquear em producao
  const pagBankUrl = process.env.PAGBANK_API_URL || "";
  const isSandbox = pagBankUrl.includes("sandbox") || !pagBankUrl;

  if (!isSandbox) {
    return NextResponse.json(
      { error: "Simulacao de pagamento nao permitida em producao" },
      { status: 403 }
    );
  }

  try {
    const { pedidoId, paymentMethod } = await req.json();

    if (!pedidoId || !paymentMethod) {
      return NextResponse.json(
        { error: "pedidoId e paymentMethod sao obrigatorios" },
        { status: 400 }
      );
    }

    if (!["credit_card", "pix"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "paymentMethod deve ser 'credit_card' ou 'pix'" },
        { status: 400 }
      );
    }

    // Verificar se pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, status_pagamento: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido nao encontrado" },
        { status: 404 }
      );
    }

    // Atualizar pedido como PAID
    const simulatedOrderId = `SIM_${randomUUID()}`;

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        status_pagamento: "PAID",
        payment_method: paymentMethod,
        pagbank_order_id: simulatedOrderId,
      },
    });

    // Criar registro de auditoria
    await prisma.statusPagamento.create({
      data: {
        info: {
          type: "SIMULATED_PAYMENT",
          pedidoId,
          paymentMethod,
          simulatedOrderId,
          previousStatus: pedido.status_pagamento,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao simular pagamento:", error);
    return NextResponse.json(
      {
        error: "Erro ao simular pagamento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
