export type KitDiscount = {
  percent: number; // 0.10 = 10%
  label: string; // "10% OFF"
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getKitDiscount(product: { nome?: string | null; slug?: string | null }): KitDiscount | null {
  const slug = product.slug ? normalizeText(product.slug) : "";
  const nome = product.nome ? normalizeText(product.nome) : "";
  const haystack = `${slug} ${nome}`.trim();

  if (!haystack) return null;

  // Regras hard-coded
  if (haystack.includes("kit uso diario")) {
    return { percent: 0.1, label: "10% OFF" };
  }

  if (haystack.includes("kit full") && haystack.includes("love")) {
    return { percent: 0.15, label: "15% OFF" };
  }

  // Fallback: "kit full" já é bem específico no catálogo
  if (haystack.includes("kit full")) {
    return { percent: 0.15, label: "15% OFF" };
  }

  return null;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Opção A: Strapi `preco` do kit é o preço de lista.
 * Retorna preço efetivo sem cupom e o "preço de" (riscado).
 */
export function applyKitDiscountFromListPrice(params: {
  listPrice: number;
  product: { nome?: string | null; slug?: string | null };
}): { preco: number; preco_de: number; desconto: string } | null {
  const kit = getKitDiscount(params.product);
  if (!kit) return null;
  const listPrice = params.listPrice || 0;
  const discounted = roundMoney(listPrice * (1 - kit.percent));

  return {
    preco: discounted,
    preco_de: roundMoney(listPrice),
    desconto: kit.label,
  };
}
