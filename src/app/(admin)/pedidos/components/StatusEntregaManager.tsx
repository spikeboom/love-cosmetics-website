"use client";

import React, { useState } from "react";

// Status de entrega disponíveis
export const STATUS_ENTREGA = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
  PAGAMENTO_CONFIRMADO: "Pagamento Confirmado",
  EM_SEPARACAO: "Em Separação",
  EMBALADO: "Embalado",
  ENVIADO: "Enviado",
  EM_TRANSITO: "Em Trânsito",
  SAIU_PARA_ENTREGA: "Saiu para Entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
  DEVOLVIDO: "Devolvido",
} as const;

export type StatusEntregaKey = keyof typeof STATUS_ENTREGA;

// Usuários permitidos
export const USUARIOS_PERMITIDOS = [
  "Adriano",
  "Cassy",
  "Paulo",
  "Gerilza",
  "Isabelle",
] as const;

// Cores para cada status
export const STATUS_COLORS: Record<StatusEntregaKey, { bg: string; text: string; border: string }> = {
  AGUARDANDO_PAGAMENTO: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-300" },
  PAGAMENTO_CONFIRMADO: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-300" },
  EM_SEPARACAO: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" },
  EMBALADO: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-300" },
  ENVIADO: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-300" },
  EM_TRANSITO: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-300" },
  SAIU_PARA_ENTREGA: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-300" },
  ENTREGUE: { bg: "bg-green-50", text: "text-green-600", border: "border-green-300" },
  CANCELADO: { bg: "bg-red-50", text: "text-red-600", border: "border-red-300" },
  DEVOLVIDO: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300" },
};

interface HistoricoItem {
  id: string;
  statusAnterior: string | null;
  statusNovo: string;
  alteradoPor: string;
  observacao: string | null;
  createdAt: string;
}

interface StatusEntregaBadgeProps {
  status: string;
  compact?: boolean;
}

export function StatusEntregaBadge({ status, compact = false }: StatusEntregaBadgeProps) {
  const statusKey = status as StatusEntregaKey;
  const colors = STATUS_COLORS[statusKey] || STATUS_COLORS.AGUARDANDO_PAGAMENTO;
  const label = STATUS_ENTREGA[statusKey] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-cera-pro font-medium ${colors.bg} ${colors.text} ${colors.border} ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]"
      }`}
    >
      {label}
    </span>
  );
}

interface StatusEntregaManagerProps {
  pedidoId: string;
  statusAtual: string;
  onStatusChange: (novoStatus: string) => void;
}

export function StatusEntregaManager({ pedidoId, statusAtual, onStatusChange }: StatusEntregaManagerProps) {
  const [novoStatus, setNovoStatus] = useState(statusAtual);
  const [usuario, setUsuario] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!usuario) {
      setError("Selecione quem está alterando");
      return;
    }

    if (novoStatus === statusAtual) {
      setError("Selecione um status diferente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/pedidos/${pedidoId}/status-entrega`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusNovo: novoStatus,
          alteradoPor: usuario,
          observacao: observacao || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onStatusChange(novoStatus);
        setObservacao("");
      } else {
        setError(data.error || "Erro ao atualizar status");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Status */}
        <div>
          <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
            Novo Status
          </label>
          <select
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value)}
            className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
          >
            {Object.entries(STATUS_ENTREGA).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Usuário */}
        <div>
          <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
            Alterado por *
          </label>
          <select
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
          >
            <option value="">Selecione...</option>
            {USUARIOS_PERMITIDOS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Observação */}
      <div>
        <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
          Observação (opcional)
        </label>
        <input
          type="text"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex: Código de rastreio: AB123456789BR"
          className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
        />
      </div>

      {/* Erro */}
      {error && (
        <p className="font-cera-pro font-light text-[12px] text-[#B3261E]">{error}</p>
      )}

      {/* Botão */}
      <button
        onClick={handleSubmit}
        disabled={loading || novoStatus === statusAtual}
        className={`w-full py-2 rounded-[8px] font-cera-pro font-medium text-[14px] transition-colors ${
          loading || novoStatus === statusAtual
            ? "bg-[#d2d2d2] text-[#666] cursor-not-allowed"
            : "bg-[#254333] hover:bg-[#1a3226] text-white"
        }`}
      >
        {loading ? "Salvando..." : "Atualizar Status"}
      </button>
    </div>
  );
}

interface HistoricoStatusEntregaProps {
  pedidoId: string;
  refreshKey?: number;
}

export function HistoricoStatusEntrega({ pedidoId, refreshKey = 0 }: HistoricoStatusEntregaProps) {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchHistorico() {
      setLoading(true);
      try {
        const response = await fetch(`/api/pedidos/${pedidoId}/status-entrega`);
        const data = await response.json();
        if (data.success) {
          setHistorico(data.historico);
        }
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistorico();
  }, [pedidoId, refreshKey]);

  if (loading) {
    return (
      <p className="font-cera-pro font-light text-[14px] text-[#666]">
        Carregando histórico...
      </p>
    );
  }

  if (historico.length === 0) {
    return (
      <p className="font-cera-pro font-light text-[14px] text-[#666]">
        Nenhuma alteração de status registrada
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {historico.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-[8px] p-3 border border-[#d2d2d2]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {item.statusAnterior && (
                <>
                  <StatusEntregaBadge status={item.statusAnterior} compact />
                  <span className="text-[#666]">→</span>
                </>
              )}
              <StatusEntregaBadge status={item.statusNovo} compact />
            </div>
            <span className="font-cera-pro font-light text-[11px] text-[#666]">
              {new Date(item.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>
          <p className="font-cera-pro font-medium text-[12px] text-[#333]">
            Por: {item.alteradoPor}
          </p>
          {item.observacao && (
            <p className="font-cera-pro font-light text-[12px] text-[#666] mt-1">
              {item.observacao}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
