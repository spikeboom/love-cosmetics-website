import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  fetchAndValidateCupom,
  fetchProdutosComFallback,
  calculateFreightFrenet,
  fetchConfiguracoesLoja,
} = vi.hoisted(() => ({
  fetchAndValidateCupom: vi.fn(),
  fetchProdutosComFallback: vi.fn(),
  calculateFreightFrenet: vi.fn(),
  fetchConfiguracoesLoja: vi.fn(),
}));

vi.mock("@/lib/strapi", () => ({
  fetchAndValidateCupom,
  fetchProdutosComFallback,
  PRICE_TOLERANCE: 0.01,
}));
vi.mock("@/lib/freight/frenet", () => ({ calculateFreightFrenet }));
vi.mock("@/lib/cms/directus/configuracoes", () => ({ fetchConfiguracoesLoja }));
vi.mock("@/config/produtos-esgotados", () => ({ PRODUTOS_ESGOTADOS_SLUGS: ["esgotado-slug"] }));

import { validateOrder } from "@/lib/pedido/validate-order";

const baseProduto = {
  id: "p1",
  nome: "Produto",
  preco: 100,
  slug: "produto",
  peso_gramas: 100,
  altura: 5,
  largura: 5,
  comprimento: 5,
  bling_number: 123,
};

const baseItem = {
  reference_id: "p1",
  name: "Produto",
  quantity: 1,
  preco: 100,
  unit_amount: 10000,
};

beforeEach(() => {
  vi.clearAllMocks();
  // Defaults: produto valido, frete real Sedex 18, sem cupom, sem free shipping
  fetchProdutosComFallback.mockResolvedValue(new Map([["p1", baseProduto]]));
  calculateFreightFrenet.mockResolvedValue({
    success: true,
    services: [
      { carrier: "Correios", service: "Sedex", price: 18, deliveryTime: 3, serviceCode: "04014" },
      { carrier: "Correios", service: "PAC", price: 15, deliveryTime: 7, serviceCode: "04510" },
    ],
  });
  fetchConfiguracoesLoja.mockResolvedValue({ freteGratisValor: 200 });
  // Cast para evitar restricao read-only do tipo NodeJS.ProcessEnv mais recente
  (process.env as any).NEXT_PUBLIC_DEV_TOOLS = "false";
  delete (process.env as any).NODE_ENV;
  delete (process.env as any).STAGE;
});

describe("validateOrder — guards basicos", () => {
  it("EMPTY_CART quando items vazio", async () => {
    const r = await validateOrder([], [], 0, 18, 18, "01001000");
    expect(r.valid).toBe(false);
    expect(r.code).toBe("EMPTY_CART");
  });

  it("INVALID_CEP quando CEP nao tem 8 digitos", async () => {
    const r = await validateOrder([baseItem], [], 0, 118, 18, "1234");
    expect(r.valid).toBe(false);
    expect(r.code).toBe("INVALID_CEP");
  });

  it("CEP com mascara e aceito (so digitos)", async () => {
    const r = await validateOrder([baseItem], [], 0, 118, 18, "01001-000");
    expect(r.valid).toBe(true);
  });
});

