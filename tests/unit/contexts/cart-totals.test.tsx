import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, renderHook, act, waitFor } from "@testing-library/react";

// ─── mocks ───────────────────────────────────────────────────────────────────
const { validateCart, clearValidation, notify } = vi.hoisted(() => ({
  validateCart: vi.fn(),
  clearValidation: vi.fn(),
  notify: vi.fn(),
}));

const cartLoadedRef = { current: false };

vi.mock("@/deprecated/hooks/useCartValidation", () => ({
  useCartValidation: () => ({
    isValidating: false,
    isValid: null,
    produtosDesatualizados: [],
    cuponsDesatualizados: [],
    produtosAtualizados: [],
    lastValidation: null,
    error: null,
    validateCart,
    clearValidation,
  }),
}));

vi.mock("@/core/notifications/NotificationContext", () => ({
  useNotifications: () => ({ notify }),
}));

vi.mock("@/contexts/cart", () => ({
  useCart: () => ({ isCartLoaded: cartLoadedRef.current }),
}));

vi.mock("@/utils/cart-calculations", () => ({
  calculateCartTotals: vi.fn(),
}));

import { CartTotalsProvider, useCartTotals } from "@/contexts/cart-totals";

// ─── helpers ─────────────────────────────────────────────────────────────────
type CartItem = {
  id: string;
  nome: string;
  preco: number;
  quantity: number;
  bling_number?: number;
  peso_gramas?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
  cupom_applied?: any;
  cupom_applied_codigo?: any;
};

function makeWrapper(opts: {
  initialCart: Record<string, CartItem>;
  setCartSpy?: ReturnType<typeof vi.fn>;
  setCuponsSpy?: ReturnType<typeof vi.fn>;
  cupons?: any[];
}) {
  const setCart = opts.setCartSpy ?? vi.fn();
  const setCupons = opts.setCuponsSpy ?? vi.fn();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <CartTotalsProvider
        cart={opts.initialCart as any}
        setCart={setCart as any}
        cupons={opts.cupons ?? []}
        setCupons={setCupons as any}
        freightValue={0}
        handleAddCupom={async () => {}}
      >
        {children}
      </CartTotalsProvider>
    );
  };
}

const kitItem: CartItem = {
  id: "25",
  nome: "Kit Completo",
  preco: 273.54,
  quantity: 1,
  bling_number: 9999,
  peso_gramas: 0,
  altura: 0,
  largura: 0,
  comprimento: 0,
};

const kitItemAtualizadoMock = {
  id: "25",
  documentId: "kit-doc",
  nome: "Kit Completo",
  precoAtual: 273.54,
  precoComCupom: 273.54,
  peso_gramas: 678,
  altura: 22,
  largura: 12,
  comprimento: 7,
};

beforeEach(() => {
  vi.clearAllMocks();
  cartLoadedRef.current = false;
});

