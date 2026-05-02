"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshIcon, SpinnerIcon } from "./Icons";

interface FunnelStep {
  key: string;
  label: string;
  count: number;
  users: number;
  events: number;
}

type ViewMode = "sessions" | "users" | "events";

interface FunnelData {
  steps: FunnelStep[];
  totalSessions: number;
  totalUsers: number;
  totalEvents: number;
  dataInicio: string;
  dataFim: string;
}

const STEP_COLORS = [
  "#254333",
  "#2b4e3d",
  "#315947",
  "#376451",
  "#3d6f5b",
  "#437a65",
  "#498f73",
  "#4fa481",
  "#55b88b",
  "#5fc898",
  "#69d8a5",
  "#009142",
];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_CHANNELS = new Set(["all", "paid_social", "organic_social", "organic_search", "direct"]);
const VALID_VIEW_MODES = new Set<ViewMode>(["sessions", "users", "events"]);

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function FunilPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const defaultFim = formatDateISO(now);
  const defaultInicio = formatDateISO(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

  // Read initial filter values from URL query params (so they survive a re-login)
  const urlDataInicio = searchParams.get("funil_dataInicio");
  const urlDataFim = searchParams.get("funil_dataFim");
  const urlChannel = searchParams.get("funil_channel");
  const urlViewMode = searchParams.get("funil_viewMode");
  const urlExcludeTests = searchParams.get("funil_excludeTests");
  const urlAutoApply = searchParams.get("funil_apply") === "1";

  const initialDataInicio = urlDataInicio && ISO_DATE_RE.test(urlDataInicio) ? urlDataInicio : defaultInicio;
  const initialDataFim = urlDataFim && ISO_DATE_RE.test(urlDataFim) ? urlDataFim : defaultFim;
  const initialChannel = urlChannel && VALID_CHANNELS.has(urlChannel) ? urlChannel : "all";
  const initialViewMode: ViewMode = urlViewMode && VALID_VIEW_MODES.has(urlViewMode as ViewMode) ? (urlViewMode as ViewMode) : "sessions";
  const initialExcludeTests = urlExcludeTests === null ? true : urlExcludeTests === "1";

  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataInicio, setDataInicio] = useState(initialDataInicio);
  const [dataFim, setDataFim] = useState(initialDataFim);
  const [channel, setChannel] = useState(initialChannel);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [excludeTests, setExcludeTests] = useState(initialExcludeTests);

  const fetchFunnel = useCallback(async (filters: {
    dataInicio: string;
    dataFim: string;
    channel: string;
    excludeTests: boolean;
  }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/funil?dataInicio=${filters.dataInicio}&dataFim=${filters.dataFim}&channel=${filters.channel}&excludeTests=${filters.excludeTests}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erro ao buscar funil");
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  const writeFiltersToUrl = useCallback((filters: {
    dataInicio: string;
    dataFim: string;
    channel: string;
    viewMode: ViewMode;
    excludeTests: boolean;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "funil");
    params.set("funil_dataInicio", filters.dataInicio);
    params.set("funil_dataFim", filters.dataFim);
    params.set("funil_channel", filters.channel);
    params.set("funil_viewMode", filters.viewMode);
    params.set("funil_excludeTests", filters.excludeTests ? "1" : "0");
    params.set("funil_apply", "1");
    router.replace(`/pedidos?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleApply = useCallback(() => {
    writeFiltersToUrl({ dataInicio, dataFim, channel, viewMode, excludeTests });
    fetchFunnel({ dataInicio, dataFim, channel, excludeTests });
  }, [writeFiltersToUrl, fetchFunnel, dataInicio, dataFim, channel, viewMode, excludeTests]);

  // Recover from re-login: if the URL already has funil_apply=1 (filters were
  // persisted before an auth redirect), auto-run the query once on mount.
  const didAutoApplyRef = useRef(false);
  useEffect(() => {
    if (didAutoApplyRef.current) return;
    didAutoApplyRef.current = true;
    if (urlAutoApply) {
      fetchFunnel({
        dataInicio: initialDataInicio,
        dataFim: initialDataFim,
        channel: initialChannel,
        excludeTests: initialExcludeTests,
      });
    }
  }, [urlAutoApply, initialDataInicio, initialDataFim, initialChannel, initialExcludeTests, fetchFunnel]);

  const numDays = diffDays(dataInicio, dataFim);

  if (error) {
    return (
      <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-6">
        <div className="flex gap-[8px] items-center bg-red-50 rounded-lg p-3 mb-4">
          <p className="font-cera-pro font-light text-[14px] text-[#B3261E]">{error}</p>
        </div>
        <button
          onClick={handleApply}
          className="flex items-center gap-2 px-4 py-2 bg-[#254333] hover:bg-[#1a3226] rounded-[8px] transition-colors"
        >
          <RefreshIcon />
          <span className="font-cera-pro font-medium text-[14px] text-white">Tentar Novamente</span>
        </button>
      </div>
    );
  }

  const steps = data?.steps ?? [];
  const totalSessions = data?.totalSessions ?? 0;
  const totalUsers = data?.totalUsers ?? 0;
  const totalEvents = data?.totalEvents ?? 0;
  const getValue = (step: FunnelStep) =>
    viewMode === "users" ? step.users : viewMode === "events" ? step.events : step.count;
  // Use the second step as the max reference for bar proportions,
  // so Home (always much larger) doesn't compress all other bars.
  const maxCountForBars = steps.length > 1 ? Math.max(...steps.slice(1).map(getValue), 1) : 1;
  const totalDisplay = viewMode === "users" ? totalUsers : viewMode === "events" ? totalEvents : totalSessions;
  const viewModeLabel = viewMode === "users" ? "usuários" : viewMode === "events" ? "eventos" : "sessões";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D8F9E7] rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#254333" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Funil de Conversão
              </p>
              <p className="font-cera-pro font-light text-[12px] text-[#666666]">
                {data ? (
                  <>
                    {totalDisplay.toLocaleString("pt-BR")} {viewModeLabel} ({numDays} dias)
                    {channel !== "all" && (
                      <span className="ml-1 px-2 py-0.5 bg-[#D8F9E7] rounded text-[11px] text-[#254333] font-medium">
                        {({ paid_social: "Paid Social", organic_social: "Social Orgânico", organic_search: "Busca Orgânica", direct: "Direto" } as Record<string, string>)[channel]}
                      </span>
                    )}
                  </>
                ) : (
                  "Selecione os filtros e clique em Aplicar para consultar o funil"
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="px-4 py-2 border border-[#d2d2d2] rounded-[8px] font-cera-pro font-medium text-[14px] text-[#333333] bg-white hover:bg-[#f8f3ed] transition-colors cursor-pointer"
            >
              <option value="sessions">Sessões</option>
              <option value="users">Usuários únicos</option>
              <option value="events">Eventos</option>
            </select>

            <button
              onClick={() => setExcludeTests(!excludeTests)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-[8px] font-cera-pro font-medium text-[14px] transition-colors cursor-pointer ${
                excludeTests
                  ? "border-[#254333] bg-[#D8F9E7] text-[#254333]"
                  : "border-[#d2d2d2] bg-white text-[#999999]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {excludeTests ? (
                  <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 12l2 2 4-4" /></>
                ) : (
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                )}
              </svg>
              Excluir testes
            </button>

            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="px-4 py-2 border border-[#d2d2d2] rounded-[8px] font-cera-pro font-medium text-[14px] text-[#333333] bg-white hover:bg-[#f8f3ed] transition-colors cursor-pointer"
            >
              <option value="all">Todos os canais</option>
              <option value="paid_social">Paid Social</option>
              <option value="organic_social">Social Orgânico</option>
              <option value="organic_search">Busca Orgânica</option>
              <option value="direct">Direto</option>
            </select>

            <div className="flex items-center gap-2">
              <label className="font-cera-pro font-medium text-[12px] text-[#666666] uppercase tracking-wide">
                De
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="px-3 py-2 border border-[#d2d2d2] rounded-[8px] font-cera-pro font-medium text-[13px] text-[#333333] bg-white outline-none focus:border-[#254333] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-cera-pro font-medium text-[12px] text-[#666666] uppercase tracking-wide">
                Até
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="px-3 py-2 border border-[#d2d2d2] rounded-[8px] font-cera-pro font-medium text-[13px] text-[#333333] bg-white outline-none focus:border-[#254333] transition-colors"
              />
            </div>

            <button
              onClick={handleApply}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#254333] hover:bg-[#1a3226] disabled:opacity-60 rounded-[8px] transition-colors"
            >
              {loading ? (
                <SpinnerIcon className="w-4 h-4 text-white" />
              ) : (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              <span className="font-cera-pro font-medium text-[14px] text-white">
                {loading ? "Consultando..." : "Aplicar"}
              </span>
            </button>

            {data && (
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:opacity-60 rounded-[8px] transition-colors"
              >
                <RefreshIcon />
                <span className="font-cera-pro font-medium text-[14px] text-[#254333]">Atualizar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty state — nothing applied yet */}
      {!data && !loading && (
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-12 text-center">
          <div className="w-12 h-12 bg-[#D8F9E7] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254333" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <p className="font-cera-pro font-medium text-[16px] text-[#333333]">
            Nenhum dado carregado
          </p>
          <p className="font-cera-pro font-light text-[13px] text-[#666666] mt-1">
            Ajuste os filtros acima e clique em <strong>Aplicar</strong> para consultar o funil.
          </p>
        </div>
      )}

      {/* Loading state — initial query */}
      {!data && loading && (
        <div className="flex items-center justify-center py-20">
          <SpinnerIcon className="h-8 w-8 text-[#254333]" />
          <span className="ml-3 font-cera-pro font-light text-[14px] text-[#666666]">
            Consultando BigQuery...
          </span>
        </div>
      )}

      {/* Funnel Chart */}
      {data && (
        <div className={`bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-6 lg:p-8 transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="space-y-3">
            {steps.map((step, i) => {
              const val = getValue(step);
              const firstVal = getValue(steps[0]);
              const prevVal = i > 0 ? getValue(steps[i - 1]) : val;
              const widthPct = i === 0
                ? 100
                : maxCountForBars > 0 ? Math.max((val / maxCountForBars) * 100, 4) : 4;
              const dropRate = prevVal > 0 ? ((prevVal - val) / prevVal) * 100 : 0;
              const conversionFromFirst = firstVal > 0 ? (val / firstVal) * 100 : 0;

              return (
                <div key={step.key} className="group">
                  <div className="flex items-center gap-4">
                    {/* Step number */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-cera-pro font-bold text-[12px]"
                      style={{ backgroundColor: STEP_COLORS[i] || STEP_COLORS[0] }}
                    >
                      {i + 1}
                    </div>

                    {/* Label */}
                    <div className="w-[180px] flex-shrink-0">
                      <p className="font-cera-pro font-medium text-[14px] text-[#333333] truncate">
                        {step.label}
                      </p>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 h-10 bg-[#f0f0f0] rounded-[6px] overflow-hidden relative">
                      <div
                        className="h-full rounded-[6px] transition-all duration-700 ease-out flex items-center px-3"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: STEP_COLORS[i] || STEP_COLORS[0],
                        }}
                      >
                        <span className="font-cera-pro font-bold text-[13px] text-white whitespace-nowrap">
                          {val.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="w-[120px] flex-shrink-0 text-right">
                      <p className="font-cera-pro font-medium text-[13px] text-[#333333]">
                        {conversionFromFirst.toFixed(1)}%
                      </p>
                      {i > 0 && dropRate > 0 && (
                        <p className="font-cera-pro font-light text-[11px] text-[#B3261E]">
                          -{dropRate.toFixed(1)}% drop
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Drop arrow between steps */}
                  {i < steps.length - 1 && (
                    <div className="flex items-center gap-4 py-0.5">
                      <div className="w-7 flex justify-center">
                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                          <path d="M4 0v10M1 7l3 3 3-3" stroke="#ccc" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const purchaseStep = steps.find((s) => s.key === "purchase") || steps[steps.length - 1];
                const cartStep = steps.find((s) => s.key === "view_cart");
                const checkoutStep = steps.find((s) => s.key === "begin_checkout");
                const firstStep = steps[0];
                const purchaseVal = getValue(purchaseStep);
                const firstVal = getValue(firstStep);
                const cartVal = cartStep ? getValue(cartStep) : 0;
                const checkoutVal = checkoutStep ? getValue(checkoutStep) : 0;
                return (
                  <>
                    <SummaryCard
                      label="Taxa de Conversão"
                      value={`${firstVal > 0 ? ((purchaseVal / firstVal) * 100).toFixed(2) : 0}%`}
                      subtitle="Página → Compra"
                      color="#009142"
                    />
                    <SummaryCard
                      label="Carrinho → Compra"
                      value={`${cartVal > 0 ? ((purchaseVal / cartVal) * 100).toFixed(1) : 0}%`}
                      subtitle="Conversão do carrinho"
                      color="#254333"
                    />
                    <SummaryCard
                      label="Checkout → Compra"
                      value={`${checkoutVal > 0 ? ((purchaseVal / checkoutVal) * 100).toFixed(1) : 0}%`}
                      subtitle="Conversão do checkout"
                      color="#254333"
                    />
                    <SummaryCard
                      label="Total de Compras"
                      value={purchaseVal.toLocaleString("pt-BR")}
                      subtitle={`${numDays} dias`}
                      color="#009142"
                    />
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtitle,
  color,
}: {
  label: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-[#f8f3ed] rounded-[12px] p-4">
      <p className="font-cera-pro font-light text-[12px] text-[#666666]">{label}</p>
      <p className="font-cera-pro font-bold text-[24px] mt-1" style={{ color }}>
        {value}
      </p>
      <p className="font-cera-pro font-light text-[11px] text-[#999999] mt-0.5">{subtitle}</p>
    </div>
  );
}
