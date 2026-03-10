"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshIcon, SpinnerIcon, MailIcon, PhoneIcon, ClockIcon } from "./Icons";

interface AbandonoItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

interface Abandono {
  id: string;
  sessionId: string;
  step: string;
  email: string | null;
  telefone: string | null;
  nome: string | null;
  cpf: string | null;
  cep: string | null;
  cidade: string | null;
  estado: string | null;
  items: AbandonoItem[] | null;
  valor: number | null;
  cupons: string[];
  convertido: boolean;
  device: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AbandonosStats {
  totalAbandonados: number;
  totalConvertidos: number;
  totalHoje: number;
}

const STEP_LABELS: Record<string, string> = {
  identificacao: "Identificação",
  entrega: "Entrega",
  pagamento: "Pagamento",
};

const STEP_COLORS: Record<string, string> = {
  identificacao: "bg-yellow-100 text-yellow-800",
  entrega: "bg-blue-100 text-blue-800",
  pagamento: "bg-purple-100 text-purple-800",
};

function formatPhone(phone: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "ontem";
  return `${diffDays} dias atrás`;
}

export function AbandonosPanel() {
  const [abandonos, setAbandonos] = useState<Abandono[]>([]);
  const [stats, setStats] = useState<AbandonosStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<"abandonados" | "convertidos" | "todos">("abandonados");
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pageSize = 20;

  const fetchAbandonos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        filtro,
        busca,
      });
      const res = await fetch(`/api/admin/abandonos?${params}`);
      if (!res.ok) throw new Error("Erro ao buscar abandonos");
      const data = await res.json();
      setAbandonos(data.abandonos);
      setTotal(data.total);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [page, filtro, busca]);

  useEffect(() => {
    fetchAbandonos(false);
  }, [fetchAbandonos]);

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SpinnerIcon className="h-8 w-8 text-[#254333]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
            <p className="font-cera-pro font-light text-[12px] text-[#666666] uppercase tracking-wide">Abandonados</p>
            <p className="font-cera-pro font-bold text-[28px] text-[#B3261E]">{stats.totalAbandonados}</p>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
            <p className="font-cera-pro font-light text-[12px] text-[#666666] uppercase tracking-wide">Convertidos</p>
            <p className="font-cera-pro font-bold text-[28px] text-[#254333]">{stats.totalConvertidos}</p>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
            <p className="font-cera-pro font-light text-[12px] text-[#666666] uppercase tracking-wide">Abandonos Hoje</p>
            <p className="font-cera-pro font-bold text-[28px] text-[#E8A800]">{stats.totalHoje}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex rounded-[8px] overflow-hidden border border-[#d2d2d2]">
            {(["abandonados", "convertidos", "todos"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFiltro(f); setPage(1); }}
                className={`px-4 py-2 font-cera-pro font-medium text-[13px] transition-colors ${
                  filtro === f
                    ? "bg-[#254333] text-white"
                    : "bg-white text-[#333333] hover:bg-[#f8f3ed]"
                }`}
              >
                {f === "abandonados" ? "Abandonados" : f === "convertidos" ? "Convertidos" : "Todos"}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Buscar por email, nome ou telefone..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 border border-[#d2d2d2] rounded-[8px] font-cera-pro text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#254333]"
          />

          <button
            onClick={() => fetchAbandonos(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:opacity-50 rounded-[8px] transition-colors whitespace-nowrap"
          >
            <RefreshIcon className={refreshing ? "animate-spin" : ""} />
            <span className="font-cera-pro font-medium text-[13px] text-[#254333]">
              {refreshing ? "..." : "Atualizar"}
            </span>
          </button>
        </div>
      </div>

      {/* Lista */}
      {abandonos.length === 0 ? (
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-8 text-center">
          <p className="font-cera-pro font-light text-[16px] text-[#666666]">
            Nenhum abandono encontrado
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] overflow-hidden">
          {/* Header da tabela - desktop */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_120px_100px_120px_100px] gap-4 px-6 py-3 bg-[#f8f3ed] border-b border-[#e5e5e5]">
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Contato</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Itens</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Valor</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Etapa</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Quando</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Device</span>
          </div>

          {abandonos.map((ab) => {
            const items = (ab.items as AbandonoItem[] | null) || [];
            const isExpanded = expandedId === ab.id;

            return (
              <div key={ab.id} className="border-b border-[#f0f0f0] last:border-b-0">
                {/* Row principal */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ab.id)}
                  className="w-full text-left px-4 lg:px-6 py-4 hover:bg-[#faf8f5] transition-colors"
                >
                  {/* Mobile layout */}
                  <div className="lg:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ab.convertido && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-cera-pro font-medium text-[11px]">
                            Convertido
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full font-cera-pro font-medium text-[11px] ${STEP_COLORS[ab.step] || "bg-gray-100 text-gray-800"}`}>
                          {STEP_LABELS[ab.step] || ab.step}
                        </span>
                      </div>
                      <span className="font-cera-pro font-light text-[12px] text-[#999999]">
                        {timeAgo(ab.updatedAt)}
                      </span>
                    </div>
                    <p className="font-cera-pro font-medium text-[14px] text-[#333333]">
                      {ab.nome || ab.email || "Visitante anônimo"}
                    </p>
                    {ab.valor != null && (
                      <p className="font-cera-pro font-bold text-[16px] text-[#254333]">
                        R$ {ab.valor.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_120px_100px_120px_100px] gap-4 items-center">
                    <div className="min-w-0">
                      <p className="font-cera-pro font-medium text-[14px] text-[#333333] truncate">
                        {ab.nome || "Visitante anônimo"}
                        {ab.convertido && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-cera-pro font-medium text-[11px]">
                            Convertido
                          </span>
                        )}
                      </p>
                      {ab.email && (
                        <p className="font-cera-pro font-light text-[12px] text-[#666666] truncate flex items-center gap-1">
                          <MailIcon /> {ab.email}
                        </p>
                      )}
                      {ab.telefone && (
                        <p className="font-cera-pro font-light text-[12px] text-[#666666] flex items-center gap-1">
                          <PhoneIcon /> {formatPhone(ab.telefone)}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-cera-pro font-light text-[13px] text-[#333333] truncate">
                        {items.length > 0
                          ? items.map((i) => `${i.item_name} (${i.quantity}x)`).join(", ")
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="font-cera-pro font-bold text-[14px] text-[#254333]">
                        {ab.valor != null ? `R$ ${ab.valor.toFixed(2)}` : "—"}
                      </p>
                    </div>

                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full font-cera-pro font-medium text-[11px] ${STEP_COLORS[ab.step] || "bg-gray-100 text-gray-800"}`}>
                        {STEP_LABELS[ab.step] || ab.step}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#999999]">
                      <ClockIcon />
                      <span className="font-cera-pro font-light text-[12px]">
                        {timeAgo(ab.updatedAt)}
                      </span>
                    </div>

                    <div>
                      <span className="font-cera-pro font-light text-[12px] text-[#666666] capitalize">
                        {ab.device || "—"}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="px-4 lg:px-6 pb-4 bg-[#faf8f5]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-3">
                      <div>
                        <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Session ID</p>
                        <p className="font-cera-pro font-light text-[12px] text-[#333333] break-all">{ab.sessionId}</p>
                      </div>
                      {ab.cpf && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">CPF</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333]">{ab.cpf}</p>
                        </div>
                      )}
                      {ab.cep && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">CEP</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333]">{ab.cep}</p>
                        </div>
                      )}
                      {(ab.cidade || ab.estado) && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Local</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                            {[ab.cidade, ab.estado].filter(Boolean).join(" - ")}
                          </p>
                        </div>
                      )}
                      {ab.cupons?.length > 0 && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Cupons</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333]">{ab.cupons.join(", ")}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Criado em</p>
                        <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                          {new Date(ab.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Atualizado</p>
                        <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                          {new Date(ab.updatedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {/* Itens detalhados */}
                    {items.length > 0 && (
                      <div className="mt-2">
                        <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-2">Itens do Carrinho</p>
                        <div className="space-y-1">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 px-3 bg-white rounded-[6px]">
                              <span className="font-cera-pro font-light text-[13px] text-[#333333]">
                                {item.item_name} <span className="text-[#999999]">x{item.quantity}</span>
                              </span>
                              <span className="font-cera-pro font-medium text-[13px] text-[#254333]">
                                R$ {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:bg-[#d2d2d2] disabled:cursor-not-allowed rounded-[8px] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[14px] text-[#254333]">Anterior</span>
            </button>
            <div className="px-4 py-2 bg-[#f8f3ed] rounded-[8px]">
              <span className="font-cera-pro font-bold text-[14px] text-black">
                {page} de {totalPages}
              </span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:bg-[#d2d2d2] disabled:cursor-not-allowed rounded-[8px] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[14px] text-[#254333]">Próxima</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