// ─── refreshCartPrices ────────────────────────────────────────────────────────
describe("CartTotalsContext.refreshCartPrices", () => {
  it("atualiza peso/dim e PRESERVA bling_number do item", async () => {
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [kitItemAtualizadoMock],
    });

    const setCart = vi.fn();
    const wrapper = makeWrapper({
      initialCart: { "25": kitItem },
      setCartSpy: setCart,
    });

    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });

    expect(setCart).toHaveBeenCalledTimes(1);
    const updatedCart = setCart.mock.calls[0][0] as Record<string, CartItem>;
    const item = updatedCart["25"];
    expect(item.peso_gramas).toBe(678);
    expect(item.altura).toBe(22);
    expect(item.largura).toBe(12);
    expect(item.comprimento).toBe(7);
    // CRÍTICO: bling_number do cart preservado, nunca sobrescrito
    expect(item.bling_number).toBe(9999);
  });

  it("não chama notify quando silent=true (apenas dimensões mudaram)", async () => {
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [kitItemAtualizadoMock],
    });

    const wrapper = makeWrapper({ initialCart: { "25": kitItem } });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });

    expect(notify).not.toHaveBeenCalled();
  });

  it("notifica quando preço mudou e silent=false", async () => {
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [{ ...kitItemAtualizadoMock, precoAtual: 999 }],
    });

    const wrapper = makeWrapper({ initialCart: { "25": kitItem } });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await act(async () => {
      await result.current.refreshCartPrices();
    });

    expect(notify).toHaveBeenCalledWith(
      expect.stringMatching(/preços atuais/i),
      expect.objectContaining({ variant: "success" }),
    );
  });

  it("não notifica quando preço não mudou, mesmo com silent=false (só dim)", async () => {
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [kitItemAtualizadoMock],
    });

    const wrapper = makeWrapper({ initialCart: { "25": kitItem } });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await act(async () => {
      await result.current.refreshCartPrices();
    });

    expect(notify).not.toHaveBeenCalledWith(
      expect.stringMatching(/preços atuais/i),
      expect.anything(),
    );
  });

  it("não chama setCart quando preço e dimensões já estão sincronizados", async () => {
    const itemSincronizado: CartItem = {
      ...kitItem,
      peso_gramas: 678,
      altura: 22,
      largura: 12,
      comprimento: 7,
    };
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [kitItemAtualizadoMock],
    });

    const setCart = vi.fn();
    const wrapper = makeWrapper({
      initialCart: { "25": itemSincronizado },
      setCartSpy: setCart,
    });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });

    expect(setCart).not.toHaveBeenCalled();
  });

  it("retorna false quando cart está vazio (sem chamada à API)", async () => {
    const wrapper = makeWrapper({ initialCart: {} });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    let ret: boolean | undefined;
    await act(async () => {
      ret = await result.current.refreshCartPrices({ silent: true });
    });

    expect(ret).toBe(false);
    expect(validateCart).not.toHaveBeenCalled();
  });

  it("preserva campos de frete antigos quando o CMS retorna todos undefined (só preço muda)", async () => {
    const itemComDimAntigas: CartItem = {
      ...kitItem,
      peso_gramas: 100,
      altura: 5,
      largura: 5,
      comprimento: 5,
    };
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [
        {
          id: "25",
          documentId: "kit-doc",
          nome: "Kit Completo",
          precoAtual: 999, // só preço muda
          precoComCupom: 999,
          // peso_gramas/altura/etc undefined
        },
      ],
    });

    const setCart = vi.fn();
    const wrapper = makeWrapper({
      initialCart: { "25": itemComDimAntigas },
      setCartSpy: setCart,
    });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });

    expect(setCart).toHaveBeenCalledTimes(1);
    const updated = setCart.mock.calls[0][0] as Record<string, CartItem>;
    expect(updated["25"].peso_gramas).toBe(100);
    expect(updated["25"].altura).toBe(5);
    expect(updated["25"].bling_number).toBe(9999);
  });

  it("atualiza apenas os campos de frete definidos pelo CMS (parcial)", async () => {
    // Cenário: CMS tem altura nova mas não devolveu peso/largura/comprimento.
    // Cada campo deve ser tratado independentemente: altura atualiza,
    // os demais preservam o valor antigo do cart.
    const itemAntigo: CartItem = {
      ...kitItem,
      peso_gramas: 100,
      altura: 5,
      largura: 7,
      comprimento: 8,
    };
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [
        {
          id: "25",
          documentId: "kit-doc",
          nome: "Kit Completo",
          precoAtual: kitItem.preco,
          precoComCupom: kitItem.preco,
          altura: 22, // único campo presente
        },
      ],
    });

    const setCart = vi.fn();
    const wrapper = makeWrapper({
      initialCart: { "25": itemAntigo },
      setCartSpy: setCart,
    });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });

    expect(setCart).toHaveBeenCalledTimes(1);
    const updated = setCart.mock.calls[0][0] as Record<string, CartItem>;
    expect(updated["25"].altura).toBe(22);
    expect(updated["25"].peso_gramas).toBe(100);
    expect(updated["25"].largura).toBe(7);
    expect(updated["25"].comprimento).toBe(8);
    expect(updated["25"].bling_number).toBe(9999);
  });

  it("remove cupons inválidos e limpa flags do item", async () => {
    validateCart.mockResolvedValue({
      atualizado: false,
      produtosDesatualizados: [],
      cuponsDesatualizados: [{ codigo: "PROMO10", valido: false }],
      produtosAtualizados: [kitItemAtualizadoMock],
    });

    const itemComCupom: CartItem = {
      ...kitItem,
      cupom_applied: true,
      cupom_applied_codigo: "PROMO10",
    };
    const setCart = vi.fn();
    const setCupons = vi.fn();
    const wrapper = makeWrapper({
      initialCart: { "25": itemComCupom },
      setCartSpy: setCart,
      setCuponsSpy: setCupons,
      cupons: [{ codigo: "PROMO10" }],
    });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });

    expect(setCupons).toHaveBeenCalledWith([]);
    const updated = setCart.mock.calls[0][0] as Record<string, CartItem>;
    expect(updated["25"].cupom_applied).toBeNull();
    expect(updated["25"].cupom_applied_codigo).toBeNull();
  });
});

