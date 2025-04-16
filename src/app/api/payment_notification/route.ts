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

    const emailRaw = body?.customer?.email ?? "";
    const phoneRaw = [
      body?.customer?.phones?.[0]?.country ?? "",
      body?.customer?.phones?.[0]?.area ?? "",
      body?.customer?.phones?.[0]?.number ?? "",
    ].join("");

    // ✅ VERIFICA SE ALGUMA COBRANÇA ESTÁ COM STATUS PAID
    const isPaid = body?.charges?.some(
      (charge: any) => charge?.status === "PAID",
    );

    console.log({ isPaid });

    if (isPaid) {
      const gtmPayload = {
        event_name: "Purchase",
        transaction_id: body?.id ?? "unknown",
        value: Number(body?.charges?.[0]?.amount?.value ?? 0) / 100,
        currency: body?.charges?.[0]?.amount?.currency ?? "BRL",
        items:
          body?.items?.map((item: any) => ({
            item_id: item?.reference_id ?? "unknown",
            item_name: item?.name ?? "Produto",
            price: Number(item?.unit_amount ?? 0) / 100,
            quantity: item?.quantity ?? 1,
          })) ?? [],
        user_data: {
          em: emailRaw ? await sha256Hex(emailRaw) : undefined,
          ph: phoneRaw ? await sha256Hex(phoneRaw) : undefined,
        },
        user_email: emailRaw ? await sha256Hex(emailRaw) : undefined,
        user_phone: phoneRaw ? await sha256Hex(phoneRaw) : undefined,
      };

      await fetch("https://gtm.lovecosmetics.com.br/data?v=2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gtm-Server-Preview":
            "ZW52LTV8R1V1alUtN0EtckdrZUFJU0I3VXdHd3wxOTYzYzNkNmY2MWM4Mjk2NTQwYTM=",
        },
        body: JSON.stringify(gtmPayload),
      });
    }

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
