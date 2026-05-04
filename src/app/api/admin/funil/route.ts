import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import { prisma } from "@/lib/prisma";

function getBigQueryClient(): BigQuery {
  const raw = process.env.BQ_CREDENTIALS;
  if (!raw) throw new Error("BQ_CREDENTIALS not set");
  const credentials = JSON.parse(raw);
  return new BigQuery({
    projectId: process.env.BQ_PROJECT_ID || "lovecommerce",
    credentials,
  });
}

const CHANNEL_FILTERS: Record<string, string> = {
  all: "",
  paid_social: `AND user_source IN ('ig', 'facebook', 'fb', 'instagram', 'meta')
    AND user_medium IN ('paid', 'cpc', 'ppc', 'paidsocial')`,
  organic_social: `AND user_source IN ('ig', 'facebook', 'fb', 'instagram', 'l.instagram.com', 'm.facebook.com', 'l.facebook.com', 'facebook.com', 'instagram.com')
    AND user_medium IN ('organic', 'social', 'referral')`,
  organic_search: `AND user_medium = 'organic'
    AND user_source IN ('google', 'bing', 'yahoo', 'duckduckgo')`,
  direct: `AND (user_source IS NULL OR user_source = '(direct)')
    AND (user_medium IS NULL OR user_medium = '(none)')`,
};

function formatDateBQ(dateStr: string): string {
  // Expects YYYY-MM-DD, returns YYYYMMDD for BigQuery table suffix
  return dateStr.replace(/-/g, "");
}

function isValidDateISO(value: string): boolean {
  // Strict YYYY-MM-DD to avoid query injection and invalid table suffixes.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().startsWith(value);
}

