"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SpinnerIcon } from "./Icons";

type WarningGrupo = "dados_bling" | "regras_calculo" | "atencao";

interface WarningDRE {
  codigo: string;
  grupo: WarningGrupo;
  titulo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
  quantidade?: number;
  valor?: number;
}

interface DespesaDetalhe {
  contaId: number;
  valor: number;
  historico?: string;
  categoriaId?: number;
  categoriaDescricao?: string;
  subgrupo: "marketing" | "operacional" | "administrativo" | "outros";
  motivoOutros?: "sem_categoria" | "categoria_fora_das_arvores";
}

interface DreCacheInfo {
  hit: boolean;
  updatedAt: string;
}

interface DreResultado {
  periodo: { mes: number; ano: number; inicio: string; fim: string };
  _cache?: DreCacheInfo;
  receitaBruta: number;
  cpv: number;
  margemBruta: number;
  despesasOperacionais: {
    marketing: number;
    operacional: number;
    administrativo: number;
    outros: number;
    total: number;
    detalhes: DespesaDetalhe[];
  };
  ebitda: number;
  resultadoExercicio: number;
  detalhes: {
    nfsAnalisadas: number;
    quantidadePorCodigo: Record<string, { quantidade: number; descricao: string }>;
    contasAnalisadas: number;
    contasSemCategoria: number;
    contasSemCategoriaValor: number;
    contasIgnoradasPorGrupo: number;
    contasIgnoradasValor: number;
  };
  warnings: WarningDRE[];
}

const GRUPO_LABEL: Record<WarningGrupo, string> = {
  dados_bling: "Dados a corrigir no Bling",
  regras_calculo: "Regras de cálculo",
  atencao: "Pontos de atenção",
};

const GRUPO_ICONE: Record<WarningGrupo, string> = {
  dados_bling: "🛠",
  regras_calculo: "ℹ️",
  atencao: "⚠",
};

