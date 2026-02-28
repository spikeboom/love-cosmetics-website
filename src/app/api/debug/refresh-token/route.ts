import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken, getTokenInfo } from "@/lib/bling/simple-auth";
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

  try {
    // 1. State before refresh
    const beforeInfo = await getTokenInfo();

    // 2. Refresh
    const newToken = await refreshAccessToken();

    // 3. State after refresh
    const afterInfo = await getTokenInfo();

    return NextResponse.json({
      success: true,
      message: "Token renovado com sucesso!",
      before: beforeInfo,
      after: afterInfo,
      newToken: {
        preview: newToken.substring(0, 30) + "...",
        length: newToken.length,
      },
    });
  } catch (error) {
    const tokenInfo = await getTokenInfo();

    return NextResponse.json(
      {
        success: false,
        message: "Falha ao renovar token",
        error: error instanceof Error ? error.message : String(error),
        currentState: tokenInfo,
      },
      { status: 500 },
    );
  }
}

