import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { pedido: { findUnique: vi.fn() } },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET } from "@/app/api/pedido/status/route";

function makeRequest(url: string): any {
  return { url, nextUrl: new URL(url) } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/pedido/status", () => {
  it("400 quando pedidoId ausente", async () => {
    const res = await GET(makeRequest("http://localhost/api/pedido/status"));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/pedidoId/i);
    expect(prismaMock.pedido.findUnique).not.toHaveBeenCalled();
  });

  it("404 quando pedido nao existe", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue(null);
    const res = await GET(makeRequest("http://localhost/api/pedido/status?pedidoId=x"));
    expect(res.status).toBe(404);
  });

  it("PAID -> isPaid=true", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({
      id: "p", status_pagamento: "PAID", payment_method: "credit_card", total_pedido: 100,
      createdAt: new Date(), pagbank_order_id: "ORDE",
    });
    const res = await GET(makeRequest("http://localhost/api/pedido/status?pedidoId=p"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.pedido.isPaid).toBe(true);
  });

  it("AUTHORIZED -> isPaid=true", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({
      id: "p", status_pagamento: "AUTHORIZED", payment_method: "credit_card", total_pedido: 100,
      createdAt: new Date(), pagbank_order_id: null,
    });
    const res = await GET(makeRequest("http://localhost/api/pedido/status?pedidoId=p"));
    const json = await res.json();
    expect(json.pedido.isPaid).toBe(true);
  });

  it("DECLINED -> isPaid=false", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({
      id: "p", status_pagamento: "DECLINED", payment_method: "credit_card", total_pedido: 100,
      createdAt: new Date(), pagbank_order_id: null,
    });
    const res = await GET(makeRequest("http://localhost/api/pedido/status?pedidoId=p"));
    const json = await res.json();
    expect(json.pedido.isPaid).toBe(false);
    expect(json.pedido.status_pagamento).toBe("DECLINED");
  });

  it("AWAITING_PAYMENT (Pix pendente) -> isPaid=false", async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({
      id: "p", status_pagamento: "AWAITING_PAYMENT", payment_method: "pix", total_pedido: 100,
      createdAt: new Date(), pagbank_order_id: null,
    });
    const res = await GET(makeRequest("http://localhost/api/pedido/status?pedidoId=p"));
    const json = await res.json();
    expect(json.pedido.isPaid).toBe(false);
  });
});
