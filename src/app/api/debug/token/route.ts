import { NextRequest, NextResponse } from "next/server";
import { getCurrentToken, getTokenInfo } from "@/lib/bling/simple-auth";
import { verifyAdminJWTOnly } from "@/lib/admin/auth-edge";

function isProductionEnv() {
  return process.env.NODE_ENV === "production" || process.env.STAGE === "PRODUCTION";
}

async function guardDebugRoute(req: NextRequest): Promise<NextResponse | null> {
  // Never expose debug routes in production.
  if (isProductionEnv()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = req.cookies.get("auth_token")?.value;
  const admin = token ? await verifyAdminJWTOnly(token) : null;
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET(req: NextRequest) {
  const guard = await guardDebugRoute(req);
  if (guard) return guard;

  const token = await getCurrentToken();
  const tokenInfo = await getTokenInfo();

  // Do not return the full Bling token, even in dev.
  return NextResponse.json({
    ...tokenInfo,
    getCurrentTokenResult: {
      preview: token ? `${token.substring(0, 20)}...` : null,
      length: token?.length ?? 0,
      exists: !!token,
    },
    durations: {
      accessTokenDuration: "6 horas (21600 segundos)",
      refreshTokenDuration: "30 dias",
    },
  });
}

