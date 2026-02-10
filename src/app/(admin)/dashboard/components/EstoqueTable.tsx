"use client";

export function EstoqueTable() {
  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5">
      <h3 className="font-cera-pro font-bold text-[16px] text-black mb-4">
        Estoque Atual
      </h3>

      <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-[8px] p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-[#F9A825] flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="font-cera-pro font-medium text-[13px] text-[#333333]">
            Dados de estoque indisponiveis
          </p>
          <p className="font-cera-pro font-light text-[12px] text-[#666666] mt-1">
            O controle de estoque ainda nao esta integrado ao sistema. Para
            ativar este recurso, cadastre os dados de estoque dos produtos no
            Strapi CMS.
          </p>
        </div>
      </div>

      {/* Placeholder table */}
      <div className="mt-4 opacity-40 pointer-events-none">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#e5e5e5]">
              <th className="font-cera-pro font-medium text-[12px] text-[#666666] pb-2">
                Produto
              </th>
              <th className="font-cera-pro font-medium text-[12px] text-[#666666] pb-2 text-right">
                Estoque
              </th>
              <th className="font-cera-pro font-medium text-[12px] text-[#666666] pb-2 text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {["Produto A", "Produto B", "Produto C"].map((name, i) => (
              <tr key={name} className="border-b border-[#f0f0f0]">
                <td className="font-cera-pro font-light text-[13px] text-[#333333] py-2">
                  {name}
                </td>
                <td className="font-cera-pro font-light text-[13px] text-[#999999] py-2 text-right">
                  --
                </td>
                <td className="py-2 text-right">
                  <span className="font-cera-pro font-light text-[11px] text-[#999999] bg-[#f0f0f0] rounded px-2 py-0.5">
                    N/D
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
