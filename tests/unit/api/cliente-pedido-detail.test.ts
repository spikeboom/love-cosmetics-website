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
  it("PAID -> 'Pago'", async () => {
    prismaMock.statusPagamento.findMany.mockResolvedValue([
      { info: { reference_id: "pedido-1", charges: [{ status: "PAID" }] } },
    ]);
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Pago");
  });

  it("IN_ANALYSIS -> 'Em Análise'", async () => {
    prismaMock.statusPagamento.findMany.mockResolvedValue([
      { info: { reference_id: "pedido-1", charges: [{ status: "IN_ANALYSIS" }] } },
    ]);
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Em Análise");
  });

  it("DECLINED -> 'Cancelado' (TODO: trocar para 'Recusado')", async () => {
    // Documenta o comportamento atual; quando o passo #2 da roadmap for feito,
    // este teste vai falhar e precisar ser atualizado pra 'Recusado'.
    prismaMock.statusPagamento.findMany.mockResolvedValue([
      { info: { reference_id: "pedido-1", charges: [{ status: "DECLINED" }] } },
    ]);
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Cancelado");
  });

  it("CANCELED tambem mapeia para 'Cancelado'", async () => {
    prismaMock.statusPagamento.findMany.mockResolvedValue([
      { info: { reference_id: "pedido-1", charges: [{ status: "CANCELED" }] } },
    ]);
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Cancelado");
  });

  it("status desconhecido fica 'Pendente'", async () => {
    prismaMock.statusPagamento.findMany.mockResolvedValue([
      { info: { reference_id: "pedido-1", charges: [{ status: "WAITING" }] } },
    ]);
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Pendente");
  });

  it("sem registro em StatusPagamento -> 'Pendente'", async () => {
    prismaMock.statusPagamento.findMany.mockResolvedValue([]);
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Pendente");
  });

  it("ultimo registro vence (ordenado desc por id)", async () => {
    prismaMock.statusPagamento.findMany.mockResolvedValue([
      // findMany retorna em desc por id — primeiro = mais recente
      { info: { reference_id: "pedido-1", charges: [{ status: "DECLINED" }] } },
      { info: { reference_id: "pedido-1", charges: [{ status: "PAID" }] } },
    ]);
    const res = await callGet("pedido-1");
    const json = await res.json();
    expect(json.pedido.status).toBe("Cancelado");
  });
});
