import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/bling/simple-auth";
import { createLogger } from "@/utils/logMessage";

const logMessage = createLogger();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    logMessage("Callback OAuth Bling recebido", {
      code: code ? "present" : "missing",
      state,
      error
    });

    // Verificar se houve erro na autorização
    if (error) {
      logMessage("Erro na autorização OAuth", { error });
      return NextResponse.json({ error: "Autorização negada" }, { status: 400 });
    }

    // Verificar se o code foi fornecido
    if (!code) {
      logMessage("Code não fornecido no callback", {});
      return NextResponse.json({ error: "Code não fornecido" }, { status: 400 });
    }

    // Trocar code por access_token
    await exchangeCodeForToken(code);

    logMessage("Token obtido e armazenado com sucesso", {});

    return NextResponse.json({
      message: "Autenticação realizada com sucesso",
      authenticated: true
    });

  } catch (error) {
    logMessage("Erro no callback OAuth Bling", error);
    return NextResponse.json({ error: "Erro ao processar callback" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}