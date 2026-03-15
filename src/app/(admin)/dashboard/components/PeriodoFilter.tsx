"use client";

interface PeriodoFilterProps {
  dataInicio: string;
  dataFim: string;
  origem: string;
  statusPagamento: string;
  filterMode: "hideTests" | "showOnlyTests";
  onDataInicioChange: (v: string) => void;
  onDataFimChange: (v: string) => void;
  onOrigemChange: (origem: string) => void;
  onStatusChange: (status: string) => void;
  onFilterModeChange: (mode: "hideTests" | "showOnlyTests") => void;
  onApply: () => void;
  loading: boolean;
}

export function PeriodoFilter({
  dataInicio,
  dataFim,
  origem,
  statusPagamento,
  filterMode,
  onDataInicioChange,
  onDataFimChange,
  onOrigemChange,
  onStatusChange,
  onFilterModeChange,
  onApply,
  loading,
}: PeriodoFilterProps) {
  const inputClasses =
    "px-3 py-2 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-medium text-[13px] text-[#333333] outline-none focus:border-[#254333] transition-colors";

  const selectClasses =
    "px-3 py-2 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-medium text-[13px] text-[#333333] outline-none focus:border-[#254333] transition-colors cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="font-cera-pro font-medium text-[12px] text-[#666666] uppercase tracking-wide">
          De
        </label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => onDataInicioChange(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="font-cera-pro font-medium text-[12px] text-[#666666] uppercase tracking-wide">
          Até
        </label>
        <input
          type="date"
          value={dataFim}
          onChange={(e) => onDataFimChange(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="w-px h-6 bg-[#d2d2d2] hidden lg:block" />

      <div className="flex items-center gap-2">
        <label className="font-cera-pro font-medium text-[12px] text-[#666666] uppercase tracking-wide">
          Origem
        </label>
        <select
          value={origem}
          onChange={(e) => onOrigemChange(e.target.value)}
          className={selectClasses}
        >
          <option value="todos">Todos</option>
          <option value="checkout">E-commerce</option>
          <option value="admin">Backoffice</option>
        </select>
      </div>

      <div className="w-px h-6 bg-[#d2d2d2] hidden lg:block" />

      <div className="flex items-center gap-2">
        <label className="font-cera-pro font-medium text-[12px] text-[#666666] uppercase tracking-wide">
          Status
        </label>
        <select
          value={statusPagamento}
          onChange={(e) => onStatusChange(e.target.value)}
          className={selectClasses}
        >
          <option value="todos">Todos</option>
          <option value="PAID">Pagos</option>
          <option value="AUTHORIZED">Autorizados</option>
        </select>
      </div>

      <div className="w-px h-6 bg-[#d2d2d2] hidden lg:block" />

      {/* Filtro testes — igual /pedidos */}
      <div className="flex rounded-[8px] overflow-hidden border border-[#d2d2d2]">
        <button
          onClick={() => onFilterModeChange("hideTests")}
          className={`px-3 py-2 font-cera-pro font-medium text-[13px] transition-colors ${
            filterMode === "hideTests"
              ? "bg-[#254333] text-white"
              : "bg-white text-[#333333] hover:bg-[#f8f3ed]"
          }`}
        >
          Ocultar Testes
        </button>
        <button
          onClick={() => onFilterModeChange("showOnlyTests")}
          className={`px-3 py-2 font-cera-pro font-medium text-[13px] transition-colors ${
            filterMode === "showOnlyTests"
              ? "bg-[#254333] text-white"
              : "bg-white text-[#333333] hover:bg-[#f8f3ed]"
          }`}
        >
          Apenas Testes
        </button>
      </div>

      <div className="w-px h-6 bg-[#d2d2d2] hidden lg:block" />

      {/* Botao Aplicar */}
      <button
        onClick={onApply}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2 bg-[#254333] hover:bg-[#1a3226] disabled:opacity-50 rounded-[8px] transition-colors"
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        <span className="font-cera-pro font-medium text-[13px] text-white">
          {loading ? "Carregando..." : "Aplicar"}
        </span>
      </button>
    </div>
  );
}
