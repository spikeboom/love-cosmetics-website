import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// Custo operacional (CPV) por produto individual — hardcoded
const CUSTO_OPERACIONAL_BASE: Record<string, number> = {
  Espuma: 44.9,
  "Máscara": 44.17,
  "Sérum": 45.7,
  Hidratante: 58.54,
  Manteiga: 56.45,
};

// Kits: CPV = soma dos componentes
// Kit Uso Diário = Espuma + Sérum + Hidratante
// Kit Completo   = Espuma + Sérum + Hidratante + Máscara + Manteiga
const KIT_COMPONENTS: Record<string, string[]> = {
  "Kit Uso Diário": ["Espuma", "Sérum", "Hidratante"],
  "Kit Completo": ["Espuma", "Sérum", "Hidratante", "Máscara", "Manteiga"],
};

function buildCustoOperacional(): Record<string, number> {
  const custos: Record<string, number> = { ...CUSTO_OPERACIONAL_BASE };
  for (const [kitNome, componentes] of Object.entries(KIT_COMPONENTS)) {
    custos[kitNome] = componentes.reduce(
      (sum, comp) => sum + (CUSTO_OPERACIONAL_BASE[comp] ?? 0),
      0
    );
  }
  return custos;
}

const TEST_EMAIL_FILTER = `NOT (
  LOWER(p.email) LIKE '%teste%' OR
  LOWER(p.email) LIKE '%spikeboom%' OR
  LOWER(p.email) LIKE '%robertocruzneto%' OR
  LOWER(p.email) LIKE '%+%test%'
)`;

