import { NextRequest, NextResponse } from "next/server";
import { getCurrentToken, getTokenInfo } from "@/lib/bling/simple-auth";

export async function GET(req: NextRequest) {
  const token = await getCurrentToken();
  const tokenInfo = await getTokenInfo();

  return NextResponse.json({
    ...tokenInfo,
    getCurrentTokenResult: {
      value: token ? `${token.substring(0, 20)}...` : null,
      fullValue: token,
      exists: !!token
    },
    durations: {
      accessTokenDuration: "6 horas (21600 segundos)",
      refreshTokenDuration: "30 dias"
    }
  });
}