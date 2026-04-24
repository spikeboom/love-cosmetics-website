import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  prismaMock,
  validateWebhookSignature,
  consumeCupomForPedido,
  releaseCupomForPedido,
  buildGtmPurchasePayload,
  sendGtmPurchaseEvent,
  fetchPagBankOrder,
  logWebhookReceived,
} = vi.hoisted(() => ({
  prismaMock: {
    pedido: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    statusPagamento: {
      create: vi.fn(),
    },
  },
  validateWebhookSignature: vi.fn(),
  consumeCupomForPedido: vi.fn(),
  releaseCupomForPedido: vi.fn(),
  buildGtmPurchasePayload: vi.fn(),
  sendGtmPurchaseEvent: vi.fn(),
  fetchPagBankOrder: vi.fn(),
  logWebhookReceived: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/pagbank/signature", () => ({ validateWebhookSignature }));
vi.mock("@/lib/cupom/usage", () => ({
  consumeCupomForPedido,
  releaseCupomForPedido,
}));
vi.mock("@/lib/pagbank/gtm", () => ({
  buildGtmPurchasePayload,
  sendGtmPurchaseEvent,
}));
vi.mock("@/lib/pagbank/orders", () => ({ fetchPagBankOrder }));
vi.mock("@/lib/pagbank/pagbank-audit-logger", () => ({ logWebhookReceived }));
vi.mock("@/utils/pagbank-config", () => ({
  getPagBankApiUrl: () => "https://x",
  getPagBankToken: () => "tok",
}));
vi.mock("@/utils/logMessage", () => ({ createLogger: () => () => {} }));

import { POST, GET } from "@/app/api/pagbank/webhook/route";

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/pagbank/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const basePedido = {
  id: "pedido-1",
  status_pagamento: "AWAITING_PAYMENT",
  ga_session_id: "g1",
  ga_session_number: "1",
  origem: "checkout",
  cupomReserva: null as { codigo: string; status: string } | null,
};

beforeEach(() => {
  vi.clearAllMocks();
  validateWebhookSignature.mockResolvedValue({ valid: true });
  prismaMock.pedido.findUnique.mockResolvedValue(basePedido);
  prismaMock.pedido.update.mockResolvedValue({});
  prismaMock.statusPagamento.create.mockResolvedValue({ id: 1 });
  buildGtmPurchasePayload.mockResolvedValue({});
  sendGtmPurchaseEvent.mockResolvedValue(undefined);
});

describe("POST /api/pagbank/webhook — assinatura", () => {
  it("rejeita 401 quando assinatura invalida", async () => {
    validateWebhookSignature.mockResolvedValue({ valid: false, reason: "bad-hmac" });
    const res = await POST(makeRequest({ id: "x", reference_id: "y" }) as any);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
    expect(prismaMock.pedido.findUnique).not.toHaveBeenCalled();
  });

  it("acknowledge body nao-JSON sem crashar", async () => {
    const res = await POST(makeRequest("not-json-at-all") as any);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(prismaMock.pedido.findUnique).not.toHaveBeenCalled();
  });
});

describe("POST /api/pagbank/webhook — pedido inexistente", () => {
  it("retorna 404 mas nao quebra fluxo do PagBank", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest({
        id: "ORDE_X",
        reference_id: "nao-existe",
        charges: [{ id: "C", status: "PAID" }],
      }) as any,
    );
    expect(res.status).toBe(404);
    expect(prismaMock.pedido.update).not.toHaveBeenCalled();
  });
});

describe("POST /api/pagbank/webhook — atualizacao de status", () => {
  it("atualiza status para PAID e dispara GTM", async () => {
    const res = await POST(
      makeRequest({
        id: "ORDE_OK",
        reference_id: "pedido-1",
        charges: [{ id: "CHAR_OK", status: "PAID", paid_at: "2026-04-24T10:00:00Z" }],
      }) as any,
    );

    expect(res.status).toBe(200);
    expect(prismaMock.pedido.update).toHaveBeenCalledWith({
      where: { id: "pedido-1" },
      data: { status_pagamento: "PAID" },
    });
    expect(sendGtmPurchaseEvent).toHaveBeenCalledOnce();
  });

  it("PAID NAO dispara GTM quando origem=test (anti-poluicao)", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({ ...basePedido, origem: "test" });
    await POST(
      makeRequest({
        id: "ORDE_T",
        reference_id: "pedido-1",
        charges: [{ id: "CHAR_T", status: "PAID" }],
      }) as any,
    );
    expect(sendGtmPurchaseEvent).not.toHaveBeenCalled();
    expect(prismaMock.pedido.update).toHaveBeenCalled(); // status ainda atualiza
  });

  it("DECLINED atualiza status sem disparar GTM", async () => {
    await POST(
      makeRequest({
        id: "ORDE_F",
        reference_id: "pedido-1",
        charges: [{ id: "CHAR_F", status: "DECLINED" }],
      }) as any,
    );
    expect(prismaMock.pedido.update).toHaveBeenCalledWith({
      where: { id: "pedido-1" },
      data: { status_pagamento: "DECLINED" },
    });
    expect(sendGtmPurchaseEvent).not.toHaveBeenCalled();
  });

  it("entende webhook formato /charges (status no body, sem charges[])", async () => {
    await POST(
      makeRequest({
        id: "CHAR_DIRECT",
        reference_id: "pedido-1",
        status: "PAID",
        paid_at: "2026-04-24T10:00:00Z",
        amount: { value: 22552, currency: "BRL" },
      }) as any,
    );
    expect(prismaMock.pedido.update).toHaveBeenCalledWith({
      where: { id: "pedido-1" },
      data: { status_pagamento: "PAID" },
    });
    expect(sendGtmPurchaseEvent).toHaveBeenCalledOnce();
  });
});