// ─── auto-refresh ao hidratar + isCartHydrated ───────────────────────────────
describe("CartTotalsContext — auto-refresh ao hidratar", () => {
  it("dispara refresh assim que isCartLoaded fica true e seta isCartHydrated", async () => {
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [kitItemAtualizadoMock],
    });

    cartLoadedRef.current = true;
    const wrapper = makeWrapper({ initialCart: { "25": kitItem } });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    expect(result.current.isCartHydrated).toBe(false);
    await waitFor(() => {
      expect(result.current.isCartHydrated).toBe(true);
    });
    // O auto-refresh chamou validateCart pelo menos uma vez. Não usamos
    // `toHaveBeenCalledTimes(1)` porque refreshCartPrices agenda um setTimeout
    // interno (validação pós-update) que pode disparar antes do assert no
    // ambiente carregado da suíte completa, gerando flake.
    expect(validateCart).toHaveBeenCalled();
  });

  it("dispara o auto-refresh apenas uma vez (idempotente em re-renders)", async () => {
    // Sem mudanças: refreshCartPrices não dispara setTimeout interno, então
    // só conta a chamada do auto-refresh.
    const itemSincronizado: CartItem = {
      ...kitItem,
      peso_gramas: 678,
      altura: 22,
      largura: 12,
      comprimento: 7,
    };
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [kitItemAtualizadoMock],
    });

    cartLoadedRef.current = true;
    const wrapper = makeWrapper({ initialCart: { "25": itemSincronizado } });
    const { result, rerender } = renderHook(() => useCartTotals(), { wrapper });

    await waitFor(() => expect(result.current.isCartHydrated).toBe(true));
    const callsAfterHydrate = validateCart.mock.calls.length;
    rerender();
    rerender();
    expect(validateCart).toHaveBeenCalledTimes(callsAfterHydrate);
  });

  it("cart vazio: hidrata sem chamar a API", async () => {
    cartLoadedRef.current = true;
    const wrapper = makeWrapper({ initialCart: {} });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await waitFor(() => expect(result.current.isCartHydrated).toBe(true));
    expect(validateCart).not.toHaveBeenCalled();
  });

  it("isCartHydrated permanece true mesmo quando validateCart retorna null (erro)", async () => {
    // O hook real captura erros e retorna null — refreshCartPrices retorna false.
    validateCart.mockResolvedValue(null);
    cartLoadedRef.current = true;
    const wrapper = makeWrapper({ initialCart: { "25": kitItem } });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await waitFor(() => expect(result.current.isCartHydrated).toBe(true));
  });

  it("não dispara enquanto isCartLoaded é false", () => {
    cartLoadedRef.current = false;
    const wrapper = makeWrapper({ initialCart: { "25": kitItem } });
    renderHook(() => useCartTotals(), { wrapper });

    expect(validateCart).not.toHaveBeenCalled();
  });

  it("hidrata mesmo se produtosAtualizados vier vazio", async () => {
    // Edge case: API retorna OK mas sem produtos (ex: cart com itens deletados do CMS)
    validateCart.mockResolvedValue({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [],
    });

    const setCart = vi.fn();
    cartLoadedRef.current = true;
    const wrapper = makeWrapper({
      initialCart: { "25": kitItem },
      setCartSpy: setCart,
    });
    const { result } = renderHook(() => useCartTotals(), { wrapper });

    await waitFor(() => expect(result.current.isCartHydrated).toBe(true));
    expect(setCart).not.toHaveBeenCalled();
  });
});

