import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TEST_EMAIL_FILTER = `NOT (
  LOWER(p.email) LIKE '%teste%' OR
  LOWER(p.email) LIKE '%spikeboom%' OR
  LOWER(p.email) LIKE '%robertocruzneto%' OR
  LOWER(p.email) LIKE '%+%test%'
)`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mes = Number(searchParams.get("mes") || new Date().getMonth() + 1);
    const ano = Number(searchParams.get("ano") || new Date().getFullYear());
    const origem = searchParams.get("origem") || "todos";
    const statusPagamento = searchParams.get("statusPagamento") || "todos";
    const filterMode = searchParams.get("filterMode") || "hideTests";

    // Build date range for current period
    const startDate = `${ano}-${String(mes).padStart(2, "0")}-01`;
    const nextMonth = mes === 12 ? 1 : mes + 1;
    const nextYear = mes === 12 ? ano + 1 : ano;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    // Previous month for comparison
    const prevMonth = mes === 1 ? 12 : mes - 1;
    const prevYear = mes === 1 ? ano - 1 : ano;
    const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
    const prevEndDate = startDate;

    // Build WHERE conditions
    const conditions: string[] = [];

    if (filterMode === "hideTests") {
      conditions.push(TEST_EMAIL_FILTER);
    } else if (filterMode === "showOnlyTests") {
      conditions.push(`(
        LOWER(p.email) LIKE '%teste%' OR
        LOWER(p.email) LIKE '%spikeboom%' OR
        LOWER(p.email) LIKE '%robertocruzneto%' OR
        LOWER(p.email) LIKE '%+%test%'
      )`);
    }

    if (statusPagamento !== "todos") {
      conditions.push(`p.status_pagamento = '${statusPagamento}'`);
    }

    if (origem !== "todos") {
      conditions.push(`p.origem = '${origem}'`);
    }

    const baseWhere = conditions.join(" AND ");
    const currentWhere = `${baseWhere} AND p."createdAt" >= '${startDate}'::timestamp AND p."createdAt" < '${endDate}'::timestamp`;
    const prevWhere = `${baseWhere} AND p."createdAt" >= '${prevStartDate}'::timestamp AND p."createdAt" < '${prevEndDate}'::timestamp`;

    console.log("[DASHBOARD] Params:", { mes, ano, origem, statusPagamento });
    console.log("[DASHBOARD] Date range:", { startDate, endDate, prevStartDate, prevEndDate });
    console.log("[DASHBOARD] currentWhere:", currentWhere);

    // DEBUG: check what actually exists in the DB
    const debug = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.status_pagamento,
        COUNT(*) as cnt,
        MIN(p."createdAt") as min_date,
        MAX(p."createdAt") as max_date
      FROM "Pedido" p
      GROUP BY p.status_pagamento
      ORDER BY cnt DESC
    `);
    console.log("[DASHBOARD DEBUG] Pedidos by status_pagamento:", JSON.stringify(debug, (_, v) => typeof v === 'bigint' ? v.toString() : v));

    const debugDates = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        COUNT(*) as total,
        MIN(p."createdAt") as min_date,
        MAX(p."createdAt") as max_date
      FROM "Pedido" p
    `);
    console.log("[DASHBOARD DEBUG] All pedidos date range:", JSON.stringify(debugDates, (_, v) => typeof v === 'bigint' ? v.toString() : v));

    // 1. KPIs: faturamento, ticket medio, total pedidos
    const kpis = await prisma.$queryRawUnsafe<
      { faturamento: number; pedidos: bigint }[]
    >(`
      SELECT
        COALESCE(SUM(p.total_pedido), 0) as faturamento,
        COUNT(*) as pedidos
      FROM "Pedido" p
      WHERE ${currentWhere}
    `);

    console.log("[DASHBOARD] kpis raw:", JSON.stringify(kpis, (_, v) => typeof v === 'bigint' ? v.toString() : v));

    const faturamento = Number(kpis[0]?.faturamento ?? 0);
    const totalPedidos = Number(kpis[0]?.pedidos ?? 0);
    const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;

    console.log("[DASHBOARD] KPIs parsed:", { faturamento, totalPedidos, ticketMedio });

    // Previous month KPIs for comparison
    const prevKpis = await prisma.$queryRawUnsafe<
      { faturamento: number; pedidos: bigint }[]
    >(`
      SELECT
        COALESCE(SUM(p.total_pedido), 0) as faturamento,
        COUNT(*) as pedidos
      FROM "Pedido" p
      WHERE ${prevWhere}
    `);

    const prevFaturamento = Number(prevKpis[0]?.faturamento ?? 0);
    const prevTotalPedidos = Number(prevKpis[0]?.pedidos ?? 0);
    const prevTicketMedio =
      prevTotalPedidos > 0 ? prevFaturamento / prevTotalPedidos : 0;

    // 2. Faturamento por dia (current month)
    const faturamentoPorDia = await prisma.$queryRawUnsafe<
      { dia: string; valor: number }[]
    >(`
      SELECT
        TO_CHAR(p."createdAt", 'YYYY-MM-DD') as dia,
        SUM(p.total_pedido) as valor
      FROM "Pedido" p
      WHERE ${currentWhere}
      GROUP BY TO_CHAR(p."createdAt", 'YYYY-MM-DD')
      ORDER BY dia
    `);

    // 3. Faturamento por dia (previous month)
    const faturamentoMesAnteriorPorDia = await prisma.$queryRawUnsafe<
      { dia: string; valor: number }[]
    >(`
      SELECT
        TO_CHAR(p."createdAt", 'YYYY-MM-DD') as dia,
        SUM(p.total_pedido) as valor
      FROM "Pedido" p
      WHERE ${prevWhere}
      GROUP BY TO_CHAR(p."createdAt", 'YYYY-MM-DD')
      ORDER BY dia
    `);

    console.log("[DASHBOARD] faturamentoPorDia:", faturamentoPorDia.length, "rows");
    console.log("[DASHBOARD] faturamentoMesAnteriorPorDia:", faturamentoMesAnteriorPorDia.length, "rows");

    // 4. Faturamento por canal (origem)
    const faturamentoPorCanal = await prisma.$queryRawUnsafe<
      { origem: string; valor: number; pedidos: bigint }[]
    >(`
      SELECT
        COALESCE(p.origem, 'checkout') as origem,
        SUM(p.total_pedido) as valor,
        COUNT(*) as pedidos
      FROM "Pedido" p
      WHERE ${currentWhere}
      GROUP BY COALESCE(p.origem, 'checkout')
    `);

    console.log("[DASHBOARD] faturamentoPorCanal:", JSON.stringify(faturamentoPorCanal, (_, v) => typeof v === 'bigint' ? v.toString() : v));

    // 5 & 6. Ranking de produtos (items is JSONB[] — use unnest)
    let rankingProdutos: { nome: string; faturamento: number; quantidade: number }[] = [];
    let quantidadePorProduto: { nome: string; quantidade: number; faturamento: number }[] = [];

    try {
      rankingProdutos = await prisma.$queryRawUnsafe(`
        SELECT
          item->>'name' as nome,
          SUM(COALESCE((item->>'preco')::numeric, (item->>'unit_amount')::numeric, 0) * COALESCE((item->>'quantity')::int, 1)) as faturamento,
          SUM(COALESCE((item->>'quantity')::int, 1)) as quantidade
        FROM "Pedido" p
        CROSS JOIN LATERAL unnest(p.items) AS item
        WHERE ${currentWhere}
          AND item->>'name' IS NOT NULL
        GROUP BY item->>'name'
        ORDER BY faturamento DESC
        LIMIT 5
      `);

      quantidadePorProduto = await prisma.$queryRawUnsafe(`
        SELECT
          item->>'name' as nome,
          SUM(COALESCE((item->>'quantity')::int, 1)) as quantidade,
          SUM(COALESCE((item->>'preco')::numeric, (item->>'unit_amount')::numeric, 0) * COALESCE((item->>'quantity')::int, 1)) as faturamento
        FROM "Pedido" p
        CROSS JOIN LATERAL unnest(p.items) AS item
        WHERE ${currentWhere}
          AND item->>'name' IS NOT NULL
        GROUP BY item->>'name'
        ORDER BY quantidade DESC
        LIMIT 5
      `);
      console.log("[DASHBOARD] rankingProdutos:", JSON.stringify(rankingProdutos, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      console.log("[DASHBOARD] quantidadePorProduto:", JSON.stringify(quantidadePorProduto, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    } catch (itemsError) {
      console.error("[DASHBOARD] Erro ao buscar ranking de produtos:", itemsError);
    }

    // Calculate variations
    const varFaturamento =
      prevFaturamento > 0
        ? ((faturamento - prevFaturamento) / prevFaturamento) * 100
        : 0;
    const varTicketMedio =
      prevTicketMedio > 0
        ? ((ticketMedio - prevTicketMedio) / prevTicketMedio) * 100
        : 0;
    const varPedidos =
      prevTotalPedidos > 0
        ? ((totalPedidos - prevTotalPedidos) / prevTotalPedidos) * 100
        : 0;

    return NextResponse.json({
      faturamento,
      ticketMedio,
      totalPedidos,
      varFaturamento,
      varTicketMedio,
      varPedidos,
      faturamentoPorDia: faturamentoPorDia.map((d) => ({
        dia: d.dia,
        valor: Number(d.valor),
      })),
      faturamentoMesAnteriorPorDia: faturamentoMesAnteriorPorDia.map((d) => ({
        dia: d.dia,
        valor: Number(d.valor),
      })),
      faturamentoPorCanal: faturamentoPorCanal.map((c) => ({
        origem: c.origem,
        valor: Number(c.valor),
        pedidos: Number(c.pedidos),
      })),
      rankingProdutos: rankingProdutos.map((p) => ({
        nome: p.nome,
        faturamento: Number(p.faturamento),
        quantidade: Number(p.quantidade),
      })),
      quantidadePorProduto: quantidadePorProduto.map((p) => ({
        nome: p.nome,
        quantidade: Number(p.quantidade),
        faturamento: Number(p.faturamento),
      })),
      periodo: { mes, ano },
      periodoAnterior: { mes: prevMonth, ano: prevYear },
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
