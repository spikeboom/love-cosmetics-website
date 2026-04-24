import { describe, it, expect, vi, beforeEach } from "vitest";

// =====================================================================
// Mocks dos modulos externos (DB, PagBank HTTP, cupom Strapi)
//
// vi.hoisted() é necessário porque vi.mock() é içado pro topo do arquivo —
// se usássemos `const prismaMock = ...` direto, ele seria undefined no
// momento que o factory rodasse.
// =====================================================================
const { prismaMock, reReserveCupomOnRetry, FakeCupomEsgotadoError, createPagBankOrder } =
  vi.hoisted(() => {
    const prismaMock = {
      pedido: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      cupomReserva: {
        delete: vi.fn(),
      },
    };
    const reReserveCupomOnRetry = vi.fn();
    class FakeCupomEsgotadoError extends Error {
      code = "COUPON_EXHAUSTED" as const;
    }
    const createPagBankOrder = vi.fn();
    return { prismaMock, reReserveCupomOnRetry, FakeCupomEsgotadoError, createPagBankOrder };
  });

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/cupom/usage", () => ({
  reReserveCupomOnRetry: (...args: unknown[]) => reReserveCupomOnRetry(...args),
  CupomEsgotadoError: FakeCupomEsgotadoError,
}));

vi.mock("@/lib/pagbank/create-order", () => ({
  buildCardOrderRequest: vi.fn(() => ({})),
  buildCustomerFromPedido: vi.fn(() => ({})),
  buildItemsFromPedido: vi.fn(() => []),
  buildOrderUpdateData: vi.fn((args) => ({
    pagbank_order_id: args.orderResponse.id,
    pagbank_charge_id: args.orderResponse.charges?.[0]?.id,
    status_pagamento: args.orderResponse.charges?.[0]?.status,
    payment_method: args.paymentMethod === "pix" ? "pix" : "credit_card",
  })),
  buildPixOrderRequest: vi.fn(() => ({})),
  buildShippingFromPedido: vi.fn(() => ({})),
  buildTotalAmount: vi.fn(() => ({ value: 22552, currency: "BRL" })),
  createPagBankOrder: (...args: unknown[]) => createPagBankOrder(...args),
  extractPixResponseData: vi.fn(() => ({ text: "", imageUrl: "", expirationDate: "" })),
  resolveNotificationUrls: vi.fn(() => ({
    baseUrl: "https://x",
    notificationUrls: ["https://x/api/pagbank/webhook"],
  })),
}));

vi.mock("@/utils/pagbank-config", () => ({
  getPagBankApiUrl: () => "https://sandbox.api.pagseguro.com",
  getPagBankToken: () => "fake-token",
}));

vi.mock("@/utils/logMessage", () => ({
  createLogger: () => () => {},
}));

// Import APOS mocks
import { POST } from "@/app/api/pagbank/create-order/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/pagbank/create-order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const basePedido = {
  id: "pedido-1",
  status_pagamento: null as string | null,
  payment_method: null as string | null,
  pagbank_order_id: null as string | null,
  pix_expiration: null,
  cupons: [] as string[],
  cupom_valor: null,
  cupom_descricao: null,
  descontos: 0,
  subtotal_produtos: 200,
  frete_calculado: 18,
  total_pedido: 218,
};

beforeEach(() => {
  vi.clearAllMocks();
  // updateMany com sucesso por padrao
  prismaMock.pedido.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.pedido.update.mockResolvedValue({});
  prismaMock.cupomReserva.delete.mockResolvedValue({});
});

