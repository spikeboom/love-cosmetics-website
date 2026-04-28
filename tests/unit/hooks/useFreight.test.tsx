import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("@/services/freight-service", () => ({
  FreightService: {
    isValidCep: (cep: string) => cep.replace(/\D/g, "").length === 8,
  },
}));

vi.mock("@/app/(figma)/_tracking/uc-ecommerce", () => ({
  ucShippingCalculate: vi.fn(),
}));

import { useFreight } from "@/deprecated/hooks/useFreight";

const fetchMock = vi.fn();

function mockFrenetSuccess(services: Array<any>) {
  fetchMock.mockImplementation(async (url: string) => {
    if (typeof url === "string" && url.includes("/api/freight/quote")) {
      return {
        ok: true,
        json: async () => ({ success: true, services }),
      };
    }
    if (typeof url === "string" && url.includes("viacep.com.br")) {
      return { ok: true, json: async () => ({ erro: true }) };
    }
    if (typeof url === "string" && url.includes("/api/checkout/cep-track")) {
      return { ok: true, json: async () => ({ ok: true }) };
    }
    return { ok: true, json: async () => ({}) };
  });
}

function mockFrenetError(error: string) {
  fetchMock.mockImplementation(async (url: string) => {
    if (typeof url === "string" && url.includes("/api/freight/quote")) {
      return { ok: true, json: async () => ({ success: false, error }) };
    }
    return { ok: true, json: async () => ({}) };
  });
}

const cartItem = {
  id: "p1",
  nome: "Espuma Facial",
  preco: 59.4,
  quantity: 2,
  peso_gramas: 178,
  altura: 21.5,
  largura: 5,
  comprimento: 5,
  bling_number: 8 as any,
  imagem: "/img.jpg",
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── mapeamento cart → payload ──────────────────────────────────────────────
describe("useFreight — mapeamento cart → /api/freight/quote", () => {
  it("envia todos os campos relevantes do cart no payload", async () => {
    mockFrenetSuccess([
      { carrier: "Correios", service: "PAC", price: 25, deliveryTime: 5, serviceCode: "01" },
    ]);

    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("01310-100", [cartItem as any]);
    });

    const quoteCall = fetchMock.mock.calls.find(
      (c) => typeof c[0] === "string" && c[0].includes("/api/freight/quote"),
    );
    expect(quoteCall).toBeDefined();
    const body = JSON.parse(quoteCall![1].body);
    expect(body.cep).toBe("01310-100");
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      quantity: 2,
      peso_gramas: 178,
      altura: 21.5,
      largura: 5,
      comprimento: 5,
      bling_number: 8,
      preco: 59.4,
    });
  });

  it("envia múltiplos itens no payload preservando ordem", async () => {
    mockFrenetSuccess([
      { carrier: "Correios", service: "PAC", price: 25, deliveryTime: 5, serviceCode: "01" },
    ]);
    const items = [
      { ...cartItem, id: "a" },
      { ...cartItem, id: "b", quantity: 3, peso_gramas: 79.9 },
      { ...cartItem, id: "c", quantity: 1, peso_gramas: 164 },
    ];

    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("01310100", items as any);
    });

    const quoteCall = fetchMock.mock.calls.find(
      (c) => typeof c[0] === "string" && c[0].includes("/api/freight/quote"),
    );
    const body = JSON.parse(quoteCall![1].body);
    expect(body.items).toHaveLength(3);
    expect(body.items[0].quantity).toBe(2);
    expect(body.items[1].quantity).toBe(3);
    expect(body.items[1].peso_gramas).toBe(79.9);
    expect(body.items[2].peso_gramas).toBe(164);
  });

  it("não chama API quando cartItems vazio", async () => {
    mockFrenetSuccess([]);
    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("01310100", []);
    });

    const quoteCall = fetchMock.mock.calls.find(
      (c) => typeof c[0] === "string" && c[0].includes("/api/freight/quote"),
    );
    expect(quoteCall).toBeUndefined();
  });

  it("não chama API quando CEP é inválido (silencioso não seta erro)", async () => {
    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("123", [cartItem as any], { silent: true });
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it("CEP inválido sem silent seta error legível", async () => {
    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("123", [cartItem as any]);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/CEP/i);
  });
});

