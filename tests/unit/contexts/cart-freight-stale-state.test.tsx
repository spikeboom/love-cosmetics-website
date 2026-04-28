/**
 * Repro do bug observado em /cart no fluxo:
 *   1. Item no cart com peso correto.
 *   2. Admin altera peso_gramas no Directus.
 *   3. Hard refresh em /cart → auto-refresh do CartTotalsProvider chama
 *      /api/carrinho/validar (que devolve o peso novo).
 *   4. Esperado: localStorage["cart"] passa a refletir o peso novo.
 *      Observado: localStorage["cart"] continua com o peso antigo.
 *
 * Este arquivo monta CartProvider + CartTotalsProvider de verdade (sem mockar
 * useCart) e exercita o caminho state→useEffect→localStorage que os testes
 * em cart-totals.test.tsx não cobrem por mockarem setCart como vi.fn().
 *
 * Reprodução manual em 2026-04-28 (Chrome MCP, http://127.0.0.1:3000/cart com
 * Directus de dev): após hard refresh, fetch('/api/carrinho/validar') devolveu
 * peso_gramas=0 (valor atual do CMS), mas localStorage.cart manteve o peso
 * antigo injetado manualmente (999) e o pré-existente (443) — em nenhum dos
 * dois ciclos a persistência refletiu o que a API retornou.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";

// Mock do hook de notificações pra não exigir SnackbarProvider/NotificationProvider.
vi.mock("@/core/notifications/NotificationContext", () => ({
  useNotifications: () => ({ notify: vi.fn(), enqueueSnackbar: vi.fn(), closeSnackbar: vi.fn() }),
}));

import { CartProvider, useCart } from "@/contexts/cart";
import { CartTotalsProvider, useCartTotals } from "@/contexts/cart-totals";

const KIT_USO_DIARIO = {
  id: "331",
  documentId: "z2ymswculwwn411yirr8jhn1",
  nome: "Kit Uso Diário",
  preco: 159.44,
  quantity: 1,
};

function readCartFromLocalStorage() {
  const raw = localStorage.getItem("cart");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function CartTotalsBridge({ children, cupons }: { children: React.ReactNode; cupons: any[] }) {
  // CartTotalsProvider precisa de cart/setCart vindos de useCart, e mais um par
  // setCupons que não usamos aqui. Espelha o uso real no layout.
  const { cart, setCart } = useCart();
  return (
    <CartTotalsProvider
      cart={cart}
      setCart={setCart as any}
      cupons={cupons}
      setCupons={(() => {}) as any}
      freightValue={0}
      handleAddCupom={async () => {}}
    >
      {children}
    </CartTotalsProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("repro: cart no localStorage não atualiza após auto-refresh", () => {
  it("hard refresh com peso antigo no LS e CMS retornando peso novo: LS deve refletir o CMS", async () => {
    // Pré-condição: cart existente no localStorage com peso desatualizado
    // (cenário equivalente a "usuário tinha o kit no cart, admin mudou o peso
    // no Directus depois").
    const PESO_ANTIGO_NO_CART = 999;
    const ALTURA_ANTIGA_NO_CART = 99;
    localStorage.setItem("cart", JSON.stringify({
      [KIT_USO_DIARIO.id]: {
        ...KIT_USO_DIARIO,
        peso_gramas: PESO_ANTIGO_NO_CART,
        altura: ALTURA_ANTIGA_NO_CART,
        largura: 99,
        comprimento: 99,
      },
    }));

    // Mock de /api/carrinho/validar — devolve o estado atual do CMS.
    const PESO_NOVO_NO_CMS = 443;
    const fetchMock = vi.fn(async (url: any) => {
      const u = String(url);
      if (u.includes("/api/carrinho/validar")) {
        return {
          ok: true,
          json: async () => ({
            atualizado: true,
            produtosDesatualizados: [],
            cuponsDesatualizados: [],
            produtosAtualizados: [{
              id: KIT_USO_DIARIO.id,
              documentId: KIT_USO_DIARIO.documentId,
              nome: KIT_USO_DIARIO.nome,
              precoAtual: KIT_USO_DIARIO.preco,
              precoComCupom: KIT_USO_DIARIO.preco,
              peso_gramas: PESO_NOVO_NO_CMS,
              altura: 22,
              largura: 10,
              comprimento: 6,
            }],
          }),
        } as any;
      }
      throw new Error(`fetch não mockado: ${u}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    // Sonda interna pra esperar o auto-refresh terminar.
    function HydrationProbe({ onHydrated }: { onHydrated: () => void }) {
      const { isCartHydrated } = useCartTotals();
      React.useEffect(() => { if (isCartHydrated) onHydrated(); }, [isCartHydrated, onHydrated]);
      return null;
    }

    let hydrated = false;
    await act(async () => {
      render(
        <CartProvider>
          <CartTotalsBridge cupons={[]}>
            <HydrationProbe onHydrated={() => { hydrated = true; }} />
          </CartTotalsBridge>
        </CartProvider>
      );
    });

    await waitFor(() => expect(hydrated).toBe(true), { timeout: 2000 });

    // Confirma que o auto-refresh chamou /api/carrinho/validar — sem isso o
    // teste valida nada.
    expect(fetchMock).toHaveBeenCalled();
    const validateCalls = fetchMock.mock.calls.filter(c => String(c[0]).includes("/api/carrinho/validar"));
    expect(validateCalls.length).toBeGreaterThan(0);

    // O contrato esperado: depois do auto-refresh + persistência via
    // calculateCartTotals, o cart no localStorage tem que refletir o CMS.
    // Se este expect falhar, é o bug observado em produção.
    const cartFinal = readCartFromLocalStorage();
    const item = cartFinal[KIT_USO_DIARIO.id];
    expect(item, "kit precisa continuar no cart").toBeDefined();

    expect(
      item.peso_gramas,
      `BUG: localStorage.cart["${KIT_USO_DIARIO.id}"].peso_gramas ainda é ${item.peso_gramas} ` +
      `(esperado ${PESO_NOVO_NO_CMS}, valor que /api/carrinho/validar retornou). ` +
      `O auto-refresh do CartTotalsProvider obteve o peso novo mas não conseguiu ` +
      `persistir no localStorage.`,
    ).toBe(PESO_NOVO_NO_CMS);

    expect(item.altura).toBe(22);
    expect(item.largura).toBe(10);
    expect(item.comprimento).toBe(6);
  });

  it("ref guard: se autoRefresh vê cart vazio antes do CartProvider hidratar, NÃO trava o refresh quando cart aparecer", async () => {
    // Hipótese principal sobre o bug observado em produção: quando
    // CartProvider hidrata, ele faz setCart(...) e setIsCartLoaded(true) no
    // mesmo useEffect. Em React 18 com batching/concurrent rendering, há um
    // intervalo onde isCartLoaded já virou true mas cart ainda é {} no render
    // que o CartTotalsProvider observa. Nesse render, o useEffect do auto-
    // refresh roda, vê cart vazio, marca autoRefreshTriggeredRef.current=true,
    // seta isCartHydrated=true e retorna sem chamar a API. Quando o cart
    // populado chega no próximo render, o ref já está locked e o auto-refresh
    // nunca mais roda, ficando para sempre com o cart antigo do localStorage.
    //
    // Cenário do teste: simulamos esse intervalo controlando manualmente o
    // localStorage e o momento em que o cart aparece.

    // localStorage tem cart com peso desatualizado
    localStorage.setItem("cart", JSON.stringify({
      [KIT_USO_DIARIO.id]: {
        ...KIT_USO_DIARIO,
        peso_gramas: 100,
        altura: 5,
        largura: 5,
        comprimento: 5,
      },
    }));

    let validateCalls = 0;
    const fetchMock = vi.fn(async (url: any) => {
      if (String(url).includes("/api/carrinho/validar")) {
        validateCalls++;
        return {
          ok: true,
          json: async () => ({
            atualizado: true,
            produtosDesatualizados: [],
            cuponsDesatualizados: [],
            produtosAtualizados: [{
              id: KIT_USO_DIARIO.id,
              documentId: KIT_USO_DIARIO.documentId,
              nome: KIT_USO_DIARIO.nome,
              precoAtual: KIT_USO_DIARIO.preco,
              precoComCupom: KIT_USO_DIARIO.preco,
              peso_gramas: 443,
              altura: 22,
              largura: 10,
              comprimento: 6,
            }],
          }),
        } as any;
      }
      throw new Error(`fetch não mockado: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    function HydrationProbe({ onHydrated }: { onHydrated: () => void }) {
      const { isCartHydrated } = useCartTotals();
      React.useEffect(() => { if (isCartHydrated) onHydrated(); }, [isCartHydrated, onHydrated]);
      return null;
    }

    let hydrated = false;
    await act(async () => {
      render(
        <CartProvider>
          <CartTotalsBridge cupons={[]}>
            <HydrationProbe onHydrated={() => { hydrated = true; }} />
          </CartTotalsBridge>
        </CartProvider>
      );
    });

    await waitFor(() => expect(hydrated).toBe(true), { timeout: 2000 });

    // Contrato: o auto-refresh tem que ter chamado a API pelo menos uma vez,
    // já que havia item no localStorage no momento do mount. Se este expect
    // falhar, é exatamente o bug do ref guard travado: cart vazio no primeiro
    // render trava o ref e nada mais roda.
    expect(
      validateCalls,
      "auto-refresh nunca chamou /api/carrinho/validar — provável que o ref " +
      "guard tenha travado em um render onde cart ainda era {} (race entre " +
      "setCart e setIsCartLoaded do CartProvider hidratando do localStorage).",
    ).toBeGreaterThan(0);

    expect(readCartFromLocalStorage()[KIT_USO_DIARIO.id].peso_gramas).toBe(443);
  });

  it("validateCart retornando null: cart NÃO é alterado, peso antigo no LS é preservado", async () => {
    // Contrato do refreshCartPrices: se o validateCart falhar (rede off,
    // 5xx, etc.), o cart antigo continua válido — não devemos sobrescrever
    // pra estado inconsistente. Esse teste documenta esse contrato.
    //
    // Importante: garante que o early-return `if (!result) return false`
    // do refreshCartPrices não vai ser confundido com "tudo OK, não fez
    // nada". O cart preserva o que estava no LS.
    const PESO_ANTIGO = 555;
    localStorage.setItem("cart", JSON.stringify({
      [KIT_USO_DIARIO.id]: {
        ...KIT_USO_DIARIO,
        peso_gramas: PESO_ANTIGO,
        altura: 11,
        largura: 11,
        comprimento: 11,
      },
    }));

    // Mock que faz a API falhar — fetch retorna response.ok=false, então o
    // useCartValidation devolve null.
    const fetchMock = vi.fn(async (url: any) => {
      if (String(url).includes("/api/carrinho/validar")) {
        return { ok: false, json: async () => ({}) } as any;
      }
      throw new Error(`fetch não mockado: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    function HydrationProbe({ onHydrated }: { onHydrated: () => void }) {
      const { isCartHydrated } = useCartTotals();
      React.useEffect(() => { if (isCartHydrated) onHydrated(); }, [isCartHydrated, onHydrated]);
      return null;
    }

    let hydrated = false;
    await act(async () => {
      render(
        <CartProvider>
          <CartTotalsBridge cupons={[]}>
            <HydrationProbe onHydrated={() => { hydrated = true; }} />
          </CartTotalsBridge>
        </CartProvider>
      );
    });

    await waitFor(() => expect(hydrated).toBe(true), { timeout: 2000 });

    // Auto-refresh tentou (validateCalls > 0), mas falhou; cart preserva o
    // peso antigo do localStorage.
    const validateCalls = fetchMock.mock.calls.filter(c => String(c[0]).includes("/api/carrinho/validar"));
    expect(validateCalls.length).toBeGreaterThan(0);

    const item = readCartFromLocalStorage()[KIT_USO_DIARIO.id];
    expect(
      item.peso_gramas,
      "Quando validateCart falha, o cart no LS deve manter o peso antigo " +
      "(não pode virar 0/undefined/null).",
    ).toBe(PESO_ANTIGO);
  });

  it("dois auto-refreshes consecutivos: o segundo respeita o último valor do CMS", async () => {
    // Refresh 1 grava peso=A. Refresh 2 (depois de remontar) precisa ler peso=A
    // e gravar peso=B. Se houver state stale, o segundo refresh regrava A
    // mesmo o CMS dizendo B.
    localStorage.setItem("cart", JSON.stringify({
      [KIT_USO_DIARIO.id]: {
        ...KIT_USO_DIARIO,
        peso_gramas: 100,
        altura: 5,
        largura: 5,
        comprimento: 5,
      },
    }));

    let cmsPeso = 200;
    const fetchMock = vi.fn(async (url: any) => {
      if (String(url).includes("/api/carrinho/validar")) {
        return {
          ok: true,
          json: async () => ({
            atualizado: true,
            produtosDesatualizados: [],
            cuponsDesatualizados: [],
            produtosAtualizados: [{
              id: KIT_USO_DIARIO.id,
              documentId: KIT_USO_DIARIO.documentId,
              nome: KIT_USO_DIARIO.nome,
              precoAtual: KIT_USO_DIARIO.preco,
              precoComCupom: KIT_USO_DIARIO.preco,
              peso_gramas: cmsPeso,
              altura: 22,
              largura: 10,
              comprimento: 6,
            }],
          }),
        } as any;
      }
      throw new Error(`fetch não mockado: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    function HydrationProbe({ onHydrated }: { onHydrated: () => void }) {
      const { isCartHydrated } = useCartTotals();
      React.useEffect(() => { if (isCartHydrated) onHydrated(); }, [isCartHydrated, onHydrated]);
      return null;
    }

    // Primeiro mount → auto-refresh deve gravar peso=200 no LS.
    let hydrated1 = false;
    let unmount1: () => void = () => {};
    await act(async () => {
      const r = render(
        <CartProvider>
          <CartTotalsBridge cupons={[]}>
            <HydrationProbe onHydrated={() => { hydrated1 = true; }} />
          </CartTotalsBridge>
        </CartProvider>
      );
      unmount1 = r.unmount;
    });
    await waitFor(() => expect(hydrated1).toBe(true), { timeout: 2000 });
    expect(readCartFromLocalStorage()[KIT_USO_DIARIO.id].peso_gramas).toBe(200);

    // Desmonta → CMS muda → segundo mount precisa pegar o novo valor.
    unmount1();
    cmsPeso = 443;

    let hydrated2 = false;
    await act(async () => {
      render(
        <CartProvider>
          <CartTotalsBridge cupons={[]}>
            <HydrationProbe onHydrated={() => { hydrated2 = true; }} />
          </CartTotalsBridge>
        </CartProvider>
      );
    });
    await waitFor(() => expect(hydrated2).toBe(true), { timeout: 2000 });

    const peso2 = readCartFromLocalStorage()[KIT_USO_DIARIO.id].peso_gramas;
    expect(
      peso2,
      `BUG (etapa 6 do fluxo manual): após segundo hard refresh, cart deveria ` +
      `refletir o peso restaurado no CMS (443), mas continua ${peso2}.`,
    ).toBe(443);
  });
});
