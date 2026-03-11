import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

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
  paid_social: `AND session_source IN ('ig', 'facebook', 'fb', 'instagram', 'meta')
    AND session_medium IN ('paid', 'cpc', 'ppc', 'paidsocial')`,
  organic_social: `AND session_source IN ('ig', 'facebook', 'fb', 'instagram', 'l.instagram.com', 'm.facebook.com', 'l.facebook.com', 'facebook.com', 'instagram.com')
    AND session_medium IN ('organic', 'social', 'referral')`,
  organic_search: `AND session_medium = 'organic'
    AND session_source IN ('google', 'bing', 'yahoo', 'duckduckgo')`,
  direct: `AND (session_source IS NULL OR session_source = '(direct)')
    AND (session_medium IS NULL OR session_medium = '(none)')`,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = Math.min(Number(searchParams.get("days") || 30), 90);
  const channel = searchParams.get("channel") || "all";
  const dataset = process.env.BQ_DATASET_ID || "analytics_468537898";
  const channelFilter = CHANNEL_FILTERS[channel] || "";

  try {
    const bq = getBigQueryClient();

    const query = `
      WITH date_range AS (
        SELECT
          FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)) AS start_date,
          FORMAT_DATE('%Y%m%d', CURRENT_DATE()) AS end_date
      ),

      raw_events AS (
        SELECT
          CONCAT(user_pseudo_id, '.', CAST(
            (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS STRING
          )) AS session_id,
          event_name,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'checkout_step') AS checkout_step_name,
          collected_traffic_source.manual_source AS traffic_source,
          collected_traffic_source.manual_medium AS traffic_medium
        FROM \`${dataset}.events_*\`, date_range
        WHERE _TABLE_SUFFIX BETWEEN date_range.start_date AND date_range.end_date
      ),

      session_traffic AS (
        SELECT
          session_id,
          ARRAY_AGG(traffic_source IGNORE NULLS ORDER BY traffic_source LIMIT 1)[SAFE_OFFSET(0)] AS session_source,
          ARRAY_AGG(traffic_medium IGNORE NULLS ORDER BY traffic_medium LIMIT 1)[SAFE_OFFSET(0)] AS session_medium
        FROM raw_events
        WHERE session_id IS NOT NULL
        GROUP BY session_id
      ),

      session_events AS (
        SELECT
          r.session_id,
          ARRAY_AGG(DISTINCT r.event_name) AS events,
          ARRAY_AGG(DISTINCT r.checkout_step_name IGNORE NULLS) AS checkout_steps,
          t.session_source,
          t.session_medium
        FROM raw_events r
        JOIN session_traffic t ON r.session_id = t.session_id
        GROUP BY r.session_id, t.session_source, t.session_medium
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
          COUNTIF('page_view' IN UNNEST(events)) AS page_view,
          COUNTIF('view_search_results' IN UNNEST(events)) AS view_search_results,
          COUNTIF('view_item' IN UNNEST(events)) AS view_item,
          COUNTIF('add_to_cart' IN UNNEST(events)) AS add_to_cart,
          COUNTIF('view_cart' IN UNNEST(events)) AS view_cart,
          COUNTIF('begin_checkout' IN UNNEST(events)) AS begin_checkout,
          COUNTIF('identificacao' IN UNNEST(checkout_steps)) AS step_identificacao,
          COUNTIF('entrega' IN UNNEST(checkout_steps)) AS step_entrega,
          COUNTIF('add_shipping_info' IN UNNEST(events)) AS add_shipping_info,
          COUNTIF('pagamento' IN UNNEST(checkout_steps)) AS step_pagamento,
          COUNTIF('add_payment_info' IN UNNEST(events)) AS add_payment_info,
          COUNTIF('purchase' IN UNNEST(events)) AS purchase,
        FROM filtered_sessions
      )

      SELECT * FROM funnel
    `;

    const [rows] = await bq.query({
      query,
      params: { days },
    });

    const data = rows[0] || {};

    const steps = [
      { key: "page_view", label: "Home / Página", count: Number(data.page_view || 0) },
      { key: "view_search_results", label: "Busca", count: Number(data.view_search_results || 0) },
      { key: "view_item", label: "Página de Produto", count: Number(data.view_item || 0) },
      { key: "add_to_cart", label: "Adicionou ao Carrinho", count: Number(data.add_to_cart || 0) },
      { key: "view_cart", label: "Entrou no Carrinho", count: Number(data.view_cart || 0) },
      { key: "begin_checkout", label: "Iniciou Checkout", count: Number(data.begin_checkout || 0) },
      { key: "step_identificacao", label: "Identificação", count: Number(data.step_identificacao || 0) },
      { key: "step_entrega", label: "Entrega", count: Number(data.step_entrega || 0) },
      { key: "add_shipping_info", label: "Selecionou Frete", count: Number(data.add_shipping_info || 0) },
      { key: "step_pagamento", label: "Pagamento", count: Number(data.step_pagamento || 0) },
      { key: "add_payment_info", label: "Iniciou Pagamento PIX/Cartão", count: Number(data.add_payment_info || 0) },
      { key: "purchase", label: "Comprou", count: Number(data.purchase || 0) },
    ];

    const totalSessions = Number(data.total_sessions || 0);

    return NextResponse.json({ steps, totalSessions, days, channel });
  } catch (err: unknown) {
    console.error("Funil API error:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
