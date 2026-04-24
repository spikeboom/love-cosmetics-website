import { describe, it, expect } from "vitest";
import {
  calculateOrderTotals,
  centsToReais,
} from "@/core/pricing/order-totals";
import {
  applyKitDiscountFromFinalPrice,
  getKitComponentSlugs,
  getKitDiscount,
  KIT_COMPONENTS,
} from "@/core/pricing/kits";

describe("calculateOrderTotals", () => {
  it("subtotal = preco x qty, sem cupom, sem frete", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 50, quantity: 2 }, { preco: 30, quantity: 1 }],
      cupons: [],
      frete: 0,
    });
    expect(r.itemsSubtotalCents).toBe(13000); // 50*2 + 30 = 130
    expect(r.couponDiscountCents).toBe(0);
    expect(r.totalCents).toBe(13000);
    expect(r.freteCents).toBe(0);
  });

  it("inclui frete no total", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 100, quantity: 1 }],
      cupons: [],
      frete: 18.08,
    });
    expect(r.itemsSubtotalCents).toBe(10000);
    expect(r.freteCents).toBe(1808);
    expect(r.totalCents).toBe(11808);
  });

  it("cupom 'multiplicar' (10% OFF = 0.90) reduz subtotal", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 100, quantity: 1 }],
      cupons: [{ multiplacar: 0.9 }],
      frete: 0,
    });
    expect(r.itemsSubtotalCents).toBe(10000);
    expect(r.itemsTotalAfterCouponCents).toBe(9000);
    expect(r.couponDiscountCents).toBe(1000);
    expect(r.totalCents).toBe(9000);
  });

  it("cupom 'diminuir' subtrai valor fixo em centavos", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 200, quantity: 1 }],
      cupons: [{ diminuir: 30 }],
      frete: 0,
    });
    expect(r.couponDiscountCents).toBe(3000);
    expect(r.totalCents).toBe(17000);
  });

  it("cupom NUNCA deixa total ficar negativo", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 10, quantity: 1 }],
      cupons: [{ diminuir: 1000 }], // desconto absurdo
      frete: 0,
    });
    expect(r.itemsTotalAfterCouponCents).toBe(0);
    expect(r.couponDiscountCents).toBe(1000);
    expect(r.totalCents).toBe(0);
  });

  it("desconto NUNCA passa do subtotal (clamp)", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 50, quantity: 1 }],
      cupons: [{ diminuir: 100 }],
      frete: 0,
    });
    expect(r.couponDiscountCents).toBe(5000);
    expect(r.itemsTotalAfterCouponCents).toBe(0);
  });

  it("multiplos cupons combinam (multiplicar produto, diminuir soma)", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 100, quantity: 1 }],
      cupons: [{ multiplacar: 0.9 }, { diminuir: 5 }],
      frete: 0,
    });
    // 10000 * 0.9 = 9000 - 500 = 8500
    expect(r.itemsTotalAfterCouponCents).toBe(8500);
    expect(r.couponDiscountCents).toBe(1500);
  });

  it("cupons null/undefined sao tratados como vazios", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 100, quantity: 1 }],
      cupons: null as any,
      frete: 0,
    });
    expect(r.couponDiscountCents).toBe(0);
    expect(r.totalCents).toBe(10000);
  });

  it("item sem quantity assume 1", () => {
    const r = calculateOrderTotals({
      items: [{ preco: 75, quantity: 0 as any }, { preco: 25, quantity: 1 }],
      cupons: [],
      frete: 0,
    });
    // quantity 0 -> assumido como 1
    expect(r.itemsSubtotalCents).toBe(10000);
  });

  it("evita imprecisao de float (Math.round)", () => {
    const r = calculateOrderTotals({
      // 0.1 + 0.2 problema classico
      items: [{ preco: 0.1, quantity: 1 }, { preco: 0.2, quantity: 1 }],
      cupons: [],
      frete: 0,
    });
    expect(r.itemsSubtotalCents).toBe(30);
  });
});

describe("centsToReais", () => {
  it("divide por 100", () => {
    expect(centsToReais(22552)).toBe(225.52);
    expect(centsToReais(0)).toBe(0);
    expect(centsToReais(1)).toBe(0.01);
  });
});

describe("getKitDiscount + applyKitDiscountFromFinalPrice", () => {
  it("calcula preco_de a partir do preco final (50% OFF)", () => {
    const result = applyKitDiscountFromFinalPrice({
      finalPrice: 100,
      product: { nome: "Kit Completo", slug: "kit-completo" },
    });
    expect(result).not.toBeNull();
    expect(result!.preco).toBe(100);
    // 100 / (1 - 0.5) = 200
    expect(result!.preco_de).toBe(200);
    expect(result!.desconto).toBe("50% OFF");
  });

  it("retorna null para produto sem nome/slug", () => {
    const result = applyKitDiscountFromFinalPrice({
      finalPrice: 100,
      product: { nome: null, slug: null },
    });
    expect(result).toBeNull();
  });

  it("getKitDiscount detecta qualquer produto com nome (50% generico)", () => {
    // Nota: a implementacao atual aplica 50% pra qualquer produto com nome.
    // Esse teste documenta o comportamento corrente; se mudar, atualizar.
    const r = getKitDiscount({ nome: "Hidratante", slug: "hidratante" });
    expect(r).toEqual({ percent: 0.5, label: "50% OFF" });
  });
});

describe("getKitComponentSlugs", () => {
  it("identifica kit-completo por nome", () => {
    expect(getKitComponentSlugs({ nome: "Kit Completo Lové", slug: "" }))
      .toEqual(KIT_COMPONENTS["kit-completo"]);
  });

  it("identifica kit-completo por 'kit full'", () => {
    expect(getKitComponentSlugs({ nome: "Kit Full", slug: "" }))
      .toEqual(KIT_COMPONENTS["kit-completo"]);
  });

  it("identifica kit uso diario por nome (sem acento)", () => {
    expect(getKitComponentSlugs({ nome: "Kit Uso Diário", slug: "" }))
      .toEqual(KIT_COMPONENTS["kit-uso-diario"]);
  });

  it("retorna null para produto que nao e kit", () => {
    expect(getKitComponentSlugs({ nome: "Sérum Facial", slug: "serum-facial" }))
      .toBeNull();
  });

  it("retorna null para produto vazio", () => {
    expect(getKitComponentSlugs({ nome: null, slug: null })).toBeNull();
  });
});