async function tableExists(bq: BigQuery, dataset: string, tableName: string): Promise<boolean> {
  const [rows] = await bq.query({
    query: `
      SELECT 1
      FROM \`${dataset}.INFORMATION_SCHEMA.TABLES\`
      WHERE table_name = @tableName
      LIMIT 1
    `,
    params: { tableName },
  });

  return rows.length > 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") || "all";
  const excludeTests = searchParams.get("excludeTests") !== "false"; // default true
  const dataset = process.env.BQ_DATASET_ID || "analytics_468537898";
  const channelFilter = CHANNEL_FILTERS[channel] || "";

  // Support dataInicio/dataFim or fallback to days param for backwards compatibility
  const now = new Date();
  let dataFim = searchParams.get("dataFim");
  let dataInicio = searchParams.get("dataInicio");

  if (!dataFim) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    dataFim = `${y}-${m}-${d}`;
  }

  if (!dataInicio) {
    const days = Math.min(Number(searchParams.get("days") || 30), 90);
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const y = startDate.getFullYear();
    const m = String(startDate.getMonth() + 1).padStart(2, "0");
    const d = String(startDate.getDate()).padStart(2, "0");
    dataInicio = `${y}-${m}-${d}`;
  }

  if (!isValidDateISO(dataInicio) || !isValidDateISO(dataFim)) {
    return NextResponse.json({ error: "Datas invalidas" }, { status: 400 });
  }

  const startDateBQ = formatDateBQ(dataInicio);
  const endDateBQ = formatDateBQ(dataFim);
  const todayBQ = formatDateBQ(now.toISOString().slice(0, 10));

  try {
    const bq = getBigQueryClient();

    // Fallback: fetch test checkout_session_ids from DB (scoped by date range)
    // Two strategies combined:
    //   1) sessionId starts with "t_" (new test users, post cookie-based system)
    //   2) email contains known test patterns (historical data, pre cookie-based system)
    const TEST_EMAIL_PATTERNS = ["teste", "spikeboom", "isabellejordanaa", "adrianofne", "uconvert"];
    let testSessionIds: string[] = [];
    if (excludeTests) {
      const dateFilter = {
        updatedAt: {
          gte: new Date(`${dataInicio}T00:00:00`),
          lte: new Date(`${dataFim}T23:59:59.999`),
        },
      };
      const testCheckouts = await prisma.checkoutAbandonado.findMany({
        where: {
          ...dateFilter,
          OR: [
            { sessionId: { startsWith: "t_" } },
            ...TEST_EMAIL_PATTERNS.map((p) => ({
              email: { contains: p, mode: "insensitive" as const },
            })),
          ],
        },
        select: { sessionId: true },
        distinct: ["sessionId"],
        take: 5000,
      });
      testSessionIds = [...new Set(testCheckouts.map((r) => r.sessionId))];
    }

    // GA4 export can also create `events_intraday_YYYYMMDD`, but BigQuery fails
    // if a wildcard table prefix matches no tables. Check today's intraday table first.
    const includeIntraday = endDateBQ >= todayBQ
      && await tableExists(bq, dataset, `events_intraday_${todayBQ}`);

    const intradaySource = includeIntraday ? `
      UNION ALL
      SELECT * FROM \`${dataset}.events_intraday_*\`
      WHERE _TABLE_SUFFIX BETWEEN '${startDateBQ}' AND '${endDateBQ}'
    ` : "";

    const eventsSource = `(
      SELECT * FROM \`${dataset}.events_*\`
      WHERE _TABLE_SUFFIX BETWEEN '${startDateBQ}' AND '${endDateBQ}'
      ${intradaySource}
    )`;

    const excludedCTE = testSessionIds.length > 0
      ? `excluded_users AS (
        SELECT DISTINCT user_pseudo_id
        FROM ${eventsSource} events
        WHERE (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'checkout_session_id')
            IN UNNEST(@testSessionIds)
      ),`
      : "";

    const excludeFilter = testSessionIds.length > 0
      ? "AND NOT EXISTS (SELECT 1 FROM excluded_users ex WHERE ex.user_pseudo_id = events.user_pseudo_id)"
      : "";

    const testEventFilter = excludeTests
      ? `AND NOT (
          IFNULL((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'is_test_user'), 0) = 1
          OR IFNULL(LOWER((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_test_user')), '') IN ('1', 'true', 'yes')
        )`
      : "";

    const query = `
      WITH ${excludedCTE}
      raw_events AS (
        SELECT
          user_pseudo_id,
          CONCAT(user_pseudo_id, '.', CAST(
            (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS STRING
          )) AS session_id,
          event_name,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'checkout_step') AS checkout_step_name,
          traffic_source.source AS user_source,
          traffic_source.medium AS user_medium
        FROM ${eventsSource} events
        WHERE IFNULL(
            (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'),
            ''
          ) NOT LIKE '%localhost%'
          ${testEventFilter}
          ${excludeFilter}
      ),

      user_traffic AS (
        SELECT
          user_pseudo_id,
          ARRAY_AGG(user_source IGNORE NULLS LIMIT 1)[SAFE_OFFSET(0)] AS user_source,
          ARRAY_AGG(user_medium IGNORE NULLS LIMIT 1)[SAFE_OFFSET(0)] AS user_medium
        FROM raw_events
        GROUP BY user_pseudo_id
      ),

      session_events AS (
        SELECT
          r.session_id,
          r.user_pseudo_id,
          ARRAY_AGG(DISTINCT r.event_name) AS events,
          ARRAY_AGG(DISTINCT r.checkout_step_name IGNORE NULLS) AS checkout_steps,
          t.user_source,
          t.user_medium
        FROM raw_events r
        JOIN user_traffic t ON r.user_pseudo_id = t.user_pseudo_id
        WHERE r.session_id IS NOT NULL
        GROUP BY r.session_id, r.user_pseudo_id, t.user_source, t.user_medium
      ),

      filtered_sessions AS (
        SELECT *
        FROM session_events
        WHERE 1=1
        ${channelFilter}
      ),

      funnel AS (
        SELECT
          COUNT(*) AS total_sessions,
          COUNT(DISTINCT user_pseudo_id) AS total_users,
          COUNTIF('page_view' IN UNNEST(events)) AS page_view,
          COUNT(DISTINCT IF('page_view' IN UNNEST(events), user_pseudo_id, NULL)) AS page_view_users,
          COUNTIF('view_search_results' IN UNNEST(events)) AS view_search_results,
          COUNT(DISTINCT IF('view_search_results' IN UNNEST(events), user_pseudo_id, NULL)) AS view_search_results_users,
          COUNTIF('view_item' IN UNNEST(events)) AS view_item,
          COUNT(DISTINCT IF('view_item' IN UNNEST(events), user_pseudo_id, NULL)) AS view_item_users,
          COUNTIF('add_to_cart' IN UNNEST(events)) AS add_to_cart,
          COUNT(DISTINCT IF('add_to_cart' IN UNNEST(events), user_pseudo_id, NULL)) AS add_to_cart_users,
          COUNTIF('view_cart' IN UNNEST(events)) AS view_cart,
          COUNT(DISTINCT IF('view_cart' IN UNNEST(events), user_pseudo_id, NULL)) AS view_cart_users,
          COUNTIF('begin_checkout' IN UNNEST(events)) AS begin_checkout,
          COUNT(DISTINCT IF('begin_checkout' IN UNNEST(events), user_pseudo_id, NULL)) AS begin_checkout_users,
          COUNTIF('identificacao' IN UNNEST(checkout_steps)) AS step_identificacao,
          COUNT(DISTINCT IF('identificacao' IN UNNEST(checkout_steps), user_pseudo_id, NULL)) AS step_identificacao_users,
          COUNTIF('entrega' IN UNNEST(checkout_steps)) AS step_entrega,
          COUNT(DISTINCT IF('entrega' IN UNNEST(checkout_steps), user_pseudo_id, NULL)) AS step_entrega_users,
          COUNTIF('add_shipping_info' IN UNNEST(events)) AS add_shipping_info,
          COUNT(DISTINCT IF('add_shipping_info' IN UNNEST(events), user_pseudo_id, NULL)) AS add_shipping_info_users,
          COUNTIF('pagamento' IN UNNEST(checkout_steps)) AS step_pagamento,
          COUNT(DISTINCT IF('pagamento' IN UNNEST(checkout_steps), user_pseudo_id, NULL)) AS step_pagamento_users,
          COUNTIF('add_payment_info' IN UNNEST(events)) AS add_payment_info,
          COUNT(DISTINCT IF('add_payment_info' IN UNNEST(events), user_pseudo_id, NULL)) AS add_payment_info_users,
          COUNTIF('purchase' IN UNNEST(events)) AS purchase,
          COUNT(DISTINCT IF('purchase' IN UNNEST(events), user_pseudo_id, NULL)) AS purchase_users
        FROM filtered_sessions
      ),

      event_counts AS (
        SELECT
          COUNTIF(r.event_name = 'page_view') AS page_view_events,
          COUNTIF(r.event_name = 'view_search_results') AS view_search_results_events,
          COUNTIF(r.event_name = 'view_item') AS view_item_events,
          COUNTIF(r.event_name = 'add_to_cart') AS add_to_cart_events,
          COUNTIF(r.event_name = 'view_cart') AS view_cart_events,
          COUNTIF(r.event_name = 'begin_checkout') AS begin_checkout_events,
          COUNTIF(r.event_name = 'checkout_step' AND r.checkout_step_name = 'identificacao') AS step_identificacao_events,
          COUNTIF(r.event_name = 'checkout_step' AND r.checkout_step_name = 'entrega') AS step_entrega_events,
          COUNTIF(r.event_name = 'add_shipping_info') AS add_shipping_info_events,
          COUNTIF(r.event_name = 'checkout_step' AND r.checkout_step_name = 'pagamento') AS step_pagamento_events,
          COUNTIF(r.event_name = 'add_payment_info') AS add_payment_info_events,
          COUNTIF(r.event_name = 'purchase') AS purchase_events,
          COUNT(*) AS total_events
        FROM raw_events r
        JOIN user_traffic t ON r.user_pseudo_id = t.user_pseudo_id
        WHERE 1=1
          ${channelFilter.replace(/user_source/g, "t.user_source").replace(/user_medium/g, "t.user_medium")}
      )

      SELECT f.*, e.*
      FROM funnel f, event_counts e
    `;

    const queryParams: Record<string, unknown> = {};
    if (testSessionIds.length > 0) {
      queryParams.testSessionIds = testSessionIds;
    }
    const [rows] = await bq.query({
      query,
      params: queryParams,
    });

    const data = rows[0] || {};

    const steps = [
      { key: "page_view", label: "Home / Página", count: Number(data.page_view || 0), users: Number(data.page_view_users || 0), events: Number(data.page_view_events || 0) },
      { key: "view_search_results", label: "Busca", count: Number(data.view_search_results || 0), users: Number(data.view_search_results_users || 0), events: Number(data.view_search_results_events || 0) },
      { key: "view_item", label: "Página de Produto", count: Number(data.view_item || 0), users: Number(data.view_item_users || 0), events: Number(data.view_item_events || 0) },
      { key: "add_to_cart", label: "Adicionou ao Carrinho", count: Number(data.add_to_cart || 0), users: Number(data.add_to_cart_users || 0), events: Number(data.add_to_cart_events || 0) },
      { key: "view_cart", label: "Entrou no Carrinho", count: Number(data.view_cart || 0), users: Number(data.view_cart_users || 0), events: Number(data.view_cart_events || 0) },
      { key: "begin_checkout", label: "Iniciou Checkout", count: Number(data.begin_checkout || 0), users: Number(data.begin_checkout_users || 0), events: Number(data.begin_checkout_events || 0) },
      { key: "step_identificacao", label: "Identificação", count: Number(data.step_identificacao || 0), users: Number(data.step_identificacao_users || 0), events: Number(data.step_identificacao_events || 0) },
      { key: "step_entrega", label: "Entrega", count: Number(data.step_entrega || 0), users: Number(data.step_entrega_users || 0), events: Number(data.step_entrega_events || 0) },
      { key: "add_shipping_info", label: "Selecionou Frete", count: Number(data.add_shipping_info || 0), users: Number(data.add_shipping_info_users || 0), events: Number(data.add_shipping_info_events || 0) },
      { key: "step_pagamento", label: "Pagamento", count: Number(data.step_pagamento || 0), users: Number(data.step_pagamento_users || 0), events: Number(data.step_pagamento_events || 0) },
      { key: "add_payment_info", label: "Iniciou Pagamento PIX/Cartão", count: Number(data.add_payment_info || 0), users: Number(data.add_payment_info_users || 0), events: Number(data.add_payment_info_events || 0) },
      { key: "purchase", label: "Comprou", count: Number(data.purchase || 0), users: Number(data.purchase_users || 0), events: Number(data.purchase_events || 0) },
    ];

    const totalSessions = Number(data.total_sessions || 0);
    const totalUsers = Number(data.total_users || 0);
    const totalEvents = Number(data.total_events || 0);

    return NextResponse.json({ steps, totalSessions, totalUsers, totalEvents, dataInicio, dataFim, channel, excludeTests });
  } catch (err: unknown) {
    console.error("Funil API error:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
