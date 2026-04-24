import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock, getCurrentSession } = vi.hoisted(() => ({
  prismaMock: {
    pedidoCliente: { findFirst: vi.fn() },
    statusPagamento: { findMany: vi.fn() },
  },
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/cliente/auth", () => ({ getCurrentSession }));

import { GET } from "@/app/api/cliente/conta/pedidos/[id]/route";

const basePedido = {
  id: "pedido-1",
  total_pedido: 218,
  frete_calculado: 18,
  subtotal_produtos: 200,
  descontos: 0,
  cupom_valor: null,
  cupom_descricao: null,
  status_entrega: "AGUARDANDO_PAGAMENTO",
  historicoStatusEntrega: [],
  items: [{ name: "Produto", quantity: 1, preco: 200 }],
  cupons: [],
  createdAt: new Date(),
  payment_method: "credit_card",
  payment_card_info: null,
  cep: "01001000",
  endereco: "R",
  numero: "1",
  complemento: "",
  bairro: "B",
  cidade: "C",
  estado: "SP",
};

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentSession.mockResolvedValue({ id: "cliente-1" });
  prismaMock.pedidoCliente.findFirst.mockResolvedValue({ pedido: basePedido });
  prismaMock.statusPagamento.findMany.mockResolvedValue([]);
});

async function callGet(id: string) {
  return GET({} as any, { params: Promise.resolve({ id }) });
}

describe("GET /api/cliente/conta/pedidos/[id] — auth/security", () => {
  it("401 quando sem sessao", async () => {
    getCurrentSession.mockResolvedValue(null);
    const res = await callGet("pedido-1");
    expect(res.status).toBe(401);
  });

  it("404 quando pedido nao pertence ao cliente logado", async () => {
    prismaMock.pedidoCliente.findFirst.mockResolvedValue(null);
    const res = await callGet("pedido-de-outro");
    expect(res.status).toBe(404);
    // valida que a query usa clienteId da sessao (anti-leak)
    const where = prismaMock.pedidoCliente.findFirst.mock.calls[0][0].where;
    expect(where.clienteId).toBe("cliente-1");
  });
});

describe("GET /api/cliente/conta/pedidos/[id] — mapeamento de status", () => {
  // Fonte de verdade e pedido.status_pagamento (nao mais o ultimo StatusPagamento).
  function mockPedidoStatus(s: string) {
    prismaMock.pedidoCliente.findFirst.mockResolvedValue({
      pedido: { ...basePedido, status_pagamento: s },
    });
  }

  it("PAID -> 'Pago'", async () => {
    mockPedidoStatus("PAID");
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Pago");
  });

  it("AUTHORIZED -> 'Pago'", async () => {
    mockPedidoStatus("AUTHORIZED");
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Pago");
  });

  it("IN_ANALYSIS -> 'Em Análise'", async () => {
    mockPedidoStatus("IN_ANALYSIS");
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Em Análise");
  });

  it("DECLINED -> 'Cancelado' (TODO: trocar para 'Recusado')", async () => {
    mockPedidoStatus("DECLINED");
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Cancelado");
  });

  it("CANCELED -> 'Cancelado'", async () => {
    mockPedidoStatus("CANCELED");
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Cancelado");
  });

  it("PAYMENT_FAILED -> 'Cancelado'", async () => {
    mockPedidoStatus("PAYMENT_FAILED");
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Cancelado");
  });

  it("status desconhecido fica 'Pendente'", async () => {
    mockPedidoStatus("WAITING");
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Pendente");
  });

  it("status null/AWAITING_PAYMENT -> 'Pendente'", async () => {
    mockPedidoStatus("AWAITING_PAYMENT");
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Pendente");
  });

  it("[REGRESSAO] PAID no Pedido + DECLINED tardio em StatusPagamento -> 'Pago'", async () => {
    // Cenario do bug: cliente pagou (Pedido.status_pagamento = PAID), mas
    // chegou um webhook DECLINED tardio depois (da tentativa anterior).
    // StatusPagamento guarda TODOS os webhooks pra auditoria — o ultimo
    // por id desc nao reflete a verdade do pedido. Fonte de verdade e
    // Pedido.status_pagamento, nao o ultimo webhook arquivado.
    prismaMock.pedidoCliente.findFirst.mockResolvedValue({
      pedido: { ...basePedido, status_pagamento: "PAID" },
    });
    prismaMock.statusPagamento.findMany.mockResolvedValue([
      // Webhook DECLINED tardio chegou depois e e o ultimo por id
      { info: { reference_id: "pedido-1", charges: [{ status: "DECLINED" }] } },
      { info: { reference_id: "pedido-1", charges: [{ status: "PAID" }] } },
    ]);
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Pago");
  });
});
