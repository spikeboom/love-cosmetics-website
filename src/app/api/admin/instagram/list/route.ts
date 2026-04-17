import { NextResponse } from "next/server";
import { getDirectusConfig } from "@/lib/cms/client";

export const runtime = "nodejs";

const COLLECTION = "instagram_posts";

export async function GET() {
  try {
    const cfg = getDirectusConfig();
    const qs =
      "fields=id,status,sort,tipo,instagram_url,video,thumbnail,descricao,date_created" +
      "&sort=sort,-date_created" +
      "&limit=200";
    const res = await fetch(`${cfg.baseUrl}/items/${COLLECTION}?${qs}`, {
      headers: cfg.getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Directus ${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || cfg.baseUrl;
    const token = process.env.DIRECTUS_API_TOKEN;
    const withQs = (fileId: string | null, params: string) =>
      fileId
        ? `${publicUrl}/assets/${fileId}${params}${token ? `${params ? "&" : "?"}access_token=${token}` : ""}`
        : null;

    const posts = rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      status: r.status,
      sort: r.sort,
      tipo: r.tipo,
      instagramUrl: r.instagram_url,
      descricao: r.descricao ?? null,
      dateCreated: r.date_created,
      thumbnailUrl: withQs(r.thumbnail as string | null, "?width=360&quality=70&format=webp"),
      videoUrl: withQs(r.video as string | null, ""),
    }));

    return NextResponse.json({ posts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/instagram/list] erro:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
