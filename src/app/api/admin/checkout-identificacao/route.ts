import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EVENT_LABELS: Record<string, string> = {
  identificacao_page_viewed: "Abriu identificacao",
  identificacao_cart_loaded: "Carrinho carregou",
  identificacao_form_prefilled: "Formulario preenchido",
  identificacao_first_interaction: "Primeira interacao",
  identificacao_cep_completed: "CEP completo",
  identificacao_cep_lookup_started: "Consulta CEP iniciou",
  identificacao_cep_lookup_success: "Consulta CEP ok",
  identificacao_cep_lookup_failed: "Consulta CEP falhou",
  identificacao_continue_clicked: "Clicou continuar",
  identificacao_validation_failed: "Validacao falhou",
  identificacao_validation_passed: "Validacao passou",
  identificacao_storage_save_started: "Salvar local iniciou",
  identificacao_storage_save_success: "Salvar local ok",
  identificacao_storage_save_failed: "Salvar local falhou",
  identificacao_sync_started: "Sync iniciou",
  identificacao_sync_success: "Sync ok",
  identificacao_sync_failed: "Sync falhou",
  identificacao_navigate_entrega_attempted: "Tentou ir entrega",
  identificacao_navigate_entrega_called: "Navegacao chamada",
  identificacao_entrega_arrived: "Chegou na entrega",
  identificacao_empty_cart_redirect: "Carrinho vazio",
  identificacao_runtime_error: "Erro JS",
  identificacao_unhandled_rejection: "Promise sem tratamento",
  identificacao_page_hidden: "Saiu da pagina",
};

const ORDERED_EVENTS = [
  "identificacao_page_viewed",
  "identificacao_cart_loaded",
  "identificacao_continue_clicked",
  "identificacao_validation_failed",
  "identificacao_validation_passed",
  "identificacao_storage_save_success",
  "identificacao_sync_success",
  "identificacao_navigate_entrega_attempted",
  "identificacao_entrega_arrived",
];

function parseDate(value: string | null, fallback: Date) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  return new Date(`${value}T00:00:00.000-03:00`);
}

function endOfDay(value: string | null, fallback: Date) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  return new Date(`${value}T23:59:59.999-03:00`);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const now = new Date();
  const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dataInicio = parseDate(params.get("dataInicio"), defaultStart);
  const dataFim = endOfDay(params.get("dataFim"), now);
  const includeTests = params.get("includeTests") === "true";

  const whereSql = Prisma.sql`
    "createdAt" >= ${dataInicio}
    AND "createdAt" <= ${dataFim}
    ${includeTests ? Prisma.empty : Prisma.sql`AND "isTest" = false`}
  `;

  const [stepRows, totalsRows, invalidFieldRows, errorRows] = await Promise.all([
    prisma.$queryRaw<Array<{ eventName: string; events: bigint; sessions: bigint; tests: bigint }>>`
      SELECT
        "eventName",
        COUNT(*) AS events,
        COUNT(DISTINCT "checkoutSessionId") AS sessions,
        COUNT(*) FILTER (WHERE "isTest" = true) AS tests
      FROM "checkout_identificacao_events"
      WHERE ${whereSql}
      GROUP BY "eventName"
    `,
    prisma.$queryRaw<Array<{ events: bigint; sessions: bigint; tests: bigint }>>`
      SELECT
        COUNT(*) AS events,
        COUNT(DISTINCT "checkoutSessionId") AS sessions,
        COUNT(*) FILTER (WHERE "isTest" = true) AS tests
      FROM "checkout_identificacao_events"
      WHERE ${whereSql}
    `,
    prisma.$queryRaw<Array<{ field: string; count: bigint }>>`
      SELECT field, COUNT(*) AS count
      FROM "checkout_identificacao_events",
      LATERAL jsonb_array_elements_text(COALESCE(payload->'invalid_fields', '[]'::jsonb)) AS field
      WHERE ${whereSql}
        AND "eventName" = 'identificacao_validation_failed'
      GROUP BY field
      ORDER BY count DESC, field ASC
      LIMIT 10
    `,
    prisma.checkoutIdentificacaoEvent.findMany({
      where: {
        createdAt: { gte: dataInicio, lte: dataFim },
        ...(includeTests ? {} : { isTest: false }),
        eventName: {
          in: [
            "identificacao_cep_lookup_failed",
            "identificacao_storage_save_failed",
            "identificacao_sync_failed",
            "identificacao_runtime_error",
            "identificacao_unhandled_rejection",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        eventName: true,
        severity: true,
        checkoutSessionId: true,
        isTest: true,
        elapsedMs: true,
        payload: true,
        createdAt: true,
      },
    }),
  ]);

  const rowByEvent = new Map(stepRows.map((row) => [row.eventName, row]));
  const steps = ORDERED_EVENTS.map((eventName) => {
    const row = rowByEvent.get(eventName);
    return {
      key: eventName,
      label: EVENT_LABELS[eventName] || eventName,
      events: Number(row?.events || 0),
      sessions: Number(row?.sessions || 0),
      tests: Number(row?.tests || 0),
    };
  });

  const extras = stepRows
    .filter((row) => !ORDERED_EVENTS.includes(row.eventName))
    .map((row) => ({
      key: row.eventName,
      label: EVENT_LABELS[row.eventName] || row.eventName,
      events: Number(row.events || 0),
      sessions: Number(row.sessions || 0),
      tests: Number(row.tests || 0),
    }))
    .sort((a, b) => b.events - a.events);

  const totals = totalsRows[0];

  return NextResponse.json({
    dataInicio: dataInicio.toISOString(),
    dataFim: dataFim.toISOString(),
    includeTests,
    totals: {
      events: Number(totals?.events || 0),
      sessions: Number(totals?.sessions || 0),
      tests: Number(totals?.tests || 0),
    },
    steps,
    extras,
    invalidFields: invalidFieldRows.map((row) => ({
      field: row.field,
      count: Number(row.count),
    })),
    recentErrors: errorRows.map((row) => ({
      eventName: row.eventName,
      label: EVENT_LABELS[row.eventName] || row.eventName,
      severity: row.severity,
      checkoutSessionId: row.checkoutSessionId,
      isTest: row.isTest,
      elapsedMs: row.elapsedMs,
      payload: row.payload,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