const EFFECTIVE_PAID_FILTER = `(
  p.status_pagamento IN ('PAID', 'AUTHORIZED')
  OR p.status_entrega <> 'AGUARDANDO_PAGAMENTO'
  OR EXISTS (
    SELECT 1
    FROM "StatusPagamento" sp
    WHERE sp.info->>'reference_id' = p.id
      AND (
        sp.info->>'status' IN ('PAID', 'AUTHORIZED')
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(sp.info->'charges', '[]'::jsonb)) AS charge
          WHERE charge->>'status' IN ('PAID', 'AUTHORIZED')
        )
      )
  )
)`;

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origem = searchParams.get("origem") || "todos";
    const statusPagamento = searchParams.get("statusPagamento") || "todos";
    const filterMode = searchParams.get("filterMode") || "hideTests";

    // Date range: dataInicio / dataFim (default: last 30 days)
    const now = new Date();
    const dataFim = searchParams.get("dataFim") || formatDateISO(now);
    const dataInicio = searchParams.get("dataInicio") || formatDateISO(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

    // Calculate the period duration in days for the comparison period
    const startMs = new Date(dataInicio + "T00:00:00").getTime();
    const endMs = new Date(dataFim + "T23:59:59").getTime();
    const periodDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;

    // Previous period: same duration, ending the day before dataInicio
    const prevEndDate = new Date(startMs - 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(prevEndDate.getTime() - (periodDays - 1) * 24 * 60 * 60 * 1000);
    const dataInicioAnterior = formatDateISO(prevStartDate);
    const dataFimAnterior = formatDateISO(prevEndDate);

    // SQL date boundaries (exclusive end for current, inclusive via next day)
    const startDate = dataInicio;
    const endDateExclusive = formatDateISO(new Date(new Date(dataFim + "T00:00:00").getTime() + 24 * 60 * 60 * 1000));
    const prevStart = dataInicioAnterior;
    const prevEndExclusive = formatDateISO(new Date(new Date(dataFimAnterior + "T00:00:00").getTime() + 24 * 60 * 60 * 1000));

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
      if (statusPagamento === "PAID" || statusPagamento === "AUTHORIZED") {
        conditions.push(`(
          p.status_pagamento = '${statusPagamento}'
          OR EXISTS (
            SELECT 1
            FROM "StatusPagamento" sp
            WHERE sp.info->>'reference_id' = p.id
              AND (
                sp.info->>'status' = '${statusPagamento}'
                OR EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements(COALESCE(sp.info->'charges', '[]'::jsonb)) AS charge
                  WHERE charge->>'status' = '${statusPagamento}'
                )
              )
          )
        )`);
      } else {
        conditions.push(`p.status_pagamento = '${statusPagamento}'`);
      }
    } else {
      conditions.push(EFFECTIVE_PAID_FILTER);
    }

    if (origem !== "todos") {
      conditions.push(`p.origem = '${origem}'`);
    }

    const baseWhere = conditions.join(" AND ");
    const currentWhere = `${baseWhere} AND p."createdAt" >= '${startDate}'::timestamp AND p."createdAt" < '${endDateExclusive}'::timestamp`;
    const prevWhere = `${baseWhere} AND p."createdAt" >= '${prevStart}'::timestamp AND p."createdAt" < '${prevEndExclusive}'::timestamp`;

    console.log("[DASHBOARD] Params:", { dataInicio, dataFim, origem, statusPagamento });
    console.log("[DASHBOARD] Date range:", { startDate, endDateExclusive, prevStart, prevEndExclusive });

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

    const faturamento = Number(kpis[0]?.faturamento ?? 0);
    const totalPedidos = Number(kpis[0]?.pedidos ?? 0);
    const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;

    // Previous period KPIs for comparison
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

    // 2. Faturamento por dia (current period)
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

    // 3. Faturamento por dia (previous period)
    const faturamentoPeriodoAnteriorPorDia = await prisma.$queryRawUnsafe<
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
      `);
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

    // 7. Margem bruta — buscar precos do Strapi e cruzar com CPV
    let margemProdutos: { nome: string; custoOperacional: number; precoVenda: number; margemBruta: number }[] = [];
    let margemBrutaMedia = 0;

    try {
      const CUSTO_OPERACIONAL = buildCustoOperacional();
      const nomesComCusto = Object.keys(CUSTO_OPERACIONAL);

      // Buscar todos os produtos do Strapi (individuais + kits)
      const strapiQuery = qs.stringify(
        {
          fields: ["nome", "slug", "preco"],
          pagination: { pageSize: 100 },
        },
        { encodeValuesOnly: true }
      );

      const strapiRes = await fetch(`${STRAPI_URL}/api/produtos?${strapiQuery}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-store",
      });

      if (strapiRes.ok) {
        const strapiData = await strapiRes.json();
        const produtos: { nome: string; slug?: string; preco: number }[] = strapiData.data || [];

        // Mapear nome do custo → produto do Strapi usando match parcial
        margemProdutos = nomesComCusto.map((key) => {
          const cpv = CUSTO_OPERACIONAL[key];
          const keyLower = key.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const prod = produtos.find((p) => {
            const nomeLower = p.nome.toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return nomeLower.includes(keyLower);
          });
          const preco = prod?.preco ?? 0;
          const margem = preco > 0 ? ((preco - cpv) / preco) * 100 : 0;
          return {
            nome: key,
            custoOperacional: cpv,
            precoVenda: preco,
            margemBruta: margem,
          };
        });

        // Média ponderada pelo faturamento (se tiver ranking)
        const rankingAll = rankingProdutos.length > 0 ? rankingProdutos : [];
        let somaMargemPond = 0;
        let somaFatPond = 0;
        for (const rk of rankingAll) {
          const rkNomeLower = rk.nome.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const mp = margemProdutos.find((m) => {
            const mNomeLower = m.nome.toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return rkNomeLower.includes(mNomeLower);
          });
          if (mp && mp.margemBruta > 0) {
            somaMargemPond += mp.margemBruta * Number(rk.faturamento);
            somaFatPond += Number(rk.faturamento);
          }
        }
        margemBrutaMedia = somaFatPond > 0 ? somaMargemPond / somaFatPond : 0;
      }
    } catch (margemErr) {
      console.error("[DASHBOARD] Erro ao calcular margem:", margemErr);
    }

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
      faturamentoPeriodoAnteriorPorDia: faturamentoPeriodoAnteriorPorDia.map((d) => ({
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
      margemProdutos,
      margemBrutaMedia,
      dataInicio,
      dataFim,
      dataInicioAnterior,
      dataFimAnterior,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
