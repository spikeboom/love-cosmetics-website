"use client";

import { useState, useEffect } from "react";

interface EstoqueItem {
  nome: string;
  bling_number: number;
  saldoFisico: number | null;
  saldoVirtual: number | null;
}

function getStatusLabel(saldo: number | null) {
  if (saldo === null) return { text: "S/ dados", color: "bg-[#f0f0f0] text-[#999999]" };
  if (saldo <= 0) return { text: "Esgotado", color: "bg-red-100 text-[#B3261E]" };
  if (saldo <= 5) return { text: "Critico", color: "bg-orange-100 text-orange-700" };
  if (saldo <= 15) return { text: "Baixo", color: "bg-yellow-100 text-yellow-700" };
  return { text: "OK", color: "bg-green-100 text-[#009142]" };
}

export function EstoqueTable() {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchEstoque = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dashboard/estoque");
      if (!res.ok) throw new Error("Erro ao buscar estoque");
      const data = await res.json();
      if (data.error && !data.estoque?.length) throw new Error(data.error);
      setEstoque(data.estoque || []);
      setLoaded(true);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-cera-pro font-bold text-[16px] text-black">
          Estoque Atual
        </h3>
        <button
          onClick={fetchEstoque}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:opacity-50 rounded-[6px] transition-colors"
        >
          {loading ? (
            <svg className="animate-spin w-3.5 h-3.5 text-[#254333]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-[#254333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          <span className="font-cera-pro font-medium text-[11px] text-[#254333]">
            {loading ? "Buscando..." : loaded ? "Atualizar" : "Carregar Bling"}
          </span>
        </button>
      </div>

      {!loaded && !loading && !error && (
        <div className="bg-[#f8f3ed] rounded-[8px] p-4 text-center">
          <p className="font-cera-pro font-light text-[12px] text-[#666666]">
            Clique em &quot;Carregar Bling&quot; para buscar os saldos de estoque
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
          <p className="font-cera-pro font-light text-[12px] text-[#B3261E]">
            {error}
          </p>
        </div>
      )}

      {loaded && estoque.length === 0 && !loading && (
        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-[8px] p-3">
          <p className="font-cera-pro font-light text-[12px] text-[#666666]">
            Nenhum produto com bling_number encontrado no Strapi.
          </p>
        </div>
      )}

      {loaded && estoque.length > 0 && (
        <div className="max-h-[280px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-[#e5e5e5]">
                <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 uppercase tracking-wide">
                  Produto
                </th>
                <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">
                  Fisico
                </th>
                <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">
                  Virtual
                </th>
                <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {estoque.map((item) => {
                const status = getStatusLabel(item.saldoFisico);
                return (
                  <tr key={item.bling_number} className="border-b border-[#f0f0f0]">
                    <td className="font-cera-pro font-light text-[12px] text-[#333333] py-2 pr-2 max-w-[180px] truncate" title={item.nome}>
                      {item.nome}
                    </td>
                    <td className="font-cera-pro font-medium text-[12px] text-[#333333] py-2 text-right tabular-nums">
                      {item.saldoFisico ?? "--"}
                    </td>
                    <td className="font-cera-pro font-light text-[12px] text-[#666666] py-2 text-right tabular-nums">
                      {item.saldoVirtual ?? "--"}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`font-cera-pro font-medium text-[10px] rounded px-2 py-0.5 ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
