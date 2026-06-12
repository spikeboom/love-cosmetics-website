import { describe, expect, it } from "vitest";
import { buildYampiCheckoutUrl } from "@/lib/yampi/checkout-url";

describe("buildYampiCheckoutUrl", () => {
  it("builds a Yampi checkout URL with multiple products and quantities", () => {
    const url = buildYampiCheckoutUrl([
      { slug: "espuma-facial", quantity: 2 },
      { slug: "kit-completo", quantity: 1 },
    ]);

    expect(url).toBe("https://seguro.lovecosmetics.com.br/r/D9HLCYG9FB:2,99UQG6IDG8:1");
  });

  it("adds the applied coupon as promocode", () => {
    const url = buildYampiCheckoutUrl([{ id: 21, quantity: 1 }], "LOVE10");

    expect(url).toBe("https://seguro.lovecosmetics.com.br/r/QR0H8JW3JS:1?promocode=LOVE10");
  });

  it("falls back to normalized product name when slug/id are unavailable", () => {
    const url = buildYampiCheckoutUrl([{ nome: "Mascara de Argila", quantity: 3 }]);

    expect(url).toBe("https://seguro.lovecosmetics.com.br/r/EK9LO5CN51:3");
  });

  it("returns null when a product does not have a mapped token", () => {
    const url = buildYampiCheckoutUrl([
      { slug: "espuma-facial", quantity: 1 },
      { slug: "produto-sem-token", quantity: 1 },
    ]);

    expect(url).toBeNull();
  });
});
