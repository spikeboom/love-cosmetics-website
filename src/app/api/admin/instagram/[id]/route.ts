import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDirectusConfig } from "@/lib/cms/client";

export const runtime = "nodejs";

const COLLECTION = "instagram_posts";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

    const cfg = getDirectusConfig();

    const get = await fetch(
      `${cfg.baseUrl}/items/${COLLECTION}/${id}?fields=video,thumbnail`,
      { headers: cfg.getHeaders(), cache: "no-store" }
    );
    if (!get.ok) {
      return NextResponse.json({ error: `Item não encontrado (${get.status})` }, { status: 404 });
    }
    const { data } = await get.json();

    const del = await fetch(`${cfg.baseUrl}/items/${COLLECTION}/${id}`, {
      method: "DELETE",
      headers: cfg.getHeaders(),
    });
    if (!del.ok) {
      const text = await del.text();
      throw new Error(`Delete item falhou ${del.status}: ${text.slice(0, 200)}`);
    }

    const fileIds = [data?.thumbnail, data?.video].filter(Boolean);
    for (const fileId of fileIds) {
      await fetch(`${cfg.baseUrl}/files/${fileId}`, {
        method: "DELETE",
        headers: cfg.getHeaders(),
      }).catch(() => {});
    }

    revalidateTag("instagram_posts");

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/instagram/delete] erro:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    const allowed = ["status", "sort", "descricao", "tipo"] as const;
    const payload: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) payload[k] = body[k];
    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "nada a atualizar" }, { status: 400 });
    }

    const cfg = getDirectusConfig();
    const res = await fetch(`${cfg.baseUrl}/items/${COLLECTION}/${id}`, {
      method: "PATCH",
      headers: cfg.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Patch falhou ${res.status}: ${text.slice(0, 200)}`);
    }
    revalidateTag("instagram_posts");
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
