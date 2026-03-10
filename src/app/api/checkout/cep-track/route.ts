import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      cep,
      bairro,
      cidade,
      estado,
      origem,
      sessionId,
      email,
      nome,
      telefone,
      cpf,
      clienteId,
      freteMinimo,
      prazoMinimo,
      transportadora,
      totalServicos,
      device,
    } = body;

    if (!cep || typeof cep !== "string" || cep.replace(/\D/g, "").length !== 8) {
      return NextResponse.json({ error: "CEP invalido" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || undefined;
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || undefined;

    await prisma.consultaCep.create({
      data: {
        cep: cep.replace(/\D/g, ""),
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        origem: origem || null,
        sessionId: sessionId || null,
        email: email || null,
        nome: nome || null,
        telefone: telefone ? String(telefone).replace(/\D/g, "") : null,
        cpf: cpf ? String(cpf).replace(/\D/g, "") : null,
        clienteId: clienteId || null,
        freteMinimo: typeof freteMinimo === "number" ? freteMinimo : null,
        prazoMinimo: typeof prazoMinimo === "number" ? prazoMinimo : null,
        transportadora: transportadora || null,
        totalServicos: typeof totalServicos === "number" ? totalServicos : null,
        device: device || null,
        userAgent: userAgent || null,
        ip: ip || null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar consulta CEP:", error);
    return NextResponse.json(
      { error: "Erro ao salvar consulta" },
      { status: 500 },
    );
  }
}
