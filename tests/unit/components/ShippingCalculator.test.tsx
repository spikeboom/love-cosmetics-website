import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";

// ─── refs mutáveis dos hooks mockados ────────────────────────────────────────
const cartRef = { current: {} as Record<string, any> };
const cepRef = { current: "" };
const calculateFreightSpy = vi.fn();
const cartTotalsRef = {
  current: { subtotalAfterCoupons: 0, isCartHydrated: false },
};
const shippingStateRef = {
  current: { hasCalculated: false, error: null as string | null },
};
let cartTotalsThrows = false;

vi.mock("@/contexts", () => ({
  useCart: () => ({ cart: cartRef.current }),
  useShipping: () => ({
    cep: cepRef.current,
    setCep: (v: string) => {
      cepRef.current = v;
    },
    isLoading: false,
    error: shippingStateRef.current.error,
    calculateFreight: calculateFreightSpy,
    hasCalculated: shippingStateRef.current.hasCalculated,
    availableServices: [],
    setSelectedFreight: vi.fn(),
    resetFreight: vi.fn(),
    selectedServiceIndex: 0,
    addressLabel: null,
  }),
}));

vi.mock("@/contexts/cart-totals/CartTotalsContext", () => ({
  useCartTotals: () => {
    if (cartTotalsThrows) throw new Error("no provider");
    return cartTotalsRef.current;
  },
}));

vi.mock("@/contexts/LojaConfigContext", () => ({
  useLojaConfig: () => ({ freteGratisValor: 200 }),
}));

vi.mock("@/hooks/useFreeShipping", () => ({
  useFreeShipping: () => ({
    qualifies: false,
    economicaIndex: null,
    economicaOriginalPrice: null,
    amountRemaining: 0,
    progressPercent: 0,
  }),
}));

vi.mock("@/core/pricing/shipping-constants", () => ({
  isEconomicaService: () => false,
}));

vi.mock("@/components/figma-shared", () => ({
  FreightOptions: () => null,
}));

vi.mock("@/components/figma-shared/FreeShippingBanner", () => ({
  FreeShippingBanner: () => null,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: () => null,
}));

import { ShippingCalculator } from "@/app/(figma)/(main)/figma/components/ShippingCalculator";

const fallbackProduct = {
  quantity: 1,
  peso_gramas: 200,
  altura: 10,
  largura: 10,
  comprimento: 10,
  preco: 50,
};

beforeEach(() => {
  vi.clearAllMocks();
  cartRef.current = {};
  cepRef.current = "";
  cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: false };
  shippingStateRef.current = { hasCalculated: false, error: null };
  cartTotalsThrows = false;
});

// ─── gating por isCartHydrated ───────────────────────────────────────────────
describe("ShippingCalculator — gating por isCartHydrated", () => {
  it("não dispara cotação automática quando isCartHydrated=false (CEP completo)", () => {
    cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: false };
    cepRef.current = "01310100"; // 8 dígitos

    render(<ShippingCalculator fallbackProduct={fallbackProduct} />);

    expect(calculateFreightSpy).not.toHaveBeenCalled();
  });

  it("dispara cotação automática quando isCartHydrated=true e CEP tem 8 dígitos", () => {
    cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: true };
    cepRef.current = "01310100";

    render(<ShippingCalculator fallbackProduct={fallbackProduct} />);

    expect(calculateFreightSpy).toHaveBeenCalledTimes(1);
    expect(calculateFreightSpy).toHaveBeenCalledWith(
      "01310100",
      expect.any(Array),
      expect.objectContaining({ silent: true }),
    );
  });

  it("botão Calcular fica desabilitado enquanto isCartHydrated=false", () => {
    cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: false };
    cepRef.current = "01310100";

    const { getByRole } = render(
      <ShippingCalculator fallbackProduct={fallbackProduct} />,
    );
    const btn = getByRole("button", { name: /Calcular/i });
    expect(btn).toBeDisabled();
  });

  it("botão Calcular fica habilitado quando isCartHydrated=true e CEP tem 8 dígitos", () => {
    cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: true };
    cepRef.current = "01310100";

    const { getByRole } = render(
      <ShippingCalculator fallbackProduct={fallbackProduct} />,
    );
    // O auto-cálculo já disparou, mas o botão continua habilitado
    const btn = getByRole("button", { name: /Calcular/i });
    expect(btn).not.toBeDisabled();
  });

  it("clique no botão Calcular dispara handleCalculate quando hidratado", () => {
    cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: true };
    cepRef.current = "01310100";

    const { getByRole } = render(
      <ShippingCalculator fallbackProduct={fallbackProduct} />,
    );
    calculateFreightSpy.mockClear();
    fireEvent.click(getByRole("button", { name: /Calcular/i }));
    expect(calculateFreightSpy).toHaveBeenCalled();
    // handleCalculate é não silencioso
    const lastCall = calculateFreightSpy.mock.calls.at(-1);
    expect(lastCall?.[2]).toBeUndefined();
  });
});

// ─── default true sem CartTotalsProvider ─────────────────────────────────────
describe("ShippingCalculator — sem CartTotalsProvider", () => {
  it("default isCartHydrated=true não bloqueia cotação automática", () => {
    cartTotalsThrows = true;
    cepRef.current = "01310100";

    render(<ShippingCalculator fallbackProduct={fallbackProduct} />);

    expect(calculateFreightSpy).toHaveBeenCalledTimes(1);
  });
});