describe("POST /api/pagbank/webhook — cupom", () => {
  it("PAID consome cupom quando reserva existe", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({
      ...basePedido,
      cupomReserva: { codigo: "PRIMEIRA10", status: "RESERVED" },
    });
    await POST(
      makeRequest({
        id: "ORDE_OK",
        reference_id: "pedido-1",
        charges: [{ id: "CHAR_OK", status: "PAID" }],
      }) as any,
    );
    expect(consumeCupomForPedido).toHaveBeenCalledWith({
      pedidoId: "pedido-1",
      codigo: "PRIMEIRA10",
    });
    expect(releaseCupomForPedido).not.toHaveBeenCalled();
  });

  it("DECLINED libera cupom RESERVED para nao bloquear vaga global", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({
      ...basePedido,
      cupomReserva: { codigo: "PRIMEIRA10", status: "RESERVED" },
    });
    await POST(
      makeRequest({
        id: "ORDE_F",
        reference_id: "pedido-1",
        charges: [{ id: "CHAR_F", status: "DECLINED" }],
      }) as any,
    );
    expect(releaseCupomForPedido).toHaveBeenCalledWith("pedido-1");
    expect(consumeCupomForPedido).not.toHaveBeenCalled();
  });

  it("DECLINED NAO libera cupom ja CONSUMED (idempotencia)", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({
      ...basePedido,
      cupomReserva: { codigo: "X", status: "CONSUMED" },
    });
    await POST(
      makeRequest({
        id: "ORDE_F",
        reference_id: "pedido-1",
        charges: [{ id: "CHAR_F", status: "DECLINED" }],
      }) as any,
    );
    expect(releaseCupomForPedido).not.toHaveBeenCalled();
  });

  it("sem cupomReserva nao chama consume nem release", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({ ...basePedido, cupomReserva: null });
    await POST(
      makeRequest({
        id: "ORDE_OK",
        reference_id: "pedido-1",
        charges: [{ id: "CHAR_OK", status: "PAID" }],
      }) as any,
    );
    expect(consumeCupomForPedido).not.toHaveBeenCalled();
    expect(releaseCupomForPedido).not.toHaveBeenCalled();
  });
});

describe("GET /api/pagbank/webhook — consulta de status no PagBank", () => {
  function makeGet(url: string): any {
    return { nextUrl: new URL(url) };
  }

  it("400 quando orderId ausente", async () => {
    const res = await GET(makeGet("http://localhost/api/pagbank/webhook"));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/orderId/i);
    expect(fetchPagBankOrder).not.toHaveBeenCalled();
  });

  it("retorna order do PagBank quando fetch sucede", async () => {
    fetchPagBankOrder.mockResolvedValue({
      ok: true,
      status: 200,
      data: { id: "ORDE_X", charges: [{ id: "CHAR_X", status: "PAID" }] },
    });
    const res = await GET(makeGet("http://localhost/api/pagbank/webhook?orderId=ORDE_X"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.order.id).toBe("ORDE_X");
  });

  it("propaga erro do PagBank com status original", async () => {
    fetchPagBankOrder.mockResolvedValue({
      ok: false,
      status: 404,
      data: { error_messages: [{ description: "not found" }] },
    });
    const res = await GET(makeGet("http://localhost/api/pagbank/webhook?orderId=naoexiste"));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/pagbank/webhook — auditoria e robustez", () => {
  it("sempre persiste em StatusPagamento para historico", async () => {
    const body = {
      id: "ORDE_X",
      reference_id: "pedido-1",
      charges: [{ id: "CHAR_X", status: "PAID" }],
    };
    await POST(makeRequest(body) as any);
    expect(prismaMock.statusPagamento.create).toHaveBeenCalledWith({
      data: { info: body },
    });
  });

  it("erro interno retorna 200 para PagBank nao reenviar (anti-loop)", async () => {
    prismaMock.pedido.findUnique.mockRejectedValue(new Error("DB down"));
    const res = await POST(
      makeRequest({ id: "X", reference_id: "p", charges: [{ status: "PAID" }] }) as any,
    );
    const json = await res.json();
    // Mesmo com erro, retorna 200 — evita loop de retentativa do PagBank
    expect(res.status).toBe(200);
    expect(json.success).toBe(false);
    expect(json.error).toBeTruthy();
  });
});
