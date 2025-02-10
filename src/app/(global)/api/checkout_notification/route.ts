import { createLogger } from "@/utils/logMessage";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const logMessage = createLogger();
  try {
    // Parse do JSON enviado pelo client
    const body = await req.json();

    logMessage("Checkout Notification", body);

    const novoDado = await prisma.statusCheckout.create({
      data: {
        info: body,
      },
    });

    logMessage("Checkout Notification", novoDado);

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