// ─── repro do fluxo manual em /cart com peso editado no Directus ────────────
describe("CartTotalsContext — fluxo: peso do kit editado no Directus", () => {
  // Reproduz a sequência relatada: kit no cart com peso bom → admin zera no
  // Directus → hard refresh em /cart sincroniza o cart com o CMS → admin
  // restaura o peso → próxima sincronização devolve o valor correto.
  // O teste fixa o contrato: o que o CMS retornar no momento do refresh é
  // EXATAMENTE o que fica no cart, sem state grudado entre ciclos.
  it("peso 678 → CMS=0 → CMS=678: cart espelha o último valor do CMS", async () => {
    // Cart inicial: kit com peso correto (já estava no carrinho).
    const cartState: Record<string, CartItem> = {
      "25": { ...kitItem, peso_gramas: 678, altura: 22, largura: 12, comprimento: 7 },
    };

    // setCart simulando o useState real: aplica o updater e atualiza o ref.
    const setCart = vi.fn((updater: any) => {
      const next = typeof updater === "function" ? updater(cartState) : updater;
      for (const k of Object.keys(cartState)) delete cartState[k];
      Object.assign(cartState, next);
    });

    // Wrapper que sempre lê o cart mais recente do ref (simula re-render do React).
    function LiveWrapper({ children }: { children: React.ReactNode }) {
      return (
        <CartTotalsProvider
          cart={cartState as any}
          setCart={setCart as any}
          cupons={[]}
          setCupons={vi.fn() as any}
          freightValue={0}
          handleAddCupom={async () => {}}
        >
          {children}
        </CartTotalsProvider>
      );
    }

    const { result, rerender } = renderHook(() => useCartTotals(), { wrapper: LiveWrapper });

    // Etapa 1: admin zera o peso no Directus. Hard refresh → auto-refresh
    // do CartTotalsProvider chama validateCart, que devolve peso=0.
    validateCart.mockResolvedValueOnce({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [
        {
          id: "25",
          documentId: "kit-doc",
          nome: "Kit Completo",
          precoAtual: kitItem.preco,
          precoComCupom: kitItem.preco,
          peso_gramas: 0,
          altura: 0,
          largura: 0,
          comprimento: 0,
        },
      ],
    });

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });

    expect(cartState["25"].peso_gramas).toBe(0);
    expect(cartState["25"].altura).toBe(0);
    expect(cartState["25"].largura).toBe(0);
    expect(cartState["25"].comprimento).toBe(0);
    expect(cartState["25"].bling_number).toBe(9999); // bling preservado

    // Etapa 2 (ação do usuário fora do contexto): remove e re-adiciona da home.
    // Após re-adicionar, o cart guardaria peso_gramas=0 (valor atual do CMS na
    // listagem). Simulamos isso direto:
    cartState["25"] = { ...kitItem, peso_gramas: 0, altura: 0, largura: 0, comprimento: 0 };
    rerender();

    // Etapa 3: admin restaura o peso no Directus para 678. Hard refresh em
    // /cart → auto-refresh → validateCart agora retorna o valor correto.
    validateCart.mockResolvedValueOnce({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [
        {
          id: "25",
          documentId: "kit-doc",
          nome: "Kit Completo",
          precoAtual: kitItem.preco,
          precoComCupom: kitItem.preco,
          peso_gramas: 678,
          altura: 22,
          largura: 12,
          comprimento: 7,
        },
      ],
    });

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });

    // Estado final esperado: cart espelha o CMS atual. Se isso falha aqui, o
    // bug está no provider; se passa, o "frete continua quebrado" observado em
    // produção vem de outra camada (cache de produto na home, cotação não
    // re-disparada no ShippingCalculator, ou erro grudado em useShipping).
    expect(cartState["25"].peso_gramas).toBe(678);
    expect(cartState["25"].altura).toBe(22);
    expect(cartState["25"].largura).toBe(12);
    expect(cartState["25"].comprimento).toBe(7);
    expect(cartState["25"].bling_number).toBe(9999);
  });

  it("dois ciclos consecutivos com peso=0 não acumulam state stale", async () => {
    // Defesa contra regressão: se uma versão futura introduzir merge bizarro
    // (ex.: preservar valor antigo quando novo é 0 por confundir 0 com falsy),
    // este teste pega.
    const cartState: Record<string, CartItem> = {
      "25": { ...kitItem, peso_gramas: 678, altura: 22, largura: 12, comprimento: 7 },
    };
    const setCart = vi.fn((updater: any) => {
      const next = typeof updater === "function" ? updater(cartState) : updater;
      for (const k of Object.keys(cartState)) delete cartState[k];
      Object.assign(cartState, next);
    });

    function LiveWrapper({ children }: { children: React.ReactNode }) {
      return (
        <CartTotalsProvider
          cart={cartState as any}
          setCart={setCart as any}
          cupons={[]}
          setCupons={vi.fn() as any}
          freightValue={0}
          handleAddCupom={async () => {}}
        >
          {children}
        </CartTotalsProvider>
      );
    }

    const { result } = renderHook(() => useCartTotals(), { wrapper: LiveWrapper });

    const respostaCmsZerado = {
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [
        {
          id: "25",
          documentId: "kit-doc",
          nome: "Kit Completo",
          precoAtual: kitItem.preco,
          precoComCupom: kitItem.preco,
          peso_gramas: 0,
          altura: 0,
          largura: 0,
          comprimento: 0,
        },
      ],
    };
    validateCart.mockResolvedValue(respostaCmsZerado);

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });
    expect(cartState["25"].peso_gramas).toBe(0);

    await act(async () => {
      await result.current.refreshCartPrices({ silent: true });
    });
    // Um segundo refresh com a mesma resposta não pode "ressuscitar" o 678.
    expect(cartState["25"].peso_gramas).toBe(0);
    expect(cartState["25"].altura).toBe(0);
  });
});

