import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/bling/simple-auth";

export const runtime = "nodejs";

function hasValidCronSecret(req: NextRequest): boolean {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  const providedSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!expectedSecret || !providedSecret) {
    return false;
  }

  const expected = Buffer.from(expectedSecret);
  const provided = Buffer.from(providedSecret);

  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export async function POST(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET nao configurado para o cron de renovacao do Bling");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  if (!hasValidCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await refreshAccessToken();

    return NextResponse.json({
      success: true,
      message: "Token do Bling renovado com sucesso",
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Falha no cron de renovacao do token do Bling", error);
    return NextResponse.json(
      { success: false, error: "Falha ao renovar token do Bling" },
      { status: 502 },
    );
  }
}
