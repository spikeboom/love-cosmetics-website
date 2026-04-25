import { prisma } from "@/lib/prisma";
import { fetchAndValidateCupom } from "@/lib/strapi";

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

  // Defesa em profundidade: NUNCA reverter um cupom ja CONSUMED. Se o callsite
  // esquecer o guard, o updateMany aqui simplesmente nao bate em nada.
  await (prisma as any).cupomReserva
    .updateMany({
      where: { pedidoId, status: "RESERVED" },
      data: { status: "RELEASED", expiresAt: new Date(0) },
    })
    .catch(() => {});
}

/**
 * Reservar novamente o cupom de um pedido que esta sendo retentado apos uma
 * recusa de pagamento. A reserva original foi liberada pelo webhook de DECLINED
 * para nao segurar a vaga global do cupom enquanto o cliente nao volta.
 *
 * Re-busca os dados do cupom no CMS porque os limites podem ter mudado entre
 * a primeira tentativa e a retentativa. Se nao houver mais vaga, lanca
 * CupomEsgotadoError para o caller decidir o que oferecer ao cliente.
 *
 * Idempotente: se a reserva ainda esta RESERVED e valida, nao mexe.
 */
export async function reReserveCupomOnRetry(pedidoId: string): Promise<{
  reReserved: boolean;
  codigo: string | null;
}> {
  if (!pedidoId) return { reReserved: false, codigo: null };

  const reserva = await (prisma as any).cupomReserva.findUnique({
    where: { pedidoId },
  });

  if (!reserva || !reserva.codigo) {
    return { reReserved: false, codigo: null };
  }

  // Reserva ainda valida (RESERVED + nao expirada): nada a fazer.
  if (reserva.status === "RESERVED" && reserva.expiresAt > new Date()) {
    return { reReserved: false, codigo: reserva.codigo };
  }

  const cupomResult = await fetchAndValidateCupom(reserva.codigo);
  if (!cupomResult.valido || !cupomResult.cupom) {
    throw new CupomEsgotadoError(cupomResult.erro || "Cupom indisponivel");
  }

  const usosRestantes =
    typeof cupomResult.cupom.usos_restantes === "number"
      ? cupomResult.cupom.usos_restantes
      : null;

  // Cupom sem limite: nao precisa reservar.
  if (usosRestantes === null) {
    return { reReserved: false, codigo: reserva.codigo };
  }

  await prisma.$transaction(async (tx) => {
    await reserveCupomForPedido({
      tx,
      codigo: reserva.codigo,
      pedidoId,
      maxUsos: usosRestantes,
    });
  });

  return { reReserved: true, codigo: reserva.codigo };
}
