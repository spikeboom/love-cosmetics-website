import { NextResponse } from "next/server";
import { refreshAccessToken, getTokenInfo } from "@/lib/bling/simple-auth";

export async function GET() {
  try {
    console.log("\n=== TESTE DE REFRESH TOKEN ===\n");

    // 1. Verificar estado antes
    console.log("1. Estado ANTES do refresh:");
    const beforeInfo = await getTokenInfo();
    console.log(JSON.stringify(beforeInfo, null, 2));

    // 2. Tentar renovar
    console.log("\n2. Tentando renovar token...");
    const newToken = await refreshAccessToken();

    // 3. Verificar estado depois
    console.log("\n3. Estado DEPOIS do refresh:");
    const afterInfo = await getTokenInfo();
    console.log(JSON.stringify(afterInfo, null, 2));

    return NextResponse.json({
      success: true,
      message: "Token renovado com sucesso!",
      before: beforeInfo,
      after: afterInfo,
      newToken: {
        preview: newToken.substring(0, 30) + "...",
        length: newToken.length
      }
    });
  } catch (error) {
    console.error("\n❌ Erro ao renovar token:", error);

    const tokenInfo = await getTokenInfo();

    return NextResponse.json({
      success: false,
      message: "Falha ao renovar token",
      error: error instanceof Error ? error.message : String(error),
      currentState: tokenInfo
    }, { status: 500 });
  }
}