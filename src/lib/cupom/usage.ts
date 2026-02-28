import { prisma } from "@/lib/prisma";

type Tx = any;

export class CupomEsgotadoError extends Error {
  code = "COUPON_EXHAUSTED" as const;

  constructor(message = "Cupom esgotado") {
    super(message);
    this.name = "CupomEsgotadoError";
  }
}

function nowPlusMs(ms: number) {
  return new Date(Date.now() + ms);
}

/**
 * Reserve one global use of a coupon for a given pedido.
 * Uses a Postgres advisory lock to make the check+reserve atomic per coupon code.
 */
export async function reserveCupomForPedido({
  tx,
  codigo,
  pedidoId,
  maxUsos,
  ttlMs = 30 * 60 * 1000, // 30 minutes
}: {
  tx: Tx;
  codigo: string;
  pedidoId: string;
  maxUsos: number;
  ttlMs?: number;
}): Promise<void> {
  const normalizedCodigo = String(codigo || "").trim().toUpperCase();
  if (!normalizedCodigo) return;
  if (!Number.isFinite(maxUsos) || maxUsos <= 0) return;

  // Lock per coupon code (transaction-scoped).
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${normalizedCodigo}))`;

  const now = new Date();
  const activeCount = await tx.cupomReserva.count({
    where: {
      codigo: normalizedCodigo,
      pedidoId: { not: pedidoId },
      OR: [
        { status: "CONSUMED" },
        { status: "RESERVED", expiresAt: { gt: now } },
      ],
    },
  });

  if (activeCount >= maxUsos) {
    throw new CupomEsgotadoError();
  }

  const expiresAt = nowPlusMs(ttlMs);
  await tx.cupomReserva.upsert({
    where: { pedidoId },
    create: {
      codigo: normalizedCodigo,
      pedidoId,
      status: "RESERVED",
      expiresAt,
    },
    update: {
      codigo: normalizedCodigo,
      status: "RESERVED",
      expiresAt,
    },
  });
}

export async function consumeCupomForPedido({
  pedidoId,
  codigo,
}: {
  pedidoId: string;
  codigo: string;
}): Promise<void> {
  if (!pedidoId || !codigo) return;
  const normalizedCodigo = String(codigo || "").trim().toUpperCase();
  if (!normalizedCodigo) return;

  await (prisma as any).cupomReserva.upsert({
    where: { pedidoId },
    create: {
      codigo: normalizedCodigo,
      pedidoId,
      status: "CONSUMED",
      expiresAt: new Date(0),
    },
    update: {
      codigo: normalizedCodigo,
      status: "CONSUMED",
      expiresAt: new Date(0),
    },
  });
}

export async function releaseCupomForPedido(pedidoId: string): Promise<void> {
  if (!pedidoId) return;

  await (prisma as any).cupomReserva
    .update({
      where: { pedidoId },
      data: { status: "RELEASED", expiresAt: new Date(0) },
    })
    .catch(() => {});
}
