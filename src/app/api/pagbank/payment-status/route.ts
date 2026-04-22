import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/pagbank/payment-status?pedidoId=...
 *
 * Le status_pagamento direto do banco local (atualizado pelo webhook POST).
 * Usado pelo polling do front como fonte rapida e barata — o fallback para
 * o PagBank continua em /api/pagbank/webhook?orderId=... quando o webhook
 * atrasa ou falha.
 */
export async function GET(req: NextRequest) {
  const pedidoId = req.nextUrl.searchParams.get("pedidoId");

  if (!pedidoId) {
    return NextResponse.json(
      { error: "pedidoId e obrigatorio" },
      { status: 400 }
    );
  }

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: { id: true, status_pagamento: true },
  });

  if (!pedido) {
    return NextResponse.json({ error: "Pedido nao encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    pedidoId: pedido.id,
    status: pedido.status_pagamento,
  });
}