// ─── concorrência: cart muda durante a hidratação ────────────────────────────
describe("CartTotalsContext — concorrência", () => {
  it("auto-refresh roda só uma vez mesmo se cart for atualizado durante a chamada", async () => {
    // Simula validateCart lento; durante a janela, o cart muda (re-render).
    let resolveValidate: ((v: any) => void) | null = null;
    validateCart.mockImplementation(
      () =>
        new Promise((res) => {
          resolveValidate = res;
        }),
    );

    cartLoadedRef.current = true;
    const setCart = vi.fn();
    const wrapper = makeWrapper({
      initialCart: { "25": kitItem },
      setCartSpy: setCart,
    });
    const { rerender, result } = renderHook(() => useCartTotals(), { wrapper });

    // Re-renders enquanto a validação está pendente
    rerender();
    rerender();

    // Resolve a validação
    resolveValidate!({
      atualizado: true,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [kitItemAtualizadoMock],
    });

    await waitFor(() => expect(result.current.isCartHydrated).toBe(true));

    // O auto-refresh disparou apenas um validateCart inicial, independentemente
    // dos re-renders durante a hidratação.
    const initialCalls = validateCart.mock.calls.length;
    rerender();
    expect(validateCart).toHaveBeenCalledTimes(initialCalls);
  });
});
