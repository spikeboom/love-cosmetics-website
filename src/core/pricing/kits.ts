export type KitDiscount = {
  percent: number; // 0.10 = 10%
  label: string; // "10% OFF"
};

/** Slugs dos produtos que compõem cada kit */
export const KIT_COMPONENTS: Record<string, string[]> = {
  "kit-completo": [
    "espuma-facial",
    "serum-facial",
    "hidratante-facial",
    "mascara-de-argila",
    "manteiga-corporal",
  ],
  "kit-uso-diario": [
    "espuma-facial",
    "serum-facial",
    "hidratante-facial",
  ],
};

/**
 * Detecta se o item é um kit e retorna os slugs dos seus componentes.
 * Usa o mesmo padrão de detecção do getKitDiscount.
 */
export function getKitComponentSlugs(
  product: { nome?: string | null; slug?: string | null }
): string[] | null {
  const slug = product.slug ? normalizeText(product.slug) : "";
  const nome = product.nome ? normalizeText(product.nome) : "";
  const haystack = `${slug} ${nome}`.trim();

  if (!haystack) return null;

  if (haystack.includes("kit uso diario")) {
    return KIT_COMPONENTS["kit-uso-diario"];
  }

  if (haystack.includes("kit completo") || haystack.includes("kit full")) {
    return KIT_COMPONENTS["kit-completo"];
  }

  return null;
}

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

  // Kit Completo = Kit Full Lové = 15% OFF
  if (haystack.includes("kit completo") || haystack.includes("kit full")) {
    return { percent: 0.15, label: "15% OFF" };
  }

  return null;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * O preço do Strapi já é o preço final (com desconto aplicado).
 * Calcula o preco_de (preço original/riscado) a partir do desconto.
 *
 * Exemplo: Kit Completo com 15% OFF
 * - preco (Strapi) = R$ 465 (já com desconto)
 * - preco_de = 465 / 0.85 = R$ 547,06 (preço original calculado)
 */
export function applyKitDiscountFromFinalPrice(params: {
  finalPrice: number;
  product: { nome?: string | null; slug?: string | null };
}): { preco: number; preco_de: number; desconto: string } | null {
  const kit = getKitDiscount(params.product);
  if (!kit) return null;

  const finalPrice = params.finalPrice || 0;
  const preco_de = roundMoney(finalPrice / (1 - kit.percent));

  return {
    preco: finalPrice,
    preco_de: preco_de,
    desconto: kit.label,
  };
}

/**
 * @deprecated Use applyKitDiscountFromFinalPrice instead
 */
export function applyKitDiscountFromListPrice(params: {
  listPrice: number;
  product: { nome?: string | null; slug?: string | null };
}): { preco: number; preco_de: number; desconto: string } | null {
  return applyKitDiscountFromFinalPrice({
    finalPrice: params.listPrice,
    product: params.product,
  });
}
