import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { calculateFreightFrenet } from "@/lib/freight/frenet";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  delete process.env.NEXT_PUBLIC_DEV_TOOLS;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const validItems = [
  { quantity: 2, peso_gramas: 250, altura: 5, largura: 10, comprimento: 15, preco: 50 },
];

function mockFrenetServices(services: Array<Record<string, unknown>>) {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ ShippingSevicesArray: services }),
  });
}

describe("calculateFreightFrenet", () => {
  it("rejeita CEP invalido (menos de 8 digitos)", async () => {
    const res = await calculateFreightFrenet("123", validItems);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toMatch(/CEP/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("aceita CEP com mascara (69082-230)", async () => {
    mockFrenetServices([
      { ServiceCode: "01", ServiceDescription: "PAC", Carrier: "Correios", ShippingPrice: 25.5, DeliveryTime: 5, OriginalDeliveryTime: 5 },
    ]);
    const res = await calculateFreightFrenet("69082-230", validItems);
    expect(res.success).toBe(true);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.RecipientCEP).toBe("69082230");
    expect(body.SellerCEP).toMatch(/^\d+$/);
  });

  it("retorna erro quando lista de itens vazia", async () => {
    const res = await calculateFreightFrenet("69082230", []);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toMatch(/Nenhum item/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("propaga erro quando Frenet retorna status nao OK", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    const res = await calculateFreightFrenet("69082230", validItems);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toMatch(/Erro ao calcular frete/i);
  });

  it("retorna erro quando ShippingSevicesArray vem vazio", async () => {
    mockFrenetServices([]);
    const res = await calculateFreightFrenet("69082230", validItems);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toMatch(/Nenhum servico/i);
  });

  it("retorna erro propagado quando todos os servicos vem com Error", async () => {
    mockFrenetServices([
      { ServiceCode: "01", ServiceDescription: "PAC", Carrier: "Correios", ShippingPrice: 0, DeliveryTime: 0, OriginalDeliveryTime: 0, Error: "Area nao atendida" },
    ]);
    const res = await calculateFreightFrenet("69082230", validItems);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe("Area nao atendida");
  });

  it("filtra servicos com Error e calcula o mais barato", async () => {
    mockFrenetServices([
      { ServiceCode: "BAD", ServiceDescription: "X", Carrier: "Y", ShippingPrice: 0, DeliveryTime: 0, OriginalDeliveryTime: 0, Error: "fail" },
      { ServiceCode: "01", ServiceDescription: "PAC", Carrier: "Correios", ShippingPrice: 30, DeliveryTime: 7, OriginalDeliveryTime: 7 },
      { ServiceCode: "02", ServiceDescription: "SEDEX", Carrier: "Correios", ShippingPrice: 50, DeliveryTime: 3, OriginalDeliveryTime: 3 },
    ]);
    const res = await calculateFreightFrenet("69082230", validItems);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.services).toHaveLength(2);
      expect(res.cheapest.price).toBe(30);
      expect(res.cheapest.service).toBe("PAC");
    }
  });

  it("converte ShippingPrice e DeliveryTime que vem como string", async () => {
    mockFrenetServices([
      { ServiceCode: "01", ServiceDescription: "PAC", Carrier: "Correios", ShippingPrice: "42.75", DeliveryTime: "9", OriginalDeliveryTime: 9 },
    ]);
    const res = await calculateFreightFrenet("69082230", validItems);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.services[0].price).toBeCloseTo(42.75);
      expect(res.services[0].deliveryTime).toBe(9);
    }
  });

  it("calcula ShipmentInvoiceValue como soma de preco*quantity", async () => {
    mockFrenetServices([
      { ServiceCode: "01", ServiceDescription: "PAC", Carrier: "Correios", ShippingPrice: 10, DeliveryTime: 5, OriginalDeliveryTime: 5 },
    ]);
    await calculateFreightFrenet("69082230", [
      { quantity: 2, preco: 50 },
      { quantity: 1, preco: 30 },
    ]);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.ShipmentInvoiceValue).toBe(130);
    expect(body.ShippingItemArray).toHaveLength(2);
    // peso_gramas default = 200 -> 0.2 kg
    expect(body.ShippingItemArray[0].Weight).toBe(0.2);
    // dimensoes default = 10
    expect(body.ShippingItemArray[0].Length).toBe(10);
    expect(body.ShippingItemArray[0].Height).toBe(10);
    expect(body.ShippingItemArray[0].Width).toBe(10);
    // SKU fallback quando nao ha bling_number
    expect(body.ShippingItemArray[0].SKUCode).toBe("ITEM-1");
  });

  it("usa bling_number como SKUCode quando presente", async () => {
    mockFrenetServices([
      { ServiceCode: "01", ServiceDescription: "PAC", Carrier: "Correios", ShippingPrice: 10, DeliveryTime: 5, OriginalDeliveryTime: 5 },
    ]);
    await calculateFreightFrenet("69082230", [
      { quantity: 1, preco: 50, bling_number: 12345 },
    ]);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.ShippingItemArray[0].SKUCode).toBe("12345");
  });

  it("retorna erro generico quando fetch lanca excecao", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const res = await calculateFreightFrenet("69082230", validItems);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toMatch(/Erro ao calcular frete/i);
  });

  it("injeta servico [DEV] quando NEXT_PUBLIC_DEV_TOOLS=true e o escolhe como mais barato", async () => {
    process.env.NEXT_PUBLIC_DEV_TOOLS = "true";
    mockFrenetServices([
      { ServiceCode: "01", ServiceDescription: "PAC", Carrier: "Correios", ShippingPrice: 30, DeliveryTime: 7, OriginalDeliveryTime: 7 },
    ]);
    const res = await calculateFreightFrenet("69082230", validItems);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.services[0].carrier).toBe("[DEV]");
      expect(res.cheapest.price).toBe(0.1);
    }
  });
});
