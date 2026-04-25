import { getDirectusConfig } from "../client";

export interface InstagramPost {
  id: string | number;
  tipo: "post" | "reel";
  instagramUrl: string;
  videoUrl: string | null;
  thumbnailUrl: string;
  descricao?: string;
}

const REVALIDATE_SECONDS = 3600;

function assetUrl(
  fileId: string | null | undefined,
  publicUrl: string,
  opts?: { width?: number; quality?: number; format?: "webp" | "jpg" | "auto" }
): string | null {
  if (!fileId) return null;
  const token = process.env.DIRECTUS_API_TOKEN;
  const params = new URLSearchParams();
  if (opts?.width) params.set("width", String(opts.width));
  if (opts?.quality) params.set("quality", String(opts.quality));
  if (opts?.format && opts.format !== "auto") params.set("format", opts.format);
  if (token) params.set("access_token", token);
  const qs = params.toString();
  return `${publicUrl}/assets/${fileId}${qs ? `?${qs}` : ""}`;
}

function rawAssetUrl(fileId: string | null | undefined, publicUrl: string): string | null {
  if (!fileId) return null;
  const token = process.env.DIRECTUS_API_TOKEN;
  return `${publicUrl}/assets/${fileId}${token ? `?access_token=${token}` : ""}`;
}

export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  try {
    const cfg = getDirectusConfig();
    const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || cfg.baseUrl;
    const qs =
      "filter[status][_eq]=published" +
      "&sort[]=sort&sort[]=date_created" +
      "&fields[]=id&fields[]=tipo&fields[]=instagram_url&fields[]=video&fields[]=thumbnail&fields[]=descricao" +
      "&limit=50";
    const res = await fetch(`${cfg.baseUrl}/items/instagram_posts?${qs}`, {
      headers: cfg.getHeaders(),
      next: { revalidate: REVALIDATE_SECONDS, tags: ["instagram_posts"] },
    });
    if (!res.ok) throw new Error(`Directus retornou ${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    return rows.map((r: any): InstagramPost => ({
      id: r.id,
      tipo: r.tipo === "reel" ? "reel" : "post",
      instagramUrl: r.instagram_url,
      videoUrl: rawAssetUrl(r.video, publicUrl),
      thumbnailUrl:
        assetUrl(r.thumbnail, publicUrl, { width: 720, quality: 82, format: "webp" }) ?? "",
      descricao: r.descricao ?? undefined,
    }));
  } catch (e) {
    console.warn("[instagram_posts] Directus indisponível:", e);
    return [];
  }
}
