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
let cartTotalsThrows = false;

vi.mock("@/contexts", () => ({
  useCart: () => ({ cart: cartRef.current }),
  useShipping: () => ({
    cep: cepRef.current,
    setCep: (v: string) => {
      cepRef.current = v;
    },
    isLoading: false,
    error: null,
    calculateFreight: calculateFreightSpy,
    hasCalculated: false,
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
