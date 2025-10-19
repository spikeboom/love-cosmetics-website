import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Verifica o status de pagamento de um pedido
 * GET /api/pedido/status?pedidoId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pedidoId = searchParams.get("pedidoId");

    if (!pedidoId) {
      return NextResponse.json(
        { error: "pedidoId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar pedido no banco de dados
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        status_pagamento: true,
        pagbank_order_id: true,
        payment_method: true,
        total_pedido: true,
        createdAt: true,
      },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já foi pago
    const isPaid = pedido.status_pagamento === "PAID" || pedido.status_pagamento === "AUTHORIZED";

    return NextResponse.json({
      success: true,
      pedido: {
        id: pedido.id,
        status_pagamento: pedido.status_pagamento,
        isPaid,
        payment_method: pedido.payment_method,
        pagbank_order_id: pedido.pagbank_order_id,
        total_pedido: pedido.total_pedido,
        createdAt: pedido.createdAt,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar status do pedido:", error);
    return NextResponse.json(
      {
        error: "Erro ao verificar status do pedido",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
