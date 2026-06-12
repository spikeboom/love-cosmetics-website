const YAMPI_CHECKOUT_DOMAIN = "https://seguro.lovecosmetics.com.br";

const YAMPI_TOKENS_BY_SLUG: Record<string, string> = {
  "espuma-facial": "D9HLCYG9FB",
  "serum-facial": "QR0H8JW3JS",
  "hidratante-facial": "OLHH9VH5SM",
  "manteiga-corporal": "7IG3QCYZ8K",
  "mascara-de-argila": "EK9LO5CN51",
  "kit-completo": "99UQG6IDG8",
  "kit-uso-diario": "RPX9KL1YBW",
};

const YAMPI_TOKENS_BY_DIRECTUS_ID: Record<string, string> = {
  "20": "D9HLCYG9FB",
  "21": "QR0H8JW3JS",
  "22": "OLHH9VH5SM",
  "24": "7IG3QCYZ8K",
  "23": "EK9LO5CN51",
  "25": "99UQG6IDG8",
  "26": "RPX9KL1YBW",
};

const YAMPI_TOKENS_BY_NAME: Record<string, string> = {
  "espuma facial": "D9HLCYG9FB",
  "serum facial": "QR0H8JW3JS",
  "hidratante facial": "OLHH9VH5SM",
  "manteiga corporal": "7IG3QCYZ8K",
  "mascara de argila": "EK9LO5CN51",
  "kit completo": "99UQG6IDG8",
  "kit uso diario": "RPX9KL1YBW",
};

export type YampiCheckoutCartItem = {
  id?: unknown;
  documentId?: unknown;
  slug?: unknown;
  nome?: unknown;
  quantity?: unknown;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getYampiToken(item: YampiCheckoutCartItem): string | undefined {
  const slug = normalizeText(item.slug);
  if (slug && YAMPI_TOKENS_BY_SLUG[slug]) return YAMPI_TOKENS_BY_SLUG[slug];

  const id = String(item.id ?? "");
  if (id && YAMPI_TOKENS_BY_DIRECTUS_ID[id]) return YAMPI_TOKENS_BY_DIRECTUS_ID[id];

  const documentId = String(item.documentId ?? "");
  if (documentId && YAMPI_TOKENS_BY_DIRECTUS_ID[documentId]) return YAMPI_TOKENS_BY_DIRECTUS_ID[documentId];

  const nome = normalizeText(item.nome);
  if (nome && YAMPI_TOKENS_BY_NAME[nome]) return YAMPI_TOKENS_BY_NAME[nome];

  return undefined;
}

function normalizeQuantity(quantity: unknown): number {
  const parsed = Number(quantity ?? 1);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.trunc(parsed);
}

export function buildYampiCheckoutUrl(
  items: YampiCheckoutCartItem[],
  promocode?: string,
): string | null {
  const tokenReferences = items
    .map((item) => {
      const token = getYampiToken(item);
      if (!token) return null;
      return `${token}:${normalizeQuantity(item.quantity)}`;
    })
    .filter((reference): reference is string => Boolean(reference));

  if (tokenReferences.length !== items.length || tokenReferences.length === 0) {
    return null;
  }

  const url = new URL(`/r/${tokenReferences.join(",")}`, YAMPI_CHECKOUT_DOMAIN);
  const coupon = String(promocode ?? "").trim();
  if (coupon) url.searchParams.set("promocode", coupon);

  return url.toString();
}
