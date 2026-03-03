"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { KpiCard } from "./components/KpiCard";
import { FaturamentoChart } from "./components/FaturamentoChart";
import { CanalChart } from "./components/CanalChart";
import { RankingProdutos } from "./components/RankingProdutos";
import { QuantidadeProdutos } from "./components/QuantidadeProdutos";
import { EstoqueTable } from "./components/EstoqueTable";
import { PeriodoFilter } from "./components/PeriodoFilter";

interface MargemProduto {
  nome: string;
  custoOperacional: number;
  precoVenda: number;
  margemBruta: number;
}

interface DashboardData {
  faturamento: number;
  ticketMedio: number;
  totalPedidos: number;
  varFaturamento: number;
  varTicketMedio: number;
  varPedidos: number;
  faturamentoPorDia: { dia: string; valor: number }[];
  faturamentoMesAnteriorPorDia: { dia: string; valor: number }[];
  faturamentoPorCanal: { origem: string; valor: number; pedidos: number }[];
  rankingProdutos: { nome: string; faturamento: number; quantidade: number }[];
  quantidadePorProduto: { nome: string; quantidade: number; faturamento: number }[];
  margemProdutos: MargemProduto[];
  margemBrutaMedia: number;
  periodo: { mes: number; ano: number };
  periodoAnterior: { mes: number; ano: number };
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function DollarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function MarginIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className || "h-10 w-10"}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function DashboardPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [origem, setOrigem] = useState("todos");
  const [statusPagamento, setStatusPagamento] = useState("todos");
  const [filterMode, setFilterMode] = useState<"hideTests" | "showOnlyTests">("hideTests");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initialLoad = useRef(true);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        mes: String(mes),
        ano: String(ano),
        origem,
        statusPagamento,
        filterMode,
      });
      const res = await fetch(`/api/admin/dashboard?${params}`);
      console.log("[DASHBOARD FRONT] status:", res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error("[DASHBOARD FRONT] error body:", text);
        throw new Error("Erro ao carregar dados");
      }
      const json = await res.json();
      console.log("[DASHBOARD FRONT] data:", json);
      setData(json);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Only fetch on first mount
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      fetchData();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f3ed]">
      {/* Header */}
      <div className="bg-[#254333] px-4 lg:px-8 py-6">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-cera-pro font-bold text-[14px] text-white/60 uppercase tracking-wider">
                Love
              </span>
              <span className="text-white/40">|</span>
              <h1 className="font-cera-pro font-bold text-[24px] lg:text-[32px] text-white leading-normal">
                Dashboard Executivo
              </h1>
            </div>
            <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-white/80 mt-1">
              Visao geral de desempenho da loja
            </p>
          </div>
          <Link
            href="/pedidos"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-[8px] transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-cera-pro font-medium text-[14px] text-white">
              Pedidos
            </span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4 lg:p-5 mb-6">
          <PeriodoFilter
            mes={mes}
            ano={ano}
            origem={origem}
            statusPagamento={statusPagamento}
            filterMode={filterMode}
            onMesChange={setMes}
            onAnoChange={setAno}
            onOrigemChange={setOrigem}
            onStatusChange={setStatusPagamento}
            onFilterModeChange={setFilterMode}
            onApply={fetchData}
            loading={loading}
          />
        </div>

        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-20">
            <SpinnerIcon className="h-10 w-10 text-[#254333]" />
            <p className="font-cera-pro font-light text-[14px] text-[#666666] mt-4">
              Carregando dashboard...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-6">
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="font-cera-pro font-light text-[14px] text-[#B3261E]">
                {error}
              </p>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-[#254333] hover:bg-[#1a3226] rounded-[8px] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[14px] text-white">
                Tentar Novamente
              </span>
            </button>
          </div>
        ) : data ? (
          <div className={`flex flex-col gap-6 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                titulo="Faturamento"
                valor={formatCurrency(data.faturamento)}
                variacao={data.varFaturamento}
                icone={<DollarIcon />}
              />
              <KpiCard
                titulo="Ticket Medio"
                valor={formatCurrency(data.ticketMedio)}
                variacao={data.varTicketMedio}
                icone={<TicketIcon />}
              />
              <KpiCard
                titulo="Pedidos"
                valor={String(data.totalPedidos)}
                variacao={data.varPedidos}
                icone={<CartIcon />}
              />
              <KpiCard
                titulo="Margem Bruta"
                valor={data.margemBrutaMedia > 0 ? `${data.margemBrutaMedia.toFixed(1)}%` : ""}
                icone={<MarginIcon />}
                aviso={data.margemBrutaMedia > 0 ? undefined : "Sem dados de custo cadastrados"}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FaturamentoChart
                  dadosAtual={data.faturamentoPorDia}
                  dadosAnterior={data.faturamentoMesAnteriorPorDia}
                  mesAtual={data.periodo.mes}
                  anoAtual={data.periodo.ano}
                />
              </div>
              <div>
                <CanalChart dados={data.faturamentoPorCanal} />
              </div>
            </div>

            {/* Margem Bruta por Produto */}
            {data.margemProdutos.length > 0 && (
              <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5">
                <div className="mb-4">
                  <h3 className="font-cera-pro font-bold text-[16px] text-black">
                    Margem Bruta por Produto
                  </h3>
                  <p className="font-cera-pro font-light text-[11px] text-[#999999] mt-0.5">
                    (Preco de Venda - CPV) / Preco de Venda
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#e5e5e5]">
                        <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 uppercase tracking-wide">Produto</th>
                        <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">CPV</th>
                        <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">Preco Venda</th>
                        <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">Margem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.margemProdutos.map((item) => (
                        <tr key={item.nome} className="border-b border-[#f0f0f0]">
                          <td className="font-cera-pro font-light text-[12px] text-[#333333] py-2.5 pr-2">{item.nome}</td>
                          <td className="font-cera-pro font-light text-[12px] text-[#666666] py-2.5 text-right tabular-nums">{formatCurrency(item.custoOperacional)}</td>
                          <td className="font-cera-pro font-medium text-[12px] text-[#333333] py-2.5 text-right tabular-nums">{item.precoVenda > 0 ? formatCurrency(item.precoVenda) : "--"}</td>
                          <td className={`font-cera-pro font-bold text-[13px] py-2.5 text-right tabular-nums ${item.margemBruta >= 50 ? "text-[#009142]" : item.margemBruta >= 30 ? "text-[#7B6F5E]" : item.margemBruta >= 15 ? "text-orange-600" : "text-[#B3261E]"}`}>
                            {item.precoVenda > 0 ? `${item.margemBruta.toFixed(1)}%` : "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ranking + Estoque */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RankingProdutos dados={data.rankingProdutos} margemProdutos={data.margemProdutos} />
              <QuantidadeProdutos dados={data.quantidadePorProduto} />
              <EstoqueTable />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
