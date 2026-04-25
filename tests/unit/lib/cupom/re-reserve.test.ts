import { describe, it, expect, vi, beforeEach } from "vitest";

// Funcoes do tx que reserveCupomForPedido (chamado internamente) precisa.
// Como nao da pra mockar uma funcao do mesmo modulo via vi.mock parcial
// (reReserveCupomOnRetry chama reserveCupomForPedido direto via import local),
// mockamos no nivel do tx que ela usa.
const { prismaMock, fetchAndValidateCupom, txExecuteRaw, txCupomReservaCount, txCupomReservaUpsert } =
  vi.hoisted(() => {
    const txExecuteRaw = vi.fn(async () => 0);
    const txCupomReservaCount = vi.fn(async () => 0);
    const txCupomReservaUpsert = vi.fn(async () => ({}));
    const prismaMock = {
      cupomReserva: { findUnique: vi.fn() },
      $transaction: vi.fn(async (cb: any) =>
        cb({
          $executeRaw: txExecuteRaw,
          cupomReserva: {
            count: txCupomReservaCount,
            upsert: txCupomReservaUpsert,
          },
        }),
      ),
    };
    return {
      prismaMock,
      fetchAndValidateCupom: vi.fn(),
      txExecuteRaw,
      txCupomReservaCount,
      txCupomReservaUpsert,
    };
  });

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/strapi", () => ({ fetchAndValidateCupom }));

import { reReserveCupomOnRetry, CupomEsgotadoError } from "@/lib/cupom/usage";

beforeEach(() => {
  vi.clearAllMocks();
  txExecuteRaw.mockResolvedValue(0);
  txCupomReservaCount.mockResolvedValue(0);
  txCupomReservaUpsert.mockResolvedValue({});
  prismaMock.$transaction.mockImplementation(async (cb: any) =>
    cb({
      $executeRaw: txExecuteRaw,
      cupomReserva: {
        count: txCupomReservaCount,
        upsert: txCupomReservaUpsert,
      },
    }),
  );
});

describe("reReserveCupomOnRetry", () => {
  it("retorna no-op quando pedidoId e vazio", async () => {
    const result = await reReserveCupomOnRetry("");
    expect(result).toEqual({ reReserved: false, codigo: null });
    expect(prismaMock.cupomReserva.findUnique).not.toHaveBeenCalled();
  });

  it("retorna no-op quando nao ha CupomReserva associada", async () => {
    prismaMock.cupomReserva.findUnique.mockResolvedValue(null);
    const result = await reReserveCupomOnRetry("pedido-1");
    expect(result).toEqual({ reReserved: false, codigo: null });
    expect(fetchAndValidateCupom).not.toHaveBeenCalled();
  });

  it("nao re-reserva quando reserva ainda esta RESERVED e valida", async () => {
    const futuro = new Date(Date.now() + 10 * 60 * 1000);
    prismaMock.cupomReserva.findUnique.mockResolvedValue({
      codigo: "PRIMEIRA10",
      status: "RESERVED",
      expiresAt: futuro,
    });

    const result = await reReserveCupomOnRetry("pedido-1");

    expect(result).toEqual({ reReserved: false, codigo: "PRIMEIRA10" });
    expect(fetchAndValidateCupom).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("re-reserva quando reserva esta RELEASED", async () => {
    prismaMock.cupomReserva.findUnique.mockResolvedValue({
      codigo: "PRIMEIRA10",
      status: "RELEASED",
      expiresAt: new Date(0),
    });
    fetchAndValidateCupom.mockResolvedValue({
      valido: true,
      cupom: { codigo: "PRIMEIRA10", usos_restantes: 50 },
    });

    const result = await reReserveCupomOnRetry("pedido-1");

    expect(result).toEqual({ reReserved: true, codigo: "PRIMEIRA10" });
    // Internamente reserveCupomForPedido faz upsert da reserva nova
    expect(txCupomReservaUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { pedidoId: "pedido-1" },
      }),
    );
  });

  it("re-reserva quando reserva RESERVED mas expirou", async () => {
    const passado = new Date(Date.now() - 60 * 1000);
    prismaMock.cupomReserva.findUnique.mockResolvedValue({
      codigo: "X",
      status: "RESERVED",
      expiresAt: passado,
    });
    fetchAndValidateCupom.mockResolvedValue({
      valido: true,
      cupom: { codigo: "X", usos_restantes: 10 },
    });

    const result = await reReserveCupomOnRetry("p");
    expect(result.reReserved).toBe(true);
    expect(txCupomReservaUpsert).toHaveBeenCalled();
  });

  it("lanca CupomEsgotadoError quando o CMS diz que cupom e invalido", async () => {
    prismaMock.cupomReserva.findUnique.mockResolvedValue({
      codigo: "EXPIRADO",
      status: "RELEASED",
      expiresAt: new Date(0),
    });
    fetchAndValidateCupom.mockResolvedValue({
      valido: false,
      cupom: null,
      erro: "Cupom expirado",
    });

    await expect(reReserveCupomOnRetry("p")).rejects.toThrow(CupomEsgotadoError);
    await expect(reReserveCupomOnRetry("p")).rejects.toThrow(/expirado/i);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("cupom sem limite (usos_restantes=null) nao chama reserve internamente", async () => {
    prismaMock.cupomReserva.findUnique.mockResolvedValue({
      codigo: "ILIMITADO",
      status: "RELEASED",
      expiresAt: new Date(0),
    });
    fetchAndValidateCupom.mockResolvedValue({
      valido: true,
      cupom: { codigo: "ILIMITADO", usos_restantes: null },
    });

    const result = await reReserveCupomOnRetry("p");
    expect(result).toEqual({ reReserved: false, codigo: "ILIMITADO" });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("propaga CupomEsgotadoError quando vagas globais ja foram tomadas", async () => {
    prismaMock.cupomReserva.findUnique.mockResolvedValue({
      codigo: "ULTIMO",
      status: "RELEASED",
      expiresAt: new Date(0),
    });
    fetchAndValidateCupom.mockResolvedValue({
      valido: true,
      cupom: { codigo: "ULTIMO", usos_restantes: 1 },
    });
    // Outro pedido ja consumiu/reservou: count >= maxUsos -> CupomEsgotadoError
    txCupomReservaCount.mockResolvedValue(1);

    await expect(reReserveCupomOnRetry("p")).rejects.toThrow(CupomEsgotadoError);
    expect(txCupomReservaUpsert).not.toHaveBeenCalled();
  });
});
