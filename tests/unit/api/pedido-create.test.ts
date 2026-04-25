import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  prismaMock,
  validateOrder,
  getCurrentSession,
  createPedidoFromBody,
  createAccountForOrderIfRequested,
  linkPedidoToLoggedCliente,
  reserveCupomForPedido,
  FakeCupomEsgotadoError,
} = vi.hoisted(() => {
  class FakeCupomEsgotadoError extends Error {
    code = "COUPON_EXHAUSTED" as const;
  }
  return {
    prismaMock: {
      pedido: { findUnique: vi.fn(), findFirst: vi.fn() },
      $transaction: vi.fn(),
    },
    validateOrder: vi.fn(),
    getCurrentSession: vi.fn(),
    createPedidoFromBody: vi.fn(),
    createAccountForOrderIfRequested: vi.fn(),
    linkPedidoToLoggedCliente: vi.fn(),
    reserveCupomForPedido: vi.fn(),
    FakeCupomEsgotadoError,
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/cliente/auth", () => ({ getCurrentSession }));
vi.mock("@/lib/checkout/validation", () => ({
  // Validacoes basicas: aceitar tudo nos testes (focamos no fluxo da rota)
  validacoes: {
    cpf: () => true,
    telefone: () => true,
    cep: () => true,
  },
}));
vi.mock("@/lib/pedido/validate-order", () => ({ validateOrder }));
vi.mock("@/lib/pedido/create-pedido", () => ({
  createAccountForOrderIfRequested,
  createPedidoFromBody,
  linkPedidoToLoggedCliente,
}));
vi.mock("@/lib/cupom/usage", () => ({
  reserveCupomForPedido,
  CupomEsgotadoError: FakeCupomEsgotadoError,
}));
vi.mock("@/utils/logMessage", () => ({ createLogger: () => () => {} }));

import { POST } from "@/app/api/pedido/route";

const validBody = {
  nome: "Damaris",
  sobrenome: "Barbosa",
  email: "dama@yahoo.com",
  telefone: "11999999999",
  cpf: "94221553200",
  pais: "Brasil",
  cep: "01001000",
  endereco: "Rua A",
  numero: "10",
  bairro: "Centro",
  cidade: "Sao Paulo",
  estado: "sp",
  items: [
    {
      reference_id: "p1",
      name: "Produto",
      quantity: 1,
      preco: 200,
      unit_amount: 20000,
    },
  ],
  cupons: [] as string[],
  descontos: 0,
  total_pedido: 218,
  frete_calculado: 18,
};

function makeRequest(
  body: unknown,
  options: { cookies?: Record<string, string>; headers?: Record<string, string> } = {},
): any {
  const headers = new Headers({ "content-type": "application/json", ...options.headers });
  const cookies = options.cookies ?? {};

  // O codigo da rota usa `req.cookies.get(name)?.value` (formato NextRequest).
  // Fetch Request padrao nao tem essa API, entao construimos um stub.
  const req = new Request("http://localhost/api/pedido", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return new Proxy(req, {
    get(target, prop) {
      if (prop === "cookies") {
        return {
          get: (name: string) =>
            name in cookies ? { name, value: cookies[name] } : undefined,
        };
      }
      const value = (target as any)[prop];
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  validateOrder.mockResolvedValue({
    valid: true,
    calculatedTotal: 218,
    calculatedDescontos: 0,
    details: { freteValidado: 18 },
  });
  getCurrentSession.mockResolvedValue(null);
  prismaMock.pedido.findUnique.mockResolvedValue(null);
  prismaMock.pedido.findFirst.mockResolvedValue(null);
  prismaMock.$transaction.mockImplementation(async (cb: any) => {
    const tx = { pedido: { create: vi.fn() } };
    return await cb(tx);
  });
  createPedidoFromBody.mockResolvedValue({
    id: "pedido-novo",
    total_pedido: 218,
    frete_calculado: 18,
  });
  createAccountForOrderIfRequested.mockResolvedValue({ contaCriada: false, clienteId: null });
  linkPedidoToLoggedCliente.mockResolvedValue(undefined);
});

describe("POST /api/pedido — validacao de payload (zod)", () => {
  it("400 INVALID_ORDER_DATA quando email invalido", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "nao-eh-email" }) as any);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe("INVALID_ORDER_DATA");
    expect(validateOrder).not.toHaveBeenCalled();
  });

  it("400 INVALID_ORDER_DATA quando items vazio falta total_pedido", async () => {
    const res = await POST(makeRequest({ ...validBody, total_pedido: undefined }) as any);
    expect(res.status).toBe(400);
  });

  it("400 INVALID_ORDER_DATA quando estado tem mais de 2 chars", async () => {
    const res = await POST(makeRequest({ ...validBody, estado: "Sao Paulo" }) as any);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/pedido — sanitizacao de payload", () => {
  it("normaliza email (lowercase), CPF/telefone/CEP (so digitos), estado (upper), cupons (upper)", async () => {
    // Zod valida email com regex simples antes da sanitizacao, entao um email
    // ja valido (sem espacos) com letras maiusculas e o caso real testavel.
    await POST(
      makeRequest({
        ...validBody,
        email: "TESTE@Mail.COM",
        cpf: "942.215.532-00",
        telefone: "(11) 99999-9999",
        cep: "01001-000",
        estado: "sp",
        cupons: ["bemvindolove15"],
      }) as any,
    );

    const callArgs = createPedidoFromBody.mock.calls[0][0].body;
    expect(callArgs.email).toBe("teste@mail.com");
    expect(callArgs.cpf).toBe("94221553200");
    expect(callArgs.telefone).toBe("11999999999");
    expect(callArgs.cep).toBe("01001000");
    expect(callArgs.estado).toBe("SP");
    expect(callArgs.cupons).toEqual(["BEMVINDOLOVE15"]);
  });
});

describe("POST /api/pedido — validacao server-side (validateOrder)", () => {
  it("400 com error code quando validateOrder rejeita (PRICE_MISMATCH)", async () => {
    validateOrder.mockResolvedValue({
      valid: false,
      error: "Preco do produto X mudou",
      code: "PRICE_MISMATCH",
    });
    const res = await POST(makeRequest(validBody) as any);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe("PRICE_MISMATCH");
    expect(createPedidoFromBody).not.toHaveBeenCalled();
  });

  it("usa totals/frete do server (nao confia no client)", async () => {
    // Cliente envia 999, server diz que e 218
    validateOrder.mockResolvedValue({
      valid: true,
      calculatedTotal: 218,
      calculatedDescontos: 0,
      details: { freteValidado: 18 },
    });
    await POST(makeRequest({ ...validBody, total_pedido: 999, frete_calculado: 999 }) as any);

    const args = createPedidoFromBody.mock.calls[0][0];
    expect(args.totalSeguro).toBe(218);
    expect(args.freteSeguro).toBe(18);
  });
});

describe("POST /api/pedido — idempotencia", () => {
  it("retorna pedido existente quando idempotencyKey ja foi usado", async () => {
    prismaMock.pedido.findUnique.mockResolvedValueOnce({ id: "pedido-existente" });
    const res = await POST(
      makeRequest({ ...validBody, idempotencyKey: "abc12345-key" }) as any,
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe("pedido-existente");
    expect(json.idempotent).toBe(true);
    expect(validateOrder).not.toHaveBeenCalled();
    expect(createPedidoFromBody).not.toHaveBeenCalled();
  });

  it("idempotencyKey nao chamado quando ausente", async () => {
    await POST(makeRequest(validBody) as any);
    expect(prismaMock.pedido.findUnique).not.toHaveBeenCalled();
  });
});

describe("POST /api/pedido — cupom de primeira compra", () => {
  it("400 COUPON_FIRST_PURCHASE_ONLY se ja existe pedido pago com mesmo CPF", async () => {
    prismaMock.pedido.findFirst.mockResolvedValue({ id: "pedido-anterior" });

    const res = await POST(
      makeRequest({ ...validBody, cupons: ["BEMVINDOLOVE15"] }) as any,
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe("COUPON_FIRST_PURCHASE_ONLY");
    expect(createPedidoFromBody).not.toHaveBeenCalled();
  });

  it("aceita cupom de primeira compra quando nao ha pedido pago previo", async () => {
    prismaMock.pedido.findFirst.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ ...validBody, cupons: ["BEMVINDOLOVE15"] }) as any,
    );
    expect(res.status).toBe(201);
  });

  it("nao verifica primeira-compra quando o cupom nao e BEMVINDOLOVE15", async () => {
    await POST(makeRequest({ ...validBody, cupons: ["OUTROCUPOM"] }) as any);
    expect(prismaMock.pedido.findFirst).not.toHaveBeenCalled();
  });
});

describe("POST /api/pedido — reserva de cupom", () => {
  it("reserva cupom dentro da transacao quando validateOrder devolve usos_restantes", async () => {
    validateOrder.mockResolvedValue({
      valid: true,
      calculatedTotal: 218,
      calculatedDescontos: 0,
      details: {
        freteValidado: 18,
        cupomCodigo: "PRIMEIRA10",
        cupomUsosRestantes: 5,
      },
    });

    await POST(makeRequest({ ...validBody, cupons: ["primeira10"] }) as any);

    expect(reserveCupomForPedido).toHaveBeenCalledWith(
      expect.objectContaining({
        codigo: "PRIMEIRA10",
        pedidoId: "pedido-novo",
        maxUsos: 5,
      }),
    );
  });

  it("NAO reserva quando cupom nao tem limite (usos_restantes=null)", async () => {
    validateOrder.mockResolvedValue({
      valid: true,
      calculatedTotal: 218,
      calculatedDescontos: 0,
      details: { freteValidado: 18, cupomCodigo: "ILIMITADO", cupomUsosRestantes: null },
    });
    await POST(makeRequest({ ...validBody, cupons: ["ilimitado"] }) as any);
    expect(reserveCupomForPedido).not.toHaveBeenCalled();
  });

  it("400 COUPON_EXHAUSTED quando reserve lanca CupomEsgotadoError", async () => {
    validateOrder.mockResolvedValue({
      valid: true,
      calculatedTotal: 218,
      calculatedDescontos: 0,
      details: { freteValidado: 18, cupomCodigo: "X", cupomUsosRestantes: 1 },
    });
    prismaMock.$transaction.mockRejectedValue(new FakeCupomEsgotadoError());

    const res = await POST(makeRequest({ ...validBody, cupons: ["x"] }) as any);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe("COUPON_EXHAUSTED");
  });
});

describe("POST /api/pedido — origem test (cookie is_test_user)", () => {
  it("marca origem='test' quando cookie is_test_user=1", async () => {
    await POST(makeRequest(validBody, { cookies: { is_test_user: "1" } }) as any);
    const args = createPedidoFromBody.mock.calls[0][0].body;
    expect(args.origem).toBe("test");
  });

  it("marca origem='checkout' quando cookie ausente", async () => {
    await POST(makeRequest(validBody) as any);
    const args = createPedidoFromBody.mock.calls[0][0].body;
    expect(args.origem).toBe("checkout");
  });
});

describe("POST /api/pedido — vinculacao com cliente", () => {
  it("vincula ao cliente logado quando ha sessao", async () => {
    getCurrentSession.mockResolvedValue({ id: "cliente-123" });
    const res = await POST(makeRequest(validBody) as any);
    const json = await res.json();

    expect(linkPedidoToLoggedCliente).toHaveBeenCalledWith(
      expect.objectContaining({ pedidoId: "pedido-novo", clienteId: "cliente-123" }),
    );
    expect(json.clienteVinculado).toBe(true);
    expect(createAccountForOrderIfRequested).not.toHaveBeenCalled();
  });

  it("cria conta quando salvar_minhas_informacoes=true e nao ha sessao", async () => {
    createAccountForOrderIfRequested.mockResolvedValue({
      contaCriada: true,
      clienteId: "novo-cliente",
    });
    const res = await POST(
      makeRequest({ ...validBody, salvar_minhas_informacoes: true }) as any,
    );
    const json = await res.json();

    expect(createAccountForOrderIfRequested).toHaveBeenCalled();
    expect(json.contaCriada).toBe(true);
    expect(json.clienteVinculado).toBe(true);
  });

  it("nao cria conta quando salvar_minhas_informacoes=false", async () => {
    const res = await POST(
      makeRequest({ ...validBody, salvar_minhas_informacoes: false }) as any,
    );
    const json = await res.json();
    expect(createAccountForOrderIfRequested).not.toHaveBeenCalled();
    expect(json.contaCriada).toBe(false);
    expect(json.clienteVinculado).toBe(false);
  });
});

describe("POST /api/pedido — sucesso", () => {
  it("retorna 201 com id do pedido", async () => {
    const res = await POST(makeRequest(validBody) as any);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.id).toBe("pedido-novo");
    expect(json.message).toMatch(/sucesso/i);
  });
});
