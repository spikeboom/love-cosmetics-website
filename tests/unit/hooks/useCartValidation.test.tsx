/**
 * Testes pro useCartValidation.
 *
 * Esse hook foi origem do bug de "frete grudado em /cart" (relatado em
 * 2026-04-28): tinha um guard `isValidatingRef` que retornava null em
 * chamadas concorrentes, e o caller (refreshCartPrices) interpretava null
 * como falha — então o cart nunca era sincronizado com o CMS quando o
 * auto-refresh disparava 2x (strict mode dev no React 18).
 *
 * O teste de "chamadas concorrentes" é o que protege contra alguém
 * reintroduzir esse guard "achando que evita duplicada".
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useCartValidation } from "@/deprecated/hooks/useCartValidation";

const cartComItem = {
  "331": {
    id: "331",
    documentId: "z2ymswculwwn411yirr8jhn1",
    nome: "Kit Uso Diário",
    preco: 159.44,
    quantity: 1,
  },
};

const validateResponse = {
  atualizado: true,
  produtosDesatualizados: [],
  cuponsDesatualizados: [],
  produtosAtualizados: [{
    id: "331",
    documentId: "z2ymswculwwn411yirr8jhn1",
    nome: "Kit Uso Diário",
    precoAtual: 159.44,
    precoComCupom: 159.44,
    peso_gramas: 443,
    altura: 22,
    largura: 10,
    comprimento: 6,
  }],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useCartValidation", () => {
  it("cart vazio: retorna resultado vazio sem chamar a API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCartValidation());
    let res: any;
    await act(async () => {
      res = await result.current.validateCart({}, []);
    });

    expect(res).toEqual({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("happy path: faz POST em /api/carrinho/validar e devolve o body", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => validateResponse,
    } as any));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCartValidation());
    let res: any;
    await act(async () => {
      res = await result.current.validateCart(cartComItem, []);
    });

    expect(res).toEqual(validateResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/carrinho/validar");
    expect((init as any).method).toBe("POST");
    const body = JSON.parse((init as any).body);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe("331");
  });

  it("chamadas concorrentes: AMBAS retornam o resultado real (não null)", async () => {
    // Esse é o teste de regressão do bug de 2026-04-28.
    // Antes do fix, a 2a chamada caía num guard `isValidatingRef.current` e
    // retornava null. Em strict mode dev (React 18), isso fazia
    // refreshCartPrices abortar e o cart nunca sincronizava com o CMS.

    // Cada chamada tem seu próprio resolver — fetch fica "em voo" pra ambas
    // ao mesmo tempo, simulando o cenário concorrente real.
    const resolvers: Array<() => void> = [];
    const fetchMock = vi.fn(() => new Promise((resolve) => {
      resolvers.push(() => resolve({
        ok: true,
        json: async () => validateResponse,
      } as any));
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCartValidation());

    let res1: any, res2: any;
    await act(async () => {
      const p1 = result.current.validateCart(cartComItem, []);
      const p2 = result.current.validateCart(cartComItem, []);
      // Espera as 2 chegarem no fetch (microtask) antes de liberar.
      await Promise.resolve();
      await Promise.resolve();
      resolvers.forEach((r) => r());
      [res1, res2] = await Promise.all([p1, p2]);
    });

    expect(res1, "primeira chamada concorrente não pode retornar null").toEqual(validateResponse);
    expect(
      res2,
      "segunda chamada concorrente não pode retornar null — esse era o bug. " +
      "Se voltar a retornar null, significa que reintroduziram o ref-guard " +
      "que causava 'frete grudado em /cart' em strict mode.",
    ).toEqual(validateResponse);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("API retorna não-ok: validateCart devolve null e expõe error no state", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      json: async () => ({}),
    } as any));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCartValidation());
    let res: any;
    await act(async () => {
      res = await result.current.validateCart(cartComItem, []);
    });

    expect(res).toBeNull();
    await waitFor(() => expect(result.current.error).toBe("Erro ao validar carrinho"));
  });
});
