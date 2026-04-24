import { describe, it, expect, vi, beforeEach } from "vitest";

// reserveCupomForPedido nao usa o prisma global — recebe um tx por parametro.
// Logo, NAO precisamos mockar @/lib/prisma. So importamos a funcao real.
vi.mock("@/lib/strapi", () => ({ fetchAndValidateCupom: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { reserveCupomForPedido, CupomEsgotadoError } from "@/lib/cupom/usage";

function buildTx(overrides?: { count?: number }) {
  return {
    $executeRaw: vi.fn<(...args: any[]) => Promise<number>>().mockResolvedValue(0),
    cupomReserva: {
      count: vi
        .fn<(args?: any) => Promise<number>>()
        .mockResolvedValue(overrides?.count ?? 0),
      upsert: vi
        .fn<(args: any) => Promise<any>>()
        .mockResolvedValue({ id: "r1" }),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("reserveCupomForPedido", () => {
  it("no-op quando codigo vazio (string vazia)", async () => {
    const tx = buildTx();
    await reserveCupomForPedido({ tx, codigo: "", pedidoId: "p", maxUsos: 5 });
    expect(tx.$executeRaw).not.toHaveBeenCalled();
    expect(tx.cupomReserva.upsert).not.toHaveBeenCalled();
  });

  it("no-op quando codigo so com espaco", async () => {
    const tx = buildTx();
    await reserveCupomForPedido({ tx, codigo: "   ", pedidoId: "p", maxUsos: 5 });
    expect(tx.cupomReserva.upsert).not.toHaveBeenCalled();
  });

  it("no-op quando maxUsos <= 0", async () => {
    const tx = buildTx();
    await reserveCupomForPedido({ tx, codigo: "X", pedidoId: "p", maxUsos: 0 });
    expect(tx.cupomReserva.upsert).not.toHaveBeenCalled();
  });

  it("no-op quando maxUsos nao e numero finito", async () => {
    const tx = buildTx();
    await reserveCupomForPedido({ tx, codigo: "X", pedidoId: "p", maxUsos: NaN as any });
    expect(tx.cupomReserva.upsert).not.toHaveBeenCalled();
  });

  it("normaliza codigo (uppercase + trim)", async () => {
    const tx = buildTx();
    await reserveCupomForPedido({ tx, codigo: " primeira10 ", pedidoId: "p", maxUsos: 5 });
    // Conferimos via where do count
    const countCall = tx.cupomReserva.count.mock.calls[0]![0];
    expect(countCall.where.codigo).toBe("PRIMEIRA10");
    const upsertCall = tx.cupomReserva.upsert.mock.calls[0]![0];
    expect(upsertCall.create.codigo).toBe("PRIMEIRA10");
    expect(upsertCall.update.codigo).toBe("PRIMEIRA10");
  });

  it("dispara advisory lock no Postgres por codigo", async () => {
    const tx = buildTx();
    await reserveCupomForPedido({ tx, codigo: "X", pedidoId: "p", maxUsos: 5 });
    expect(tx.$executeRaw).toHaveBeenCalledOnce();
  });

  it("count exclui o proprio pedido (idempotencia em retentativa)", async () => {
    const tx = buildTx();
    await reserveCupomForPedido({ tx, codigo: "X", pedidoId: "pedido-meu", maxUsos: 5 });
    const countCall = tx.cupomReserva.count.mock.calls[0]![0];
    expect(countCall.where.pedidoId).toEqual({ not: "pedido-meu" });
  });

  it("count considera CONSUMED + RESERVED nao expiradas", async () => {
    const tx = buildTx();
    await reserveCupomForPedido({ tx, codigo: "X", pedidoId: "p", maxUsos: 5 });
    const where = tx.cupomReserva.count.mock.calls[0]![0].where;
    expect(where.OR).toEqual(
      expect.arrayContaining([
        { status: "CONSUMED" },
        expect.objectContaining({ status: "RESERVED" }),
      ]),
    );
  });

  it("upsert grava status RESERVED com TTL futuro", async () => {
    const tx = buildTx();
    const before = Date.now();
    await reserveCupomForPedido({ tx, codigo: "X", pedidoId: "p", maxUsos: 5 });
    const upsertArg = tx.cupomReserva.upsert.mock.calls[0]![0];
    expect(upsertArg.create.status).toBe("RESERVED");
    const expiresAt = upsertArg.create.expiresAt as Date;
    expect(expiresAt.getTime()).toBeGreaterThan(before);
  });

  it("CupomEsgotadoError quando count >= maxUsos", async () => {
    const tx = buildTx({ count: 5 });
    await expect(
      reserveCupomForPedido({ tx, codigo: "X", pedidoId: "p", maxUsos: 5 }),
    ).rejects.toThrow(CupomEsgotadoError);
    expect(tx.cupomReserva.upsert).not.toHaveBeenCalled();
  });

  it("aceita reserva quando count < maxUsos (count=4, max=5)", async () => {
    const tx = buildTx({ count: 4 });
    await reserveCupomForPedido({ tx, codigo: "X", pedidoId: "p", maxUsos: 5 });
    expect(tx.cupomReserva.upsert).toHaveBeenCalledOnce();
  });

  it("TTL custom (ttlMs) e respeitado", async () => {
    const tx = buildTx();
    const before = Date.now();
    await reserveCupomForPedido({
      tx, codigo: "X", pedidoId: "p", maxUsos: 5, ttlMs: 60_000,
    });
    const upsertArg = tx.cupomReserva.upsert.mock.calls[0]![0];
    const expiresAt = (upsertArg.create.expiresAt as Date).getTime();
    expect(expiresAt - before).toBeLessThanOrEqual(60_500);
    expect(expiresAt - before).toBeGreaterThanOrEqual(59_500);
  });
});
