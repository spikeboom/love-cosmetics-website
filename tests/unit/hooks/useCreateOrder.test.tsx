import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock dos contexts antes do import
const cartState = { current: {} as any };
const cuponsState = { current: [] as any[] };
const totalsState = { current: { total: 0, descontos: 0 } };

vi.mock("@/contexts", () => ({
  useCart: () => ({ cart: cartState.current }),
  useCoupon: () => ({ cupons: cuponsState.current }),
  useShipping: () => ({ freightValue: 18, getSelectedFreightData: () => ({}) }),
  useCartTotals: () => totalsState.current,
}));
vi.mock("@/core/pricing/resumo-compra", () => ({
  calculateCartResumoCompra: () => ({ descontoCupom: 0 }),
}));
vi.mock("@/utils/cart-calculations", () => ({ getTipoDesconto: () => null }));

import { useCreateOrder } from "@/hooks/checkout/useCreateOrder";

beforeEach(() => {
  vi.clearAllMocks();
  cartState.current = {
    "p1": { documentId: "p1", nome: "Produto", preco: 100, quantity: 1 },
  };
  cuponsState.current = [];
  totalsState.current = { total: 118, descontos: 0 };
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.localStorage.setItem(
    "checkoutIdentificacao",
    JSON.stringify({
      nome: "Damaris Barbosa",
      email: "x@y.com",
      telefone: "11999999999",
      cpf: "94221553200",
    }),
  );
  window.localStorage.setItem(
    "checkoutEntrega",
    JSON.stringify({
      cep: "01001000",
      rua: "Rua A",
      numero: "10",
      semNumero: false,
      complemento: "",
      bairro: "Centro",
      cidade: "SP",
      estado: "SP",
    }),
  );
  // Mock global fetch
  global.fetch = vi.fn();
});

describe("useCreateOrder", () => {
  it("sucesso retorna pedidoId e seta sessionStorage", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "pedido-novo" }),
    });

    const { result } = renderHook(() => useCreateOrder());
    let outcome: any;
    await act(async () => {
      outcome = await result.current.createOrder();
    });

    expect(outcome).toEqual({ success: true, pedidoId: "pedido-novo" });
    expect(window.sessionStorage.getItem("checkoutPedidoId")).toBe("pedido-novo");
    expect(result.current.error).toBeNull();
    expect(result.current.errorCode).toBeNull();
  });

  it("erro com code propaga errorCode (pra UI mostrar mensagem certa)", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Preco mudou", code: "PRICE_MISMATCH" }),
    });

    const { result } = renderHook(() => useCreateOrder());
    let outcome: any;
    await act(async () => {
      outcome = await result.current.createOrder();
    });

    expect(outcome.success).toBe(false);
    expect(outcome.code).toBe("PRICE_MISMATCH");
    expect(result.current.error).toBe("Preco mudou");
    expect(result.current.errorCode).toBe("PRICE_MISMATCH");
  });

  it("clearError limpa error e errorCode", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Algo", code: "INVALID" }),
    });

    const { result } = renderHook(() => useCreateOrder());
    await act(async () => { await result.current.createOrder(); });
    expect(result.current.errorCode).toBe("INVALID");

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
    expect(result.current.errorCode).toBeNull();
  });

  it("usa idempotencyKey existente do sessionStorage (evita duplo click)", async () => {
    window.sessionStorage.setItem("checkoutIdempotencyKey", "key-existente-123");
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "p" }),
    });

    const { result } = renderHook(() => useCreateOrder());
    await act(async () => { await result.current.createOrder(); });

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.idempotencyKey).toBe("key-existente-123");
  });

  it("envia payload com cpf/telefone/cep so com digitos", async () => {
    window.localStorage.setItem(
      "checkoutIdentificacao",
      JSON.stringify({
        nome: "X",
        email: "x@y.com",
        telefone: "(11) 99999-9999",
        cpf: "942.215.532-00",
      }),
    );
    window.localStorage.setItem(
      "checkoutEntrega",
      JSON.stringify({
        cep: "01001-000", rua: "R", numero: "1", semNumero: false,
        complemento: "", bairro: "B", cidade: "C", estado: "SP",
      }),
    );
    (global.fetch as any).mockResolvedValue({
      ok: true, json: async () => ({ id: "p" }),
    });

    const { result } = renderHook(() => useCreateOrder());
    await act(async () => { await result.current.createOrder(); });

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.cpf).toBe("94221553200");
    expect(body.telefone).toBe("11999999999");
    expect(body.cep).toBe("01001000");
  });

  it("falta de identificacao no localStorage retorna erro", async () => {
    window.localStorage.removeItem("checkoutIdentificacao");
    const { result } = renderHook(() => useCreateOrder());
    let outcome: any;
    await act(async () => { outcome = await result.current.createOrder(); });
    expect(outcome.success).toBe(false);
    expect(outcome.error).toMatch(/identificacao/i);
  });

  it("guarda contra double-click (in-flight bloqueia segunda chamada)", async () => {
    let resolveFetch: (v: any) => void;
    (global.fetch as any).mockReturnValue(
      new Promise((resolve) => { resolveFetch = resolve; }),
    );

    const { result } = renderHook(() => useCreateOrder());

    // Primeira chamada (nao espera)
    let firstPromise: any;
    act(() => {
      firstPromise = result.current.createOrder();
    });

    // Segunda chamada concorrente devolve ORDER_IN_PROGRESS
    let second: any;
    await act(async () => {
      second = await result.current.createOrder();
    });
    expect(second.code).toBe("ORDER_IN_PROGRESS");

    // Limpa: resolve a primeira
    resolveFetch!({ ok: true, json: async () => ({ id: "p" }) });
    await act(async () => { await firstPromise; });
  });
});