describe("validateOrder — produtos", () => {
  it("PRODUCT_NOT_FOUND quando Strapi nao retorna o item", async () => {
    fetchProdutosComFallback.mockResolvedValue(new Map());
    const r = await validateOrder([baseItem], [], 0, 118, 18, "01001000");
    expect(r.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("PRODUCT_OUT_OF_STOCK quando slug esta na blocklist", async () => {
    fetchProdutosComFallback.mockResolvedValue(
      new Map([["p1", { ...baseProduto, slug: "esgotado-slug" }]]),
    );
    const r = await validateOrder([baseItem], [], 0, 118, 18, "01001000");
    expect(r.code).toBe("PRODUCT_OUT_OF_STOCK");
  });

  it("PRICE_MISMATCH quando preco do client diverge do Strapi", async () => {
    const r = await validateOrder(
      [{ ...baseItem, preco: 90 }], // cliente pensa que custa 90
      [], 0, 108, 18, "01001000",
    );
    expect(r.code).toBe("PRICE_MISMATCH");
  });

  it("INVALID_QUANTITY quando quantity <= 0", async () => {
    const r = await validateOrder(
      [{ ...baseItem, quantity: 0 }], [], 0, 118, 18, "01001000",
    );
    expect(r.code).toBe("INVALID_QUANTITY");
  });

  it("SUSPICIOUS_QUANTITY quando quantity > 100", async () => {
    const r = await validateOrder(
      [{ ...baseItem, quantity: 101 }], [], 0, 11818, 18, "01001000",
    );
    expect(r.code).toBe("SUSPICIOUS_QUANTITY");
  });
});

describe("validateOrder — cupom", () => {
  it("INVALID_COUPON quando Strapi rejeita o cupom", async () => {
    fetchAndValidateCupom.mockResolvedValue({
      valido: false, cupom: null, erro: "Expirado",
    });
    const r = await validateOrder([baseItem], ["EXPIRADO"], 0, 118, 18, "01001000");
    expect(r.code).toBe("INVALID_COUPON");
  });

  it("MULTIPLE_COUPONS_NOT_ALLOWED quando manda 2+ cupons", async () => {
    const r = await validateOrder([baseItem], ["A", "B"], 0, 118, 18, "01001000");
    expect(r.code).toBe("MULTIPLE_COUPONS_NOT_ALLOWED");
  });

  it("aceita cupom valido e propaga codigo + usos_restantes", async () => {
    fetchAndValidateCupom.mockResolvedValue({
      valido: true,
      cupom: { codigo: "PRIMEIRA10", multiplacar: 0.9, diminuir: 0, usos_restantes: 50 },
    });
    // 100 * 0.9 = 90 + 18 frete = 108
    const r = await validateOrder([baseItem], ["primeira10"], 10, 108, 18, "01001000");
    expect(r.valid).toBe(true);
    expect(r.details?.cupomCodigo).toBe("PRIMEIRA10");
    expect(r.details?.cupomUsosRestantes).toBe(50);
    expect(r.calculatedDescontos).toBe(10);
  });
});

describe("validateOrder — frete", () => {
  it("INVALID_FREIGHT quando frete e negativo", async () => {
    const r = await validateOrder([baseItem], [], 0, 100, -1, "01001000");
    expect(r.code).toBe("INVALID_FREIGHT");
  });

  it("INVALID_FREIGHT quando frete > 500 (suspeito)", async () => {
    const r = await validateOrder([baseItem], [], 0, 700, 600, "01001000");
    expect(r.code).toBe("INVALID_FREIGHT");
  });

  it("FREIGHT_MISMATCH quando frete enviado nao bate com nenhum servico Frenet", async () => {
    const r = await validateOrder([baseItem], [], 0, 199, 99, "01001000");
    expect(r.code).toBe("FREIGHT_MISMATCH");
  });

  it("FREIGHT_UNAVAILABLE em producao quando Frenet falha", async () => {
    (process.env as any).NODE_ENV = "production";
    calculateFreightFrenet.mockResolvedValue({ success: false, error: "Frenet down" });
    const r = await validateOrder([baseItem], [], 0, 118, 18, "01001000");
    expect(r.code).toBe("FREIGHT_UNAVAILABLE");
  });

  it("em DEV, frete inacessivel pelo Frenet nao bloqueia (usa o enviado)", async () => {
    calculateFreightFrenet.mockResolvedValue({ success: false, error: "Frenet down" });
    const r = await validateOrder([baseItem], [], 0, 118, 18, "01001000");
    expect(r.valid).toBe(true);
  });

  it("frete=0 com subtotal acima do limite + servico economico (PAC) disponivel = aceita", async () => {
    // isEconomicaService trata "Correios + PAC" como economico
    calculateFreightFrenet.mockResolvedValue({
      success: true,
      services: [
        { carrier: "Correios", service: "Sedex", price: 18, deliveryTime: 3, serviceCode: "04014" },
        { carrier: "Correios", service: "PAC", price: 12, deliveryTime: 9, serviceCode: "04510" },
      ],
    });
    fetchConfiguracoesLoja.mockResolvedValue({ freteGratisValor: 50 });
    // subtotal 100 >= 50, frete 0
    const r = await validateOrder([baseItem], [], 0, 100, 0, "01001000");
    expect(r.valid).toBe(true);
    expect(r.details?.freteValidado).toBe(0);
    expect(r.details?.freteService?.service).toBe("PAC");
  });

  it("frete=0 com subtotal abaixo do limite -> FREIGHT_MISMATCH", async () => {
    fetchConfiguracoesLoja.mockResolvedValue({ freteGratisValor: 200 });
    const r = await validateOrder([baseItem], [], 0, 100, 0, "01001000");
    expect(r.code).toBe("FREIGHT_MISMATCH");
  });
});

describe("validateOrder — totals", () => {
  it("DISCOUNT_MISMATCH quando descontos enviado diverge", async () => {
    fetchAndValidateCupom.mockResolvedValue({
      valido: true, cupom: { codigo: "X", multiplacar: 0.9, diminuir: 0, usos_restantes: 99 },
    });
    // calculado: desconto 10. Cliente envia 5.
    const r = await validateOrder([baseItem], ["x"], 5, 108, 18, "01001000");
    expect(r.code).toBe("DISCOUNT_MISMATCH");
  });

  it("TOTAL_MISMATCH quando total enviado diverge", async () => {
    // Sem cupom, esperado 118 (100 + 18). Cliente envia 200.
    const r = await validateOrder([baseItem], [], 0, 200, 18, "01001000");
    expect(r.code).toBe("TOTAL_MISMATCH");
  });

  it("happy path: tudo certo, retorna calculatedTotal e detalhes", async () => {
    const r = await validateOrder([baseItem], [], 0, 118, 18, "01001000");
    expect(r.valid).toBe(true);
    expect(r.calculatedTotal).toBe(118);
    expect(r.calculatedDescontos).toBe(0);
    expect(r.details?.freteValidado).toBe(18);
    expect(r.details?.freteService?.service).toBe("Sedex");
  });
});
