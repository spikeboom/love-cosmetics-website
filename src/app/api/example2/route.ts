import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse do JSON enviado pelo client
    const body = await req.json();

    console.dir({ example2: body }, { depth: null, colors: true });

    // Simula um processamento (exemplo: salvar no banco de dados)
    const responseData = {
      message: "Dados recebidos com sucesso!",
      data: body,
    };

    // Retorna a resposta com status 200
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 },
    );
  }
}
