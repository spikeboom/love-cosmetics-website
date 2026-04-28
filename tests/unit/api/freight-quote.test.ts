import { describe, it, expect, vi, beforeEach } from "vitest";

const { calculateFreightFrenet } = vi.hoisted(() => ({
  calculateFreightFrenet: vi.fn(),
}));

vi.mock("@/lib/freight/frenet", () => ({ calculateFreightFrenet }));

import { POST } from "@/app/api/freight/quote/route";

function makeRequest(body: unknown): any {
  return {
    json: async () => body,
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

const baseItem = { quantity: 1, preco: 50 };

describe("POST /api/freight/quote", () => {
  it("400 quando payload invalido (cep curto)", async () => {
    const res = await POST(makeRequest({ cep: "1234", items: [baseItem] }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(calculateFreightFrenet).not.toHaveBeenCalled();
  });

  it("400 quando items vazio", async () => {
    const res = await POST(makeRequest({ cep: "69082230", items: [] }));
    expect(res.status).toBe(400);
    expect(calculateFreightFrenet).not.toHaveBeenCalled();
  });

  it("400 quando quantity nao positiva", async () => {
    const res = await POST(makeRequest({ cep: "69082230", items: [{ quantity: 0, preco: 10 }] }));
    expect(res.status).toBe(400);
  });

  it("400 quando preco negativo", async () => {
    const res = await POST(
      makeRequest({ cep: "69082230", items: [{ quantity: 1, preco: -5 }] }),
    );
    expect(res.status).toBe(400);
  });

  it("400 quando lib retorna success=false e propaga payload", async () => {
    calculateFreightFrenet.mockResolvedValue({ success: false, error: "CEP invalido" });
    const res = await POST(makeRequest({ cep: "69082230", items: [baseItem] }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe("CEP invalido");
  });

  it("200 quando lib retorna success=true e propaga services/cheapest", async () => {
    const successPayload = {
      success: true,
      services: [{ carrier: "Correios", service: "PAC", price: 30, deliveryTime: 5, serviceCode: "01" }],
      cheapest: { carrier: "Correios", service: "PAC", price: 30, deliveryTime: 5 },
    };
    calculateFreightFrenet.mockResolvedValue(successPayload);
    const res = await POST(makeRequest({ cep: "69082230", items: [baseItem] }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual(successPayload);
  });

  it("500 quando lib lanca excecao", async () => {
    calculateFreightFrenet.mockRejectedValue(new Error("boom"));
    const res = await POST(makeRequest({ cep: "69082230", items: [baseItem] }));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/Erro ao calcular frete/i);
  });

  it("500 quando req.json() lanca", async () => {
    const badReq = { json: async () => { throw new Error("invalid json"); } } as any;
    const res = await POST(badReq);
    expect(res.status).toBe(500);
  });

  it("encaminha cep e items para a lib", async () => {
    calculateFreightFrenet.mockResolvedValue({
      success: true,
      services: [],
      cheapest: { carrier: "x", service: "x", price: 0, deliveryTime: 0 },
    });
    const items = [baseItem, { quantity: 3, preco: 25, peso_gramas: 500 }];
    await POST(makeRequest({ cep: "69082230", items }));
    expect(calculateFreightFrenet).toHaveBeenCalledWith("69082230", items);
  });

  it("400 quando items excede limite (max 100)", async () => {
    const items = Array.from({ length: 101 }, () => baseItem);
    const res = await POST(makeRequest({ cep: "69082230", items }));
    expect(res.status).toBe(400);
    expect(calculateFreightFrenet).not.toHaveBeenCalled();
  });
});
