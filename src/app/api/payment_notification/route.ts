import { createLogger } from "@/utils/logMessage";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Função auxiliar para gerar SHA-256 e retornar como hex
async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  const logMessage = createLogger();
  try {
    const body = await req.json();

    logMessage("Payment Notification", body);

    const novoDado = await prisma.statusPagamento.create({
      data: {
        info: body,
      },
    });

    logMessage("Payment Notification", novoDado);

    // Gera os hashes necessários
    const emailRaw = body?.data?.customer?.email ?? "";
    const phoneRaw = [
      body?.data?.customer?.phones?.[0]?.country ?? "",
      body?.data?.customer?.phones?.[0]?.area ?? "",
      body?.data?.customer?.phones?.[0]?.number ?? "",
    ].join("");

    const user_data = {
      em: await sha256Hex(emailRaw),
      ph: await sha256Hex(phoneRaw),
    };

    // Monta o payload para envio ao GTM server-side
    const gtmPayload = {
      event_name: "Purchase",
      transaction_id: body?.data?.id ?? "unknown",
      value: body?.data?.charges?.[0]?.amount?.value ?? 0,
      currency: body?.data?.charges?.[0]?.amount?.currency ?? "BRL",
      items:
        body?.data?.items?.map((item: any) => ({
          item_id: item?.reference_id ?? "unknown",
          item_name: item?.name ?? "Produto",
          price: item?.unit_amount ?? 0,
          quantity: item?.quantity ?? 1,
        })) ?? [],
      user_data,
    };

    // Envia para o endpoint GTM
    await fetch("https://gtm.lovecosmetics.com.br/data?v=2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gtmPayload),
    });

    const responseData = {
      message: "Dados recebidos com sucesso!",
      data: body,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 },
    );
  }
}
