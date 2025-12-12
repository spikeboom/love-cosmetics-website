import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Se preferir receber os parâmetros via query string, pode usar:
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);
    const filterMode = searchParams.get("filterMode") || "hideTests";
    const apenasEfetivados = searchParams.get("apenasEfetivados") === "true";

    // Caso queira receber o JSON no corpo da requisição:
    // const { page = 1, pageSize = 10 } = await req.json();

    const offset = (page - 1) * pageSize;

    // Consulta raw que retorna os pedidos com os pagamentos agregados em um array
    const whereConditions: string[] = [];

    if (filterMode === 'hideTests') {
      whereConditions.push(`NOT (
        LOWER(p.email) LIKE '%teste%' OR
        LOWER(p.email) LIKE '%spikeboom%' OR
        LOWER(p.email) LIKE '%robertocruzneto%' OR
        LOWER(p.email) LIKE '%+%test%'
      )`);
    } else if (filterMode === 'showOnlyTests') {
      whereConditions.push(`(
        LOWER(p.email) LIKE '%teste%' OR
        LOWER(p.email) LIKE '%spikeboom%' OR
        LOWER(p.email) LIKE '%robertocruzneto%' OR
        LOWER(p.email) LIKE '%+%test%'
      )`);
    }

    // Filtro para pedidos efetivados (pagos)
    if (apenasEfetivados) {
      whereConditions.push(`(
        p.status_pagamento = 'PAID' OR
        EXISTS (
          SELECT 1 FROM "StatusPagamento" sp
          WHERE sp.info->>'reference_id' = p.id
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(sp.info->'charges') AS charge
            WHERE charge->>'status' = 'PAID'
          )
        )
      )`);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const pedidosComPagamentos = await prisma.$queryRawUnsafe(`
      SELECT
        p.*,
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', sp.id,
              'info', sp.info,
              'status', CASE
                          WHEN agg.total_charges = agg.total_paid THEN 'Pagamento Completo'
                          WHEN agg.total_paid > 0 THEN 'Pagamento Parcial'
                          ELSE 'Falha no Pagamento'
                        END
            )
          )
          FROM "StatusPagamento" sp
          LEFT JOIN LATERAL (
            SELECT 
              COUNT(*) AS total_charges,
              SUM(CASE WHEN charge->>'status' = 'PAID' THEN 1 ELSE 0 END) AS total_paid
            FROM (
              SELECT jsonb_array_elements(sp.info->'charges') AS charge
            ) sub
          ) agg ON true
          WHERE sp.info->>'reference_id' = p.id
        ) AS pagamentos
      FROM "Pedido" p
      ${whereClause}
      ORDER BY p."createdAt" DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    return NextResponse.json(pedidosComPagamentos);
  } catch (error) {
    console.error("Erro ao buscar pedidos com pagamentos:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
