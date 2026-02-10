"use client";

interface KpiCardProps {
  titulo: string;
  valor: string;
  variacao?: number;
  icone: React.ReactNode;
  aviso?: string;
}

export function KpiCard({ titulo, valor, variacao, icone, aviso }: KpiCardProps) {
  const varPositiva = variacao !== undefined && variacao >= 0;
  const varFormatada = variacao !== undefined ? `${variacao >= 0 ? "+" : ""}${variacao.toFixed(1)}%` : null;

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-cera-pro font-medium text-[13px] text-[#666666] uppercase tracking-wide">
          {titulo}
        </span>
        <div className="w-8 h-8 bg-[#D8F9E7] rounded-full flex items-center justify-center text-[#254333]">
          {icone}
        </div>
      </div>

      {aviso ? (
        <div className="flex flex-col gap-1">
          <span className="font-cera-pro font-bold text-[22px] text-[#999999]">
            --
          </span>
          <span className="font-cera-pro font-light text-[11px] text-[#B3261E] bg-red-50 rounded px-2 py-1">
            {aviso}
          </span>
        </div>
      ) : (
        <div className="flex items-end gap-3">
          <span className="font-cera-pro font-bold text-[26px] text-black leading-none">
            {valor}
          </span>
          {varFormatada && (
            <span
              className={`font-cera-pro font-medium text-[13px] leading-none pb-0.5 ${
                varPositiva ? "text-[#009142]" : "text-[#B3261E]"
              }`}
            >
              {varFormatada}
            </span>
          )}
        </div>
      )}

      {!aviso && (
        <span className="font-cera-pro font-light text-[11px] text-[#999999]">
          vs. mês anterior
        </span>
      )}
    </div>
  );
}