// ─── tratamento de resposta ──────────────────────────────────────────────────
describe("useFreight — resposta da API", () => {
  it("sucesso: hidrata services, freightValue e hasCalculated", async () => {
    mockFrenetSuccess([
      { carrier: "Correios", service: "PAC", price: 25, deliveryTime: 5, serviceCode: "01" },
      { carrier: "Correios", service: "Sedex", price: 45, deliveryTime: 2, serviceCode: "02" },
    ]);

    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("01310100", [cartItem as any]);
    });

    expect(result.current.hasCalculated).toBe(true);
    expect(result.current.availableServices).toHaveLength(2);
    // Default seleciona o mais barato
    expect(result.current.freightValue).toBe(25);
    expect(result.current.error).toBeNull();
  });

  it("erro propagado: seta error e zera availableServices", async () => {
    mockFrenetError("Dados de frete invalidos");

    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("01310100", [cartItem as any]);
    });

    expect(result.current.error).toBe("Dados de frete invalidos");
    expect(result.current.hasCalculated).toBe(false);
    expect(result.current.availableServices).toHaveLength(0);
  });

  it("exceção de fetch: error genérico e fallback de freight", async () => {
    fetchMock.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("01310100", [cartItem as any]);
    });

    expect(result.current.error).toMatch(/Erro ao conectar/i);
    expect(result.current.hasCalculated).toBe(false);
  });
});

// ─── concorrência ────────────────────────────────────────────────────────────
describe("useFreight — guard de chamadas concorrentes", () => {
  it("bloqueia segunda chamada simultânea para o mesmo CEP", async () => {
    let resolveFirst: ((v: any) => void) | null = null;
    const firstPromise = new Promise<any>((resolve) => {
      resolveFirst = resolve;
    });

    let callCount = 0;
    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.includes("/api/freight/quote")) {
        callCount++;
        // Primeira chamada fica pendente até resolveFirst
        if (callCount === 1) {
          await firstPromise;
        }
        return {
          ok: true,
          json: async () => ({
            success: true,
            services: [
              { carrier: "Correios", service: "PAC", price: 25, deliveryTime: 5, serviceCode: "01" },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    });

    const { result } = renderHook(() => useFreight());

    let firstCall: Promise<void>;
    let secondCall: Promise<void>;
    await act(async () => {
      firstCall = result.current.calculateFreight("01310100", [cartItem as any]);
      // Segunda chamada para o mesmo CEP enquanto a primeira não terminou
      secondCall = result.current.calculateFreight("01310100", [cartItem as any]);
      resolveFirst!(null);
      await firstCall;
      await secondCall;
    });

    const quoteCalls = fetchMock.mock.calls.filter(
      (c) => typeof c[0] === "string" && c[0].includes("/api/freight/quote"),
    );
    // Apenas uma chamada de quote foi de fato disparada
    expect(quoteCalls).toHaveLength(1);
  });
});

// ─── seleção de serviço preservada ───────────────────────────────────────────
describe("useFreight — preserva seleção de serviço entre cotações", () => {
  it("mantém serviço previamente selecionado quando ainda existe na nova lista", async () => {
    mockFrenetSuccess([
      { carrier: "Correios", service: "PAC", price: 25, deliveryTime: 5, serviceCode: "01" },
      { carrier: "Correios", service: "Sedex", price: 45, deliveryTime: 2, serviceCode: "02" },
    ]);

    const { result } = renderHook(() => useFreight());

    // Primeira cotação
    await act(async () => {
      await result.current.calculateFreight("01310100", [cartItem as any]);
    });

    // Usuário seleciona Sedex (índice 1)
    act(() => {
      result.current.setSelectedFreight(45, 2, 1);
    });
    expect(result.current.selectedServiceIndex).toBe(1);

    // Segunda cotação retorna a mesma lista
    await act(async () => {
      await result.current.calculateFreight("01310100", [cartItem as any]);
    });

    // Sedex (serviceCode 02) ainda existe → seleção preservada
    expect(result.current.availableServices[result.current.selectedServiceIndex].serviceCode).toBe("02");
  });

  it("cai no mais barato quando serviço selecionado some da lista", async () => {
    // Primeira cotação: 2 serviços
    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        services: [
          { carrier: "Correios", service: "PAC", price: 25, deliveryTime: 5, serviceCode: "01" },
          { carrier: "Correios", service: "Sedex", price: 45, deliveryTime: 2, serviceCode: "02" },
        ],
      }),
    }));

    const { result } = renderHook(() => useFreight());

    await act(async () => {
      await result.current.calculateFreight("01310100", [cartItem as any]);
    });

    act(() => result.current.setSelectedFreight(45, 2, 1));

    // Segunda cotação só tem PAC (Sedex sumiu)
    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        services: [
          { carrier: "Correios", service: "PAC", price: 25, deliveryTime: 5, serviceCode: "01" },
        ],
      }),
    }));
    fetchMock.mockImplementation(async () => ({ ok: true, json: async () => ({}) }));

    await act(async () => {
      await result.current.calculateFreight("01310100", [cartItem as any]);
    });

    expect(result.current.availableServices).toHaveLength(1);
    expect(result.current.selectedServiceIndex).toBe(0);
    expect(result.current.freightValue).toBe(25);
  });
});