// ─── BUG: erro de cotação fica preso após cart ser atualizado ────────────────
describe("ShippingCalculator — re-cotação após cart atualizar (BUG conhecido)", () => {
  it("re-dispara cotação quando cart muda, mesmo que primeira cotação tenha falhado", () => {
    // Cenário real do bug:
    // 1. Cart antigo no localStorage tem kit com peso 0 (Directus tinha peso 0 quando user adicionou).
    // 2. Auto-refresh do CartTotals corrige cart pra peso 443 — mas isso é assíncrono.
    // 3. Quando isCartHydrated vira true, ShippingCalculator dispara cotação automática.
    //    Se isso acontecer ANTES do setCart re-renderizar, a primeira cotação usa cart velho (peso 0).
    // 4. API retorna 400, error="Dados de frete invalidos", hasCalculated=false.
    // 5. Cart é finalmente atualizado para peso 443 → cartFreightKey muda.
    // 6. useEffect [cartFreightKey, isCartHydrated] dispara, MAS o guard "if (cep && hasCalculated)"
    //    bloqueia a re-cotação porque hasCalculated continua false.
    // 7. Resultado: erro fica preso na UI mesmo com cart correto.

    // Estado inicial: cart velho (peso=0), CEP do localStorage, hidratado.
    cartRef.current = {
      kit: {
        id: "kit",
        nome: "Kit Uso Diário",
        slug: "kit-uso-diario",
        quantity: 1,
        preco: 159.44,
        peso_gramas: 0,
        altura: 0,
        largura: 0,
        comprimento: 0,
      },
    };
    cepRef.current = "01310100";
    cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: true };

    const { rerender } = render(<ShippingCalculator />);

    // useEffect dispara cotação automática (silent) com cart velho
    expect(calculateFreightSpy).toHaveBeenCalledTimes(1);
    const firstCallItems = calculateFreightSpy.mock.calls[0][1];
    expect(firstCallItems[0].peso_gramas).toBe(0);

    // Backend retornou 400 — useShipping seta error e hasCalculated continua false.
    shippingStateRef.current = {
      hasCalculated: false,
      error: "Dados de frete invalidos",
    };

    // Agora o auto-refresh do CartTotalsProvider termina e atualiza o cart.
    cartRef.current = {
      kit: {
        ...cartRef.current.kit,
        peso_gramas: 443,
        altura: 22,
        largura: 10,
        comprimento: 6,
      },
    };
    rerender(<ShippingCalculator />);

    // ✅ COMPORTAMENTO CORRETO (após fix): cotação re-dispara com cart corrigido.
    expect(calculateFreightSpy).toHaveBeenCalledTimes(2);
    const secondCallItems = calculateFreightSpy.mock.calls[1][1];
    expect(secondCallItems[0].peso_gramas).toBe(443);
  });

  it("cotação anterior OK: cart muda → re-cota silenciosamente (caminho clássico)", () => {
    cartRef.current = {
      kit: {
        id: "kit",
        nome: "Kit Uso Diário",
        slug: "kit-uso-diario",
        quantity: 1,
        preco: 159.44,
        peso_gramas: 443,
        altura: 22,
        largura: 10,
        comprimento: 6,
      },
    };
    cepRef.current = "01310100";
    cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: true };
    // Cotação inicial bem sucedida.
    shippingStateRef.current = { hasCalculated: true, error: null };

    const { rerender } = render(<ShippingCalculator />);
    // Primeira render com hasCalculated=true: o useEffect [cartFreightKey, isCartHydrated]
    // dispara um recálculo silencioso (comportamento histórico — quando a página remonta
    // com cotação prévia conhecida, o frete é re-validado).
    const initialCalls = calculateFreightSpy.mock.calls.length;

    // User aumenta quantidade do kit no cart.
    cartRef.current = {
      kit: { ...cartRef.current.kit, quantity: 2 },
    };
    rerender(<ShippingCalculator />);

    // Mais uma chamada disparou (silent) por causa da mudança de quantity.
    expect(calculateFreightSpy.mock.calls.length).toBeGreaterThan(initialCalls);
    const lastCall = calculateFreightSpy.mock.calls.at(-1);
    expect(lastCall?.[2]).toEqual({ silent: true });
  });

  it("regressão: primeira render com cart populado não dispara cotação 2x", () => {
    // Defesa contra regressão: ao incluir peso/dim no cartFreightKey e relaxar o
    // guard, o useEffect [cartFreightKey, isCartHydrated] poderia disparar junto
    // com o useEffect [cep, isCartHydrated] na primeira render. Esse teste garante
    // que apenas um dispara (o da cotação inicial).
    cartRef.current = {
      kit: {
        id: "kit",
        nome: "Kit Uso Diário",
        slug: "kit-uso-diario",
        quantity: 1,
        preco: 159.44,
        peso_gramas: 443,
        altura: 22,
        largura: 10,
        comprimento: 6,
      },
    };
    cepRef.current = "01310100";
    cartTotalsRef.current = { subtotalAfterCoupons: 0, isCartHydrated: true };
    shippingStateRef.current = { hasCalculated: false, error: null };

    render(<ShippingCalculator />);

    // Apenas 1 chamada — a do useEffect [cep, isCartHydrated].
    // Se virar 2, é sinal de que o useEffect [cartFreightKey, isCartHydrated]
    // ficou disparando na primeira render também (regressão).
    expect(calculateFreightSpy).toHaveBeenCalledTimes(1);
  });
});