describe("POST /api/pagbank/create-order — DECLINED sincrono", () => {
  it("devolve payment_response no JSON quando charge.status=DECLINED", async () => {
    prismaMock.pedido.findUnique
      .mockResolvedValueOnce({ ...basePedido }) // antes do lock
      .mockResolvedValueOnce({ ...basePedido }); // re-fetch apos lock

    createPagBankOrder.mockResolvedValue({
      ok: true,
      status: 201,
      data: {
        id: "ORDE_X",
        charges: [
          {
            id: "CHAR_X",
            status: "DECLINED",
            payment_response: {
              code: "20003",
              message: "NAO AUTORIZADA",
              reference: "042475146206",
              raw_data: { reason_code: "51" },
            },
          },
        ],
      },
    });

    const res = await POST(
      makeRequest({
        pedidoId: "pedido-1",
        paymentMethod: "credit_card",
        encryptedCard: "enc",
        installments: 1,
      }) as any,
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("DECLINED");
    expect(json.payment_response).toMatchObject({
      code: "20003",
      reference: "042475146206",
    });
    expect(json.message).toMatch(/recusado/i);
  });

  it("PAID retorna sem payment_response", async () => {
    prismaMock.pedido.findUnique
      .mockResolvedValueOnce({ ...basePedido })
      .mockResolvedValueOnce({ ...basePedido });

    createPagBankOrder.mockResolvedValue({
      ok: true,
      status: 201,
      data: {
        id: "ORDE_OK",
        charges: [{ id: "CHAR_OK", status: "PAID" }],
      },
    });

    const res = await POST(
      makeRequest({
        pedidoId: "pedido-1",
        paymentMethod: "credit_card",
        encryptedCard: "enc",
      }) as any,
    );
    const json = await res.json();

    expect(json.status).toBe("PAID");
    expect(json.payment_response).toBeUndefined();
    expect(json.message).toMatch(/aprovado/i);
  });
});

describe("POST /api/pagbank/create-order — retentativa", () => {
  it("re-reserva cupom quando o pedido esta em failure status", async () => {
    const pedidoEmFalha = { ...basePedido, status_pagamento: "DECLINED", cupons: ["X10"] };
    prismaMock.pedido.findUnique
      .mockResolvedValueOnce(pedidoEmFalha)
      .mockResolvedValueOnce(pedidoEmFalha);

    reReserveCupomOnRetry.mockResolvedValue({ reReserved: true, codigo: "X10" });
    createPagBankOrder.mockResolvedValue({
      ok: true,
      status: 201,
      data: { id: "ORDE_R", charges: [{ id: "CHAR_R", status: "PAID" }] },
    });

    const res = await POST(
      makeRequest({
        pedidoId: "pedido-1",
        paymentMethod: "credit_card",
        encryptedCard: "enc",
      }) as any,
    );

    expect(res.status).toBe(200);
    expect(reReserveCupomOnRetry).toHaveBeenCalledWith("pedido-1");
  });

  it("retorna 409 COUPON_UNAVAILABLE quando cupom esgotou", async () => {
    const pedidoEmFalha = {
      ...basePedido,
      status_pagamento: "DECLINED",
      cupons: ["PRIMEIRA10"],
      total_pedido: 200,
      subtotal_produtos: 200,
      frete_calculado: 18,
    };
    prismaMock.pedido.findUnique
      .mockResolvedValueOnce(pedidoEmFalha)
      .mockResolvedValueOnce(pedidoEmFalha);

    reReserveCupomOnRetry.mockRejectedValue(new FakeCupomEsgotadoError("Esgotou"));

    const res = await POST(
      makeRequest({
        pedidoId: "pedido-1",
        paymentMethod: "credit_card",
        encryptedCard: "enc",
      }) as any,
    );
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.code).toBe("COUPON_UNAVAILABLE");
    expect(json.cupom).toBe("PRIMEIRA10");
    expect(json.novo_total).toBe(218);
    expect(json.total_atual).toBe(200);

    // Nao deveria ter chamado o PagBank
    expect(createPagBankOrder).not.toHaveBeenCalled();

    // Pedido foi marcado como PAYMENT_FAILED para permitir nova tentativa
    expect(prismaMock.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pedido-1" },
        data: expect.objectContaining({ status_pagamento: "PAYMENT_FAILED" }),
      }),
    );
  });

  it("skipCupom=true zera cupom, recalcula total e procede", async () => {
    const pedidoComCupom = {
      ...basePedido,
      status_pagamento: "PAYMENT_FAILED",
      cupons: ["PRIMEIRA10"],
      total_pedido: 200,
      subtotal_produtos: 200,
      frete_calculado: 18,
      descontos: 18,
      cupom_valor: 18,
      cupom_descricao: "10% OFF",
    };
    const pedidoSemCupom = {
      ...pedidoComCupom,
      cupons: [],
      total_pedido: 218,
      descontos: 0,
      cupom_valor: null,
      cupom_descricao: null,
    };

    prismaMock.pedido.findUnique
      .mockResolvedValueOnce(pedidoComCupom) // antes do lock
      .mockResolvedValueOnce(pedidoComCupom) // apos lock
      .mockResolvedValueOnce(pedidoSemCupom); // apos zerar cupom

    createPagBankOrder.mockResolvedValue({
      ok: true,
      status: 201,
      data: { id: "ORDE_S", charges: [{ id: "CHAR_S", status: "PAID" }] },
    });

    const res = await POST(
      makeRequest({
        pedidoId: "pedido-1",
        paymentMethod: "credit_card",
        encryptedCard: "enc",
        skipCupom: true,
      }) as any,
    );

    expect(res.status).toBe(200);
    expect(reReserveCupomOnRetry).not.toHaveBeenCalled();

    // Pedido foi atualizado para zerar cupom e recalcular total
    const updateCalls = prismaMock.pedido.update.mock.calls.map((c: any) => c[0]);
    const cupomCleared = updateCalls.find((c: any) => c.data?.cupons?.length === 0);
    expect(cupomCleared).toBeTruthy();
    expect(cupomCleared.data.descontos).toBe(0);
    expect(cupomCleared.data.total_pedido).toBe(218);

    // CupomReserva foi deletada
    expect(prismaMock.cupomReserva.delete).toHaveBeenCalledWith({
      where: { pedidoId: "pedido-1" },
    });
  });

  it("primeira tentativa (status null) NAO chama re-reserva", async () => {
    prismaMock.pedido.findUnique
      .mockResolvedValueOnce({ ...basePedido }) // status_pagamento null
      .mockResolvedValueOnce({ ...basePedido });

    createPagBankOrder.mockResolvedValue({
      ok: true,
      status: 201,
      data: { id: "ORDE_FIRST", charges: [{ id: "CHAR_FIRST", status: "PAID" }] },
    });

    await POST(
      makeRequest({
        pedidoId: "pedido-1",
        paymentMethod: "credit_card",
        encryptedCard: "enc",
      }) as any,
    );

    expect(reReserveCupomOnRetry).not.toHaveBeenCalled();
  });
});

describe("POST /api/pagbank/create-order — guardas existentes", () => {
  it("retorna 400 ORDER_ALREADY_PAID quando pedido ja foi pago", async () => {
    prismaMock.pedido.findUnique.mockResolvedValueOnce({
      ...basePedido,
      status_pagamento: "PAID",
    });

    const res = await POST(
      makeRequest({
        pedidoId: "pedido-1",
        paymentMethod: "credit_card",
        encryptedCard: "enc",
      }) as any,
    );
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe("ORDER_ALREADY_PAID");
  });

  it("retorna 400 quando paymentMethod e invalido", async () => {
    const res = await POST(
      makeRequest({ pedidoId: "x", paymentMethod: "boleto" }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando cartao criptografado nao foi enviado", async () => {
    const res = await POST(
      makeRequest({ pedidoId: "x", paymentMethod: "credit_card" }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("retorna 404 quando pedido nao existe", async () => {
    prismaMock.pedido.findUnique.mockResolvedValueOnce(null);
    const res = await POST(
      makeRequest({
        pedidoId: "nao-existe",
        paymentMethod: "credit_card",
        encryptedCard: "enc",
      }) as any,
    );
    expect(res.status).toBe(404);
  });
});
