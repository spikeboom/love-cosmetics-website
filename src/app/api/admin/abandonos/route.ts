import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    await prisma.checkoutAbandonado.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao remover abandono:", error);
    return NextResponse.json(
      { error: "Erro ao remover abandono" },
      { status: 500 },
    );
  }
}

const TEST_EMAIL_FRAGMENTS = ["spikeboom", "adrianofne", "uconvert", "isabellejordanaa"];

function excludeTestEmailsClause() {
  return {
    AND: TEST_EMAIL_FRAGMENTS.map((fragment) => ({
      OR: [
        { email: null },
        { NOT: { email: { contains: fragment, mode: "insensitive" as const } } },
      ],
    })),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 20);
    const filtro = searchParams.get("filtro") || "abandonados"; // "abandonados" | "convertidos" | "todos"
    const busca = searchParams.get("busca")?.trim() || "";
    const incluirTestes = searchParams.get("incluirTestes") === "true";

    const offset = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (filtro === "abandonados") {
      where.convertido = false;
    } else if (filtro === "convertidos") {
      where.convertido = true;
    }

    if (busca) {
      where.OR = [
        { email: { contains: busca, mode: "insensitive" } },
        { nome: { contains: busca, mode: "insensitive" } },
        { telefone: { contains: busca.replace(/\D/g, "") } },
      ];
    }

    if (!incluirTestes) {
      Object.assign(where, excludeTestEmailsClause());
    }

    const [abandonos, total] = await Promise.all([
      prisma.checkoutAbandonado.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: offset,
        take: pageSize,
      }),
      prisma.checkoutAbandonado.count({ where }),
    ]);

    // Agrupa por sessionId para mostrar a sessão mais recente de cada visitante
    const sessionsMap = new Map<string, typeof abandonos[0]>();
    for (const ab of abandonos) {
      const existing = sessionsMap.get(ab.sessionId);
      if (!existing || new Date(ab.updatedAt) > new Date(existing.updatedAt)) {
        sessionsMap.set(ab.sessionId, ab);
      }
    }

    // Estatísticas rápidas (respeitam o filtro de testes)
    const baseStatsWhere = incluirTestes ? {} : excludeTestEmailsClause();
    const [totalAbandonados, totalConvertidos, totalHoje] = await Promise.all([
      prisma.checkoutAbandonado.count({ where: { convertido: false, ...baseStatsWhere } }),
      prisma.checkoutAbandonado.count({ where: { convertido: true, ...baseStatsWhere } }),
      prisma.checkoutAbandonado.count({
        where: {
          convertido: false,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          ...baseStatsWhere,
        },
      }),
    ]);

    return NextResponse.json({
      abandonos,
      total,
      stats: {
        totalAbandonados,
        totalConvertidos,
        totalHoje,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar abandonos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de abandono" },
      { status: 500 }
    );
  }
}
