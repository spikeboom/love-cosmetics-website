"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshIcon, SpinnerIcon, MailIcon, PhoneIcon, ClockIcon, MapPinIcon, TrashIcon } from "./Icons";

interface ConsultaCep {
  id: string;
  cep: string;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  origem: string | null;
  sessionId: string | null;
  email: string | null;
  nome: string | null;
  telefone: string | null;
  cpf: string | null;
  clienteId: string | null;
  freteMinimo: number | null;
  prazoMinimo: number | null;
  transportadora: string | null;
  totalServicos: number | null;
  device: string | null;
  createdAt: string;
}

interface Stats {
  totalConsultas: number;
  consultasHoje: number;
  cepsUnicos: number;
  topEstados: Array<{ estado: string; total: number }>;
}

const ORIGEM_LABELS: Record<string, string> = {
  carrinho: "Carrinho",
  pdp: "Produto",
  identificacao: "Identificação",
  entrega: "Entrega",
};

const ORIGEM_COLORS: Record<string, string> = {
  carrinho: "bg-blue-100 text-blue-800",
  pdp: "bg-purple-100 text-purple-800",
  identificacao: "bg-yellow-100 text-yellow-800",
  entrega: "bg-green-100 text-green-800",
};

function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return cep;
}

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

export function ConsultasCepPanel() {
  const [consultas, setConsultas] = useState<ConsultaCep[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [incluirTestes, setIncluirTestes] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pageSize = 20;

  const fetchConsultas = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        busca,
        estado: estadoFiltro,
        incluirTestes: String(incluirTestes),
      });
      const res = await fetch(`/api/admin/consultas-cep?${params}`);
      if (!res.ok) throw new Error("Erro ao buscar consultas");
      const data = await res.json();
      setConsultas(data.consultas);
      setTotal(data.total);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [page, busca, estadoFiltro, incluirTestes]);

  useEffect(() => {
    fetchConsultas(false);
  }, [fetchConsultas]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remover esta consulta de CEP?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/consultas-cep?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
      setConsultas((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => prev - 1);
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao remover consulta");
    } finally {
      setDeletingId(null);
    }
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
            <p className="font-cera-pro font-light text-[12px] text-[#666666] uppercase tracking-wide">Total Consultas</p>
            <p className="font-cera-pro font-bold text-[28px] text-[#254333]">{stats.totalConsultas}</p>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
            <p className="font-cera-pro font-light text-[12px] text-[#666666] uppercase tracking-wide">Consultas Hoje</p>
            <p className="font-cera-pro font-bold text-[28px] text-[#E8A800]">{stats.consultasHoje}</p>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
            <p className="font-cera-pro font-light text-[12px] text-[#666666] uppercase tracking-wide">CEPs Únicos</p>
            <p className="font-cera-pro font-bold text-[28px] text-[#333333]">{stats.cepsUnicos}</p>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
            <p className="font-cera-pro font-light text-[12px] text-[#666666] uppercase tracking-wide">Top Estados</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {stats.topEstados.map((e) => (
                <span
                  key={e.estado}
                  className="px-2 py-0.5 bg-[#D8F9E7] rounded-full font-cera-pro font-medium text-[11px] text-[#254333] cursor-pointer hover:bg-[#c5f0d9]"
                  onClick={() => { setEstadoFiltro(e.estado); setPage(1); }}
                >
                  {e.estado} ({e.total})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por CEP, cidade, email ou nome..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 border border-[#d2d2d2] rounded-[8px] font-cera-pro text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#254333]"
          />

          {estadoFiltro && (
            <button
              onClick={() => { setEstadoFiltro(""); setPage(1); }}
              className="flex items-center gap-1 px-3 py-2 bg-[#254333] text-white rounded-[8px] font-cera-pro font-medium text-[13px]"
            >
              {estadoFiltro} &times;
            </button>
          )}

          <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={incluirTestes}
              onChange={(e) => { setIncluirTestes(e.target.checked); setPage(1); }}
              className="h-4 w-4 accent-[#254333] cursor-pointer"
            />
            <span className="font-cera-pro font-medium text-[13px] text-[#333333]">Ver testes</span>
          </label>

          <button
            onClick={() => fetchConsultas(true)}
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
      {consultas.length === 0 ? (
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-8 text-center">
          <p className="font-cera-pro font-light text-[16px] text-[#666666]">
            Nenhuma consulta de CEP encontrada
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] overflow-hidden">
          {/* Header da tabela - desktop */}
          <div className="hidden lg:grid lg:grid-cols-[100px_1fr_1fr_120px_100px_100px] gap-4 px-6 py-3 bg-[#f8f3ed] border-b border-[#e5e5e5]">
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">CEP</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Local</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Visitante</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Frete</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Origem</span>
            <span className="font-cera-pro font-bold text-[12px] text-[#666666] uppercase tracking-wide">Quando</span>
          </div>

          {consultas.map((c) => {
            const isExpanded = expandedId === c.id;

            return (
              <div key={c.id} className="border-b border-[#f0f0f0] last:border-b-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="w-full text-left px-4 lg:px-6 py-4 hover:bg-[#faf8f5] transition-colors"
                >
                  {/* Mobile layout */}
                  <div className="lg:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-cera-pro font-bold text-[16px] text-[#254333]">
                          {formatCep(c.cep)}
                        </span>
                        {c.origem && (
                          <span className={`px-2 py-0.5 rounded-full font-cera-pro font-medium text-[11px] ${ORIGEM_COLORS[c.origem] || "bg-gray-100 text-gray-800"}`}>
                            {ORIGEM_LABELS[c.origem] || c.origem}
                          </span>
                        )}
                      </div>
                      <span className="font-cera-pro font-light text-[12px] text-[#999999]">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    {(c.cidade || c.estado) && (
                      <p className="font-cera-pro font-light text-[13px] text-[#666666] flex items-center gap-1">
                        <MapPinIcon /> {[c.bairro, c.cidade, c.estado].filter(Boolean).join(" - ")}
                      </p>
                    )}
                    {c.nome && (
                      <p className="font-cera-pro font-medium text-[13px] text-[#333333]">{c.nome}</p>
                    )}
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden lg:grid lg:grid-cols-[100px_1fr_1fr_120px_100px_100px] gap-4 items-center">
                    <div>
                      <p className="font-cera-pro font-bold text-[14px] text-[#254333]">
                        {formatCep(c.cep)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="font-cera-pro font-light text-[13px] text-[#333333] truncate flex items-center gap-1">
                        <MapPinIcon />
                        {[c.bairro, c.cidade, c.estado].filter(Boolean).join(" - ") || "—"}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="font-cera-pro font-medium text-[13px] text-[#333333] truncate">
                        {c.nome || c.email || "Anônimo"}
                      </p>
                      {c.email && c.nome && (
                        <p className="font-cera-pro font-light text-[12px] text-[#666666] truncate flex items-center gap-1">
                          <MailIcon /> {c.email}
                        </p>
                      )}
                    </div>

                    <div>
                      {c.freteMinimo != null ? (
                        <div>
                          <p className="font-cera-pro font-medium text-[13px] text-[#254333]">
                            R$ {c.freteMinimo.toFixed(2)}
                          </p>
                          {c.prazoMinimo != null && (
                            <p className="font-cera-pro font-light text-[11px] text-[#999999]">
                              {c.prazoMinimo} {c.prazoMinimo === 1 ? "dia" : "dias"}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="font-cera-pro font-light text-[12px] text-[#999999]">—</span>
                      )}
                    </div>

                    <div>
                      {c.origem && (
                        <span className={`inline-block px-2 py-0.5 rounded-full font-cera-pro font-medium text-[11px] ${ORIGEM_COLORS[c.origem] || "bg-gray-100 text-gray-800"}`}>
                          {ORIGEM_LABELS[c.origem] || c.origem}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[#999999]">
                      <ClockIcon />
                      <span className="font-cera-pro font-light text-[12px]">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="px-4 lg:px-6 pb-4 bg-[#faf8f5]">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={(e) => handleDelete(c.id, e)}
                        disabled={deletingId === c.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-[6px] transition-colors font-cera-pro font-medium text-[12px]"
                      >
                        <TrashIcon />
                        {deletingId === c.id ? "Removendo..." : "Remover"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-3">
                      {c.sessionId && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Session ID</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333] break-all">{c.sessionId}</p>
                        </div>
                      )}
                      {c.email && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Email</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333] flex items-center gap-1">
                            <MailIcon /> {c.email}
                          </p>
                        </div>
                      )}
                      {c.telefone && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Telefone</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333] flex items-center gap-1">
                            <PhoneIcon /> {formatPhone(c.telefone)}
                          </p>
                        </div>
                      )}
                      {c.cpf && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">CPF</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333]">{c.cpf}</p>
                        </div>
                      )}
                      {c.transportadora && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Transportadora</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333]">{c.transportadora}</p>
                        </div>
                      )}
                      {c.totalServicos != null && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Opções de Frete</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#333333]">{c.totalServicos} disponíveis</p>
                        </div>
                      )}
                      {c.clienteId && (
                        <div>
                          <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Cliente Logado</p>
                          <p className="font-cera-pro font-light text-[12px] text-[#254333]">Sim</p>
                        </div>
                      )}
                      <div>
                        <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Device</p>
                        <p className="font-cera-pro font-light text-[12px] text-[#333333] capitalize">{c.device || "—"}</p>
                      </div>
                      <div>
                        <p className="font-cera-pro font-bold text-[11px] text-[#999999] uppercase tracking-wide mb-1">Data/Hora</p>
                        <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                          {new Date(c.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
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