const GRUPO_BG: Record<WarningGrupo, { bg: string; border: string; text: string; chipBg: string; chipHover: string; chipBorder: string }> = {
  dados_bling: {
    bg: "bg-[#fff9ec]", border: "border-[#f0c97a]", text: "text-[#8a5a00]",
    chipBg: "bg-[#fbe9b5]", chipHover: "hover:bg-[#f5d97e]", chipBorder: "border-[#f0c97a]",
  },
  regras_calculo: {
    bg: "bg-[#eef5fb]", border: "border-[#7db0dc]", text: "text-[#1c4a70]",
    chipBg: "bg-[#d6e6f3]", chipHover: "hover:bg-[#bdd4ea]", chipBorder: "border-[#7db0dc]",
  },
  atencao: {
    bg: "bg-[#fdecec]", border: "border-[#e89a9a]", text: "text-[#7a1f1f]",
    chipBg: "bg-[#f5caca]", chipHover: "hover:bg-[#edb0b0]", chipBorder: "border-[#e89a9a]",
  },
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const MES_NOMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function DREPanel() {
  const hoje = useMemo(() => new Date(), []);
  const [mes, setMes] = useState<number>(hoje.getMonth() + 1);
  const [ano, setAno] = useState<number>(hoje.getFullYear());
  const [data, setData] = useState<DreResultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<WarningDRE | null>(null);
  const [despesasModal, setDespesasModal] = useState<{
    titulo: string;
    filtro?: DespesaDetalhe["subgrupo"] | "todas";
  } | null>(null);

  const anosDisponiveis = useMemo(() => {
    const y = hoje.getFullYear();
    return [y - 2, y - 1, y];
  }, [hoje]);

  async function aplicar(opts?: { refresh?: boolean }) {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/dre?mes=${mes}&ano=${ano}${opts?.refresh ? "&refresh=1" : ""}`;
      const res = await fetch(url);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
      setData(body);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar DRE");
    } finally {
      setLoading(false);
    }
  }

  async function recalcular() {
    if (loading) return;
    const ok = window.confirm(
      `Recalcular DRE de ${MES_NOMES[mes - 1]}/${ano}? Isso invalida o cache e busca dados frescos no Bling (~5-30 segundos dependendo do nº de NFs).`
    );
    if (!ok) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/admin/dre?mes=${mes}&ano=${ano}`, { method: "DELETE" });
      await aplicar({ refresh: true });
    } catch (e: any) {
      setError(e?.message || "Erro ao recalcular");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Filtro */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-[#e6dfd5] flex items-center gap-3 flex-wrap">
        <label className="font-cera-pro text-sm text-[#254333] font-medium">Período:</label>
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="font-cera-pro text-sm px-3 py-2 rounded-lg border border-[#d5ccbd] bg-white text-[#254333] focus:outline-none focus:border-[#254333]"
        >
          {MES_NOMES.map((nome, i) => (
            <option key={i + 1} value={i + 1}>{nome}</option>
          ))}
        </select>
        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="font-cera-pro text-sm px-3 py-2 rounded-lg border border-[#d5ccbd] bg-white text-[#254333] focus:outline-none focus:border-[#254333]"
        >
          {anosDisponiveis.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={() => aplicar()}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-[#254333] text-white font-cera-pro text-sm font-medium hover:bg-[#1a3024] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Carregando..." : "Aplicar"}
        </button>
        {data && (
          <button
            onClick={recalcular}
            disabled={loading}
            title="Invalida o cache e busca dados frescos no Bling"
            className="px-3 py-2 rounded-lg bg-white border border-[#d5ccbd] text-[#254333] font-cera-pro text-sm font-medium hover:bg-[#f8f3ed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Recalcular
          </button>
        )}
        {data && (
          <div className="flex flex-col items-end ml-auto">
            <span className="font-cera-pro text-xs text-[#6b6458]">
              {data.periodo.inicio} → {data.periodo.fim} · {data.detalhes.nfsAnalisadas} NF(s) · {data.detalhes.contasAnalisadas} conta(s) a pagar
            </span>
            {data._cache && (
              <span className={`font-cera-pro text-[11px] mt-0.5 ${data._cache.hit ? "text-[#1b7a3a]" : "text-[#1c4a70]"}`}>
                {data._cache.hit ? "✓ Do cache" : "⟳ Fresco"}
                {" · atualizado em "}
                {new Date(data._cache.updatedAt).toLocaleString("pt-BR")}
              </span>
            )}
          </div>
        )}
      </div>

      {!data && !loading && !error && (
        <div className="bg-white rounded-xl p-10 shadow-sm border border-[#e6dfd5] text-center text-[#6b6458] font-cera-pro text-sm">
          Selecione o mês e o ano e clique em <b>Aplicar</b> para gerar o DRE.
        </div>
      )}

      {/* Warnings agrupados */}
      {data && data.warnings.length > 0 && (
        <div className="space-y-3 mb-4">
          {(["dados_bling", "regras_calculo", "atencao"] as WarningGrupo[]).map((grupo) => {
            const items = data.warnings.filter((w) => w.grupo === grupo);
            if (items.length === 0) return null;
            const style = GRUPO_BG[grupo];
            return (
              <div key={grupo} className={`rounded-xl p-4 shadow-sm border ${style.border} ${style.bg}`}>
                <div className={`font-cera-pro font-bold text-[14px] ${style.text} mb-2`}>
                  {GRUPO_ICONE[grupo]} {GRUPO_LABEL[grupo]} ({items.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((w, i) => (
                    <button
                      key={i}
                      onClick={() => setWarningModal(w)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.chipBg} ${style.chipHover} transition-colors ${style.text} font-cera-pro text-[12px] font-medium border ${style.chipBorder}`}
                    >
                      <span>{w.titulo}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <p className="font-cera-pro text-[11px] text-[#6b6458]">Clique em qualquer aviso para ver o que fazer.</p>
        </div>
      )}

      {/* Loading/Error */}
      {loading && (
        <div className="bg-white rounded-xl p-10 shadow-sm border border-[#e6dfd5] flex items-center justify-center gap-3 text-[#254333]">
          <SpinnerIcon />
          <span className="font-cera-pro text-sm">Calculando DRE — isso pode levar alguns segundos (1 request por NF no Bling)...</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 text-red-700 font-cera-pro text-sm">
          Erro: {error}
        </div>
      )}

      {/* Tabela DRE */}
      {data && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-[#e6dfd5] overflow-hidden">
          <table className="w-full font-cera-pro">
            <tbody>
              <RowPrincipal label="Receita Bruta" valor={data.receitaBruta} positivo />
              <RowDeducao label="(−) CPV (Custo dos Produtos Vendidos)" valor={data.cpv} />
              <RowTotal label="= Margem Bruta" valor={data.margemBruta} />

              <RowSubheader
                label="(−) Despesas Operacionais"
                total={data.despesasOperacionais.total}
                onClick={() => setDespesasModal({ titulo: "Todas as despesas operacionais", filtro: "todas" })}
              />
              <RowSubitem
                label="Marketing"
                valor={data.despesasOperacionais.marketing}
                onClick={() => setDespesasModal({ titulo: "Despesas — Marketing", filtro: "marketing" })}
              />
              <RowSubitem
                label="Operacional"
                valor={data.despesasOperacionais.operacional}
                onClick={() => setDespesasModal({ titulo: "Despesas — Operacional", filtro: "operacional" })}
              />
              <RowSubitem
                label="Administrativo"
                valor={data.despesasOperacionais.administrativo}
                onClick={() => setDespesasModal({ titulo: "Despesas — Administrativo", filtro: "administrativo" })}
              />
              <RowSubitem
                label="Outros"
                valor={data.despesasOperacionais.outros}
                onClick={() => setDespesasModal({ titulo: "Despesas — Outros", filtro: "outros" })}
              />

              <RowTotal label="= EBITDA" valor={data.ebitda} destaque />
              <RowTotal label="= Resultado do Exercício" valor={data.resultadoExercicio} destaque />
            </tbody>
          </table>
        </div>
      )}

      {/* Modal do warning (portal para escapar de ancestrais com transform/overflow) */}
      {warningModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setWarningModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-cera-pro font-bold text-[18px] text-[#254333]">
                ⚠️ {warningModal.titulo}
              </h3>
              <button
                onClick={() => setWarningModal(null)}
                className="text-[#6b6458] hover:text-[#254333] text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <p className="font-cera-pro text-[14px] text-[#3a3a3a] leading-relaxed mb-4 whitespace-pre-line">
              {warningModal.mensagem}
            </p>

            {warningModal.quantidade != null && (
              <div className="font-cera-pro text-[13px] text-[#6b6458] mb-2">
                <b>Quantidade:</b> {warningModal.quantidade}
              </div>
            )}
            {warningModal.valor != null && (
              <div className="font-cera-pro text-[13px] text-[#6b6458] mb-2">
                <b>Valor afetado:</b> {formatBRL(warningModal.valor)}
              </div>
            )}

            {warningModal.detalhes && Object.keys(warningModal.detalhes).length > 0 && (
              <details className="mt-3">
                <summary className="font-cera-pro text-[12px] text-[#254333] cursor-pointer font-medium">
                  Ver detalhes técnicos
                </summary>
                <pre className="mt-2 text-[11px] bg-[#f8f3ed] p-3 rounded-lg overflow-auto max-h-60">
                  {JSON.stringify(warningModal.detalhes, null, 2)}
                </pre>
              </details>
            )}

            <button
              onClick={() => setWarningModal(null)}
              className="mt-5 px-4 py-2 bg-[#254333] text-white rounded-lg font-cera-pro text-sm font-medium hover:bg-[#1a3024] transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de detalhes de despesas */}
      {despesasModal && data && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setDespesasModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-cera-pro font-bold text-[18px] text-[#254333]">
                {despesasModal.titulo}
              </h3>
              <button
                onClick={() => setDespesasModal(null)}
                className="text-[#6b6458] hover:text-[#254333] text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <DespesasTable
              detalhes={data.despesasOperacionais.detalhes}
              filtro={despesasModal.filtro}
            />

            <button
              onClick={() => setDespesasModal(null)}
              className="mt-5 px-4 py-2 bg-[#254333] text-white rounded-lg font-cera-pro text-sm font-medium hover:bg-[#1a3024] transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const SUBGRUPO_LABEL: Record<DespesaDetalhe["subgrupo"], string> = {
  marketing: "Marketing",
  operacional: "Operacional",
  administrativo: "Administrativo",
  outros: "Outros",
};

function DespesasTable({
  detalhes,
  filtro,
}: {
  detalhes: DespesaDetalhe[];
  filtro?: DespesaDetalhe["subgrupo"] | "todas";
}) {
  const filtrado = filtro && filtro !== "todas"
    ? detalhes.filter((d) => d.subgrupo === filtro)
    : detalhes;

  if (filtrado.length === 0) {
    return (
      <p className="font-cera-pro text-sm text-[#6b6458] py-4">
        Nenhuma despesa neste grupo no período selecionado.
      </p>
    );
  }

  const total = filtrado.reduce((s, d) => s + d.valor, 0);

  // Agrupa por categoria para visualização resumida
  const porCategoria = new Map<string, { descricao: string; contas: DespesaDetalhe[]; valor: number }>();
  for (const d of filtrado) {
    const key = d.categoriaDescricao || (d.motivoOutros === "sem_categoria" ? "(sem categoria no Bling)" : `categoria ${d.categoriaId ?? "?"}`);
    const existing = porCategoria.get(key) || { descricao: key, contas: [], valor: 0 };
    existing.contas.push(d);
    existing.valor += d.valor;
    porCategoria.set(key, existing);
  }

  const grupos = Array.from(porCategoria.values()).sort((a, b) => b.valor - a.valor);

  return (
    <div>
      <div className="font-cera-pro text-[13px] text-[#6b6458] mb-3">
        {filtrado.length} conta(s) · Total: <b className="text-[#254333]">{formatBRL(total)}</b>
      </div>
      <div className="border border-[#e6dfd5] rounded-lg overflow-hidden">
        <table className="w-full font-cera-pro">
          <thead className="bg-[#f8f3ed]">
            <tr>
              <th className="text-left p-2 pl-3 text-[12px] text-[#254333] font-bold">Categoria</th>
              <th className="text-center p-2 text-[12px] text-[#254333] font-bold">Qtd</th>
              <th className="text-right p-2 pr-3 text-[12px] text-[#254333] font-bold">Valor</th>
              {(!filtro || filtro === "todas") && (
                <th className="text-left p-2 text-[12px] text-[#254333] font-bold">Grupo</th>
              )}
            </tr>
          </thead>
          <tbody>
            {grupos.map((g, idx) => (
              <React.Fragment key={idx}>
                <tr className="border-t border-[#efe9de]">
                  <td className="p-2 pl-3 text-[13px] text-[#254333] font-medium">
                    {g.descricao}
                  </td>
                  <td className="p-2 text-center text-[12px] text-[#6b6458]">{g.contas.length}</td>
                  <td className="p-2 pr-3 text-right text-[13px] text-[#a04e1c] font-medium">
                    {formatBRL(g.valor)}
                  </td>
                  {(!filtro || filtro === "todas") && (
                    <td className="p-2 text-[11px] text-[#6b6458]">
                      {SUBGRUPO_LABEL[g.contas[0].subgrupo]}
                    </td>
                  )}
                </tr>
                {g.contas.map((c, i) => (
                  <tr key={i} className="border-t border-[#f4efe4] bg-[#fcfaf5]">
                    <td className="p-2 pl-8 text-[11px] text-[#6b6458]" colSpan={(!filtro || filtro === "todas") ? 1 : 1}>
                      <span className="opacity-60">#{c.contaId}</span>
                      {c.historico ? ` — ${c.historico.slice(0, 60)}${c.historico.length > 60 ? "…" : ""}` : ""}
                      {c.motivoOutros === "sem_categoria" && (
                        <span className="ml-1 text-[#a04e1c]">(sem categoria no Bling)</span>
                      )}
                      {c.motivoOutros === "categoria_fora_das_arvores" && (
                        <span className="ml-1 text-[#a04e1c]">(categoria sem subgrupo mapeado)</span>
                      )}
                    </td>
                    <td className="p-2 text-center text-[11px] text-[#6b6458]">—</td>
                    <td className="p-2 pr-3 text-right text-[12px] text-[#6b6458]">{formatBRL(c.valor)}</td>
                    {(!filtro || filtro === "todas") && <td className="p-2" />}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-cera-pro text-[11px] text-[#6b6458] mt-3">
        As contas estão agrupadas por categoria do Bling. Clique no número da conta (#id) no Bling para abrir o lançamento original.
      </p>
    </div>
  );
}

function RowPrincipal({ label, valor, positivo }: { label: string; valor: number; positivo?: boolean }) {
  return (
    <tr className="border-b border-[#e6dfd5]">
      <td className="p-4 text-[14px] text-[#254333] font-medium">{label}</td>
      <td className={`p-4 text-right text-[15px] font-bold ${positivo ? "text-[#1b7a3a]" : "text-[#254333]"}`}>
        {formatBRL(valor)}
      </td>
    </tr>
  );
}

function RowDeducao({ label, valor }: { label: string; valor: number }) {
  return (
    <tr className="border-b border-[#e6dfd5]">
      <td className="p-4 pl-8 text-[13px] text-[#6b6458]">{label}</td>
      <td className="p-4 text-right text-[14px] text-[#a04e1c]">{formatBRL(valor)}</td>
    </tr>
  );
}

function RowTotal({ label, valor, destaque }: { label: string; valor: number; destaque?: boolean }) {
  const color = valor >= 0 ? "text-[#1b7a3a]" : "text-[#a02020]";
  return (
    <tr className={`border-b border-[#e6dfd5] ${destaque ? "bg-[#f8f3ed]" : ""}`}>
      <td className={`p-4 text-[14px] font-bold text-[#254333] ${destaque ? "text-[15px]" : ""}`}>{label}</td>
      <td className={`p-4 text-right font-bold ${color} ${destaque ? "text-[17px]" : "text-[15px]"}`}>
        {formatBRL(valor)}
      </td>
    </tr>
  );
}

function RowSubheader({ label, total, onClick }: { label: string; total: number; onClick?: () => void }) {
  return (
    <tr
      className={`border-b border-[#e6dfd5] bg-[#faf6ef] ${onClick ? "cursor-pointer hover:bg-[#f2ebdd]" : ""}`}
      onClick={onClick}
    >
      <td className="p-3 pl-4 text-[13px] text-[#254333] font-medium">
        {label}
        {onClick && <span className="ml-2 text-[11px] text-[#254333] opacity-60">(clique para detalhar)</span>}
      </td>
      <td className="p-3 text-right text-[14px] text-[#a04e1c] font-medium">{formatBRL(total)}</td>
    </tr>
  );
}

function RowSubitem({ label, valor, onClick }: { label: string; valor: number; onClick?: () => void }) {
  return (
    <tr
      className={`border-b border-[#efe9de] ${onClick ? "cursor-pointer hover:bg-[#faf6ef]" : ""}`}
      onClick={onClick}
    >
      <td className="p-2 pl-10 text-[12px] text-[#6b6458]">{label}</td>
      <td className="p-2 text-right text-[13px] text-[#6b6458]">{formatBRL(valor)}</td>
    </tr>
  );
}
