import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { findMediaByUrl, extractShortcode, type InstagramMediaItem } from "@/lib/instagram/graph-api";
import { getDirectusConfig } from "@/lib/cms/client";

export const runtime = "nodejs";
export const maxDuration = 120;

const COLLECTION = "instagram_posts";

async function downloadBuffer(url: string): Promise<{ buf: Buffer; contentType: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.instagram.com/",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Download falhou ${res.status}: ${url.slice(0, 80)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  return { buf, contentType };
}

async function uploadToDirectus(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const cfg = getDirectusConfig();
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: contentType });
  form.append("file", blob, filename);

  const res = await fetch(`${cfg.baseUrl}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload Directus falhou ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.data.id;
}

async function createPostItem(fields: Record<string, unknown>): Promise<{ id: number }> {
  const cfg = getDirectusConfig();
  const res = await fetch(`${cfg.baseUrl}/items/${COLLECTION}`, {
    method: "POST",
    headers: cfg.getHeaders(),
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create item falhou ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.data;
}

async function nextSort(): Promise<number> {
  const cfg = getDirectusConfig();
  const res = await fetch(
    `${cfg.baseUrl}/items/${COLLECTION}?fields=sort&sort=-sort&limit=1`,
    { headers: cfg.getHeaders(), cache: "no-store" }
  );
  if (!res.ok) return 1;
  const json = await res.json();
  const top = Array.isArray(json?.data) ? json.data[0] : null;
  return (top?.sort || 0) + 1;
}

async function alreadyImported(instagramUrl: string): Promise<number | null> {
  const cfg = getDirectusConfig();
  const res = await fetch(
    `${cfg.baseUrl}/items/${COLLECTION}?filter[instagram_url][_eq]=${encodeURIComponent(instagramUrl)}&fields=id&limit=1`,
    { headers: cfg.getHeaders(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.[0]?.id ?? null;
}

function inferTipo(media: InstagramMediaItem): "post" | "reel" {
  const permalink = media.permalink || "";
  if (/\/reel\//.test(permalink)) return "reel";
  if (media.media_type === "VIDEO") return "reel";
  return "post";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { instagramUrl?: string };
    const instagramUrl = (body.instagramUrl || "").trim();

    if (!instagramUrl) {
      return NextResponse.json({ error: "instagramUrl obrigatório" }, { status: 400 });
    }
    const shortcode = extractShortcode(instagramUrl);
    if (!shortcode) {
      return NextResponse.json({ error: "URL inválida — shortcode não encontrado" }, { status: 400 });
    }

    const existingId = await alreadyImported(instagramUrl);
    if (existingId) {
      return NextResponse.json(
        { error: "Post já importado", itemId: existingId, shortcode },
        { status: 409 }
      );
    }

    const media = await findMediaByUrl(instagramUrl);
    if (!media) {
      return NextResponse.json(
        { error: `Mídia não encontrada no Graph API (shortcode ${shortcode}). Pode ser post antigo demais ou não pertencer à conta conectada.` },
        { status: 404 }
      );
    }

    const tipo = inferTipo(media);
    const thumbUrl = media.thumbnail_url || media.media_url;
    const videoUrl = media.media_type === "VIDEO" ? media.media_url : null;

    const thumb = await downloadBuffer(thumbUrl);
    const thumbId = await uploadToDirectus(
      thumb.buf,
      `ig-${shortcode}-thumb.jpg`,
      thumb.contentType.startsWith("image/") ? thumb.contentType : "image/jpeg"
    );

    let videoId: string | null = null;
    if (videoUrl) {
      const vid = await downloadBuffer(videoUrl);
      videoId = await uploadToDirectus(
        vid.buf,
        `ig-${shortcode}.mp4`,
        vid.contentType.startsWith("video/") ? vid.contentType : "video/mp4"
      );
    }

    const sort = await nextSort();
    const item = await createPostItem({
      status: "published",
      sort,
      instagram_url: instagramUrl,
      tipo,
      video: videoId,
      thumbnail: thumbId,
      descricao: media.caption || null,
    });

    revalidateTag("instagram_posts");

    return NextResponse.json({
      success: true,
      itemId: item.id,
      shortcode,
      tipo,
      thumbId,
      videoId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/instagram/import] erro:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
