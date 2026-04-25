import { getDirectusConfig } from "../client";

export interface BannerHome {
  id: string;
  titulo: string;
  descricao?: string;
  ctaTexto: string;
  ctaUrl: string;
  imagemDesktop: string;
  imagemMobile?: string;
}

const REVALIDATE_SECONDS = 3600; // 1 hora

const DIRECTUS_PUBLIC = "https://directus.lovecosmeticos.xyz";
const DIRECTUS_TOKEN = "love-directus-api-token-2025-static";

function fallbackAsset(fileId: string, width: number) {
  return `${DIRECTUS_PUBLIC}/assets/${fileId}?width=${width}&quality=82&format=webp&fit=cover&access_token=${DIRECTUS_TOKEN}`;
}

const FALLBACK_BANNERS: BannerHome[] = [
  {
    id: "fallback-1",
    titulo: "Sua rotina de skincare com até 50% OFF.",
    descricao: "",
    ctaTexto: "Compre agora",
    ctaUrl: "/figma/search",
    imagemDesktop: fallbackAsset("3130f514-ac50-40a3-9094-8f7e5fb61260", 1600),
    imagemMobile: fallbackAsset("7e0a6cb9-ccfc-4567-9c6d-06f0a4cf041e", 800),
  },
  {
    id: "fallback-2",
    titulo: "Frete grátis para todo o Brasil",
    descricao: "Em compras acima de R$149.",
    ctaTexto: "Aproveitar ofertas",
    ctaUrl: "/figma/search",
    imagemDesktop: fallbackAsset("5c57bc6f-1d16-4fa9-ad78-9d6801a3d273", 1600),
    imagemMobile: fallbackAsset("6f6f6c8f-9804-4a8c-b228-3b915c5bf5c4", 800),
  },
  {
    id: "fallback-3",
    titulo: "Tecnologia & Amazônia",
    descricao: "Ativos amazônicos com ciência para cuidar da sua pele.",
    ctaTexto: "Ver todos os produtos",
    ctaUrl: "/figma/search",
    imagemDesktop: fallbackAsset("7e507a3b-0476-4faa-a028-c4119415e917", 1600),
    imagemMobile: fallbackAsset("5eda0e4e-b0af-4d38-9aa2-753219322bea", 800),
  },
];

function assetUrl(
  fileId: string | null | undefined,
  width: number,
  publicUrl: string
): string | undefined {
  if (!fileId) return undefined;
  const token = process.env.DIRECTUS_API_TOKEN;
  const params = new URLSearchParams({
    width: String(width),
    quality: "82",
    format: "webp",
    fit: "cover",
    ...(token ? { access_token: token } : {}),
  });
  return `${publicUrl}/assets/${fileId}?${params.toString()}`;
}

export async function fetchBannersHome(): Promise<BannerHome[]> {
  try {
    const cfg = getDirectusConfig();
    const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || cfg.baseUrl;
    const qs =
      "filter[status][_eq]=published" +
      "&sort[]=sort&sort[]=date_created" +
      "&fields[]=id&fields[]=titulo&fields[]=descricao&fields[]=cta_texto&fields[]=cta_url&fields[]=imagem_desktop&fields[]=imagem_mobile" +
      "&limit=20";
    const res = await fetch(`${cfg.baseUrl}/items/banners_home?${qs}`, {
      headers: cfg.getHeaders(),
      next: { revalidate: REVALIDATE_SECONDS, tags: ["banners_home"] },
    });
    if (!res.ok) throw new Error(`Directus retornou ${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    if (rows.length === 0) throw new Error("Nenhum banner publicado no Directus");

    return rows.map((r: any): BannerHome => ({
      id: String(r.id),
      titulo: r.titulo ?? "",
      descricao: r.descricao ?? undefined,
      ctaTexto: r.cta_texto ?? "",
      ctaUrl: r.cta_url ?? "/figma/search",
      imagemDesktop: assetUrl(r.imagem_desktop, 1600, publicUrl) ?? "",
      imagemMobile: assetUrl(r.imagem_mobile ?? r.imagem_desktop, 800, publicUrl),
    }));
  } catch (e) {
    console.warn("[banners_home] Directus indisponível, usando fallback hardcoded:", e);
    return FALLBACK_BANNERS;
  }
}
