import { NextResponse } from "next/server";
import { refreshInstagramToken } from "@/lib/instagram/graph-api";
import { getConfigValues } from "@/lib/cms/directus/app-config";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cfg = await getConfigValues([
      "instagram_token_issued_at",
      "instagram_token_expires_at",
    ]);
    return NextResponse.json({
      issuedAt: cfg.instagram_token_issued_at,
      expiresAt: cfg.instagram_token_expires_at,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await refreshInstagramToken();
    return NextResponse.json({
      success: true,
      issuedAt: result.issuedAt,
      expiresAt: result.expiresAt,
      expiresIn: result.expiresIn,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
