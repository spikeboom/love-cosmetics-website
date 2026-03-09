import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface TrackBody {
  sessionId: string;
  step: "identificacao" | "entrega" | "pagamento";
  email?: string;
  telefone?: string;
  nome?: string;
  cpf?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  items?: Array<{ item_id: string; item_name: string; price: number; quantity: number }>;
  valor?: number;
  cupons?: string[];
  device?: string;
}

const VALID_STEPS = ["identificacao", "entrega", "pagamento"];

export async function POST(request: NextRequest) {
  try {
    const body: TrackBody = await request.json();

    if (!body.sessionId || !body.step || !VALID_STEPS.includes(body.step)) {
      return NextResponse.json(
        { error: "sessionId e step são obrigatórios" },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    await prisma.checkoutAbandonado.upsert({
      where: { id: body.sessionId + "_" + body.step },
      create: {
        id: body.sessionId + "_" + body.step,
        sessionId: body.sessionId,
        step: body.step,
        email: body.email || null,
        telefone: body.telefone?.replace(/\D/g, "") || null,
        nome: body.nome || null,
        cpf: body.cpf?.replace(/\D/g, "") || null,
        cep: body.cep?.replace(/\D/g, "") || null,
        cidade: body.cidade || null,
        estado: body.estado || null,
        items: body.items || undefined,
        valor: body.valor || null,
        cupons: body.cupons || [],
        device: body.device || null,
        userAgent,
        ip,
      },
      update: {
        email: body.email || undefined,
        telefone: body.telefone?.replace(/\D/g, "") || undefined,
        nome: body.nome || undefined,
        cpf: body.cpf?.replace(/\D/g, "") || undefined,
        cep: body.cep?.replace(/\D/g, "") || undefined,
        cidade: body.cidade || undefined,
        estado: body.estado || undefined,
        items: body.items || undefined,
        valor: body.valor || undefined,
        cupons: body.cupons || undefined,
        device: body.device || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao trackear checkout:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados" },
      { status: 500 }
    );
  }
}
