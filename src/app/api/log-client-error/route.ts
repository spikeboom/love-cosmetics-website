// app/api/log-client-error/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.error(
      "Erro do client:",
      JSON.stringify({
        ...body,
        receivedAt: new Date().toISOString(),
      }),
    );

    // Aqui você pode:
    // - salvar no banco
    // - enviar pra um serviço externo
    // - etc

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erro ao processar log do client:", error);
    return NextResponse.json(
      { status: "error", message: "Invalid request" },
      { status: 400 },
    );
  }
}
