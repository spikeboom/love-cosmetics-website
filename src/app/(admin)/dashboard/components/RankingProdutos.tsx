"use client";

interface ProdutoRanking {
  nome: string;
  faturamento: number;
  quantidade: number;
}

interface MargemProduto {
  nome: string;
  custoOperacional: number;
  precoVenda: number;
  margemBruta: number;
}

interface RankingProdutosProps {
  dados: ProdutoRanking[];
  margemProdutos?: MargemProduto[];
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getMargemColor(margem: number) {
  if (margem >= 50) return "text-[#009142]";
  if (margem >= 30) return "text-[#7B6F5E]";
  if (margem >= 15) return "text-orange-600";
  return "text-[#B3261E]";
}

function findMargem(nome: string, margemProdutos: MargemProduto[]): number | null {
  const match = margemProdutos.find((m) =>
    nome.toLowerCase().includes(m.nome.toLowerCase())
  );
  return match && match.precoVenda > 0 ? match.margemBruta : null;
}

export function RankingProdutos({ dados, margemProdutos = [] }: RankingProdutosProps) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5">
      <h3 className="font-cera-pro font-bold text-[16px] text-black mb-4">
        Ranking de Produtos
      </h3>

      {dados.length === 0 ? (
        <p className="font-cera-pro font-light text-[13px] text-[#666666] text-center py-8">
          Sem dados no periodo
        </p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-[#e5e5e5]">
                <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 uppercase tracking-wide">Produto</th>
                <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">Faturamento</th>
                <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">Margem</th>
                <th className="font-cera-pro font-medium text-[11px] text-[#666666] pb-2 text-right uppercase tracking-wide">Qtd</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item, i) => {
                const margem = findMargem(item.nome, margemProdutos);
                return (
                  <tr key={item.nome} className="border-b border-[#f0f0f0]">
                    <td className="font-cera-pro font-light text-[12px] text-[#333333] py-2 pr-2 max-w-[160px] truncate" title={item.nome}>
                      <span className="font-medium text-[#999999] mr-1.5">{i + 1}.</span>
                      {item.nome}
                    </td>
                    <td className="font-cera-pro font-medium text-[12px] text-[#333333] py-2 text-right tabular-nums">
                      {formatCurrency(item.faturamento)}
                    </td>
                    <td className={`font-cera-pro font-bold text-[12px] py-2 text-right tabular-nums ${margem !== null ? getMargemColor(margem) : "text-[#999999]"}`}>
                      {margem !== null ? `${margem.toFixed(1)}%` : "--"}
                    </td>
                    <td className="font-cera-pro font-light text-[12px] text-[#666666] py-2 text-right tabular-nums">
                      {item.quantidade}
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
