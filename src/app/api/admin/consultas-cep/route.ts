import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    await prisma.consultaCep.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao remover consulta CEP:", error);
    return NextResponse.json(
      { error: "Erro ao remover consulta" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 20);
    const busca = searchParams.get("busca")?.trim() || "";
    const estado = searchParams.get("estado")?.trim() || "";
    const incluirTestes = searchParams.get("incluirTestes") === "true";

    const offset = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (estado) {
      where.estado = estado;
    }

    if (busca) {
      where.OR = [
        { cep: { contains: busca.replace(/\D/g, "") } },
        { cidade: { contains: busca, mode: "insensitive" } },
        { email: { contains: busca, mode: "insensitive" } },
        { nome: { contains: busca, mode: "insensitive" } },
      ];
    }

    if (!incluirTestes) {
      Object.assign(where, excludeTestEmailsClause());
    }

    const [consultas, total] = await Promise.all([
      prisma.consultaCep.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: pageSize,
      }),
      prisma.consultaCep.count({ where }),
    ]);

    // Estatísticas (respeitam o filtro de testes)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const baseStatsWhere = incluirTestes ? {} : excludeTestEmailsClause();

    const testEmailFilterSql = incluirTestes
      ? Prisma.empty
      : Prisma.sql`AND (${Prisma.join(
          TEST_EMAIL_FRAGMENTS.map(
            (f) => Prisma.sql`(email IS NULL OR email NOT ILIKE ${"%" + f + "%"})`,
          ),
          " AND ",
        )})`;

    const [totalConsultas, consultasHoje, topEstadosRaw] = await Promise.all([
      prisma.consultaCep.count({ where: baseStatsWhere }),
      prisma.consultaCep.count({
        where: { createdAt: { gte: hoje }, ...baseStatsWhere },
      }),
      prisma.$queryRaw`
        SELECT estado, COUNT(*)::int as total
        FROM "ConsultaCep"
        WHERE estado IS NOT NULL
        ${testEmailFilterSql}
        GROUP BY estado
        ORDER BY total DESC
        LIMIT 5
      ` as Promise<Array<{ estado: string; total: number }>>,
    ]);

    // CEPs únicos
    const cepsUnicosResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT cep)::int as total FROM "ConsultaCep"
      WHERE 1=1 ${testEmailFilterSql}
    ` as Array<{ total: number }>;
    const cepsUnicos = cepsUnicosResult[0]?.total || 0;

    return NextResponse.json({
      consultas,
      total,
      stats: {
        totalConsultas,
        consultasHoje,
        cepsUnicos,
        topEstados: topEstadosRaw || [],
      },
    });
  } catch (error) {
    console.error("Erro ao buscar consultas CEP:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 },
    );
  }
}
