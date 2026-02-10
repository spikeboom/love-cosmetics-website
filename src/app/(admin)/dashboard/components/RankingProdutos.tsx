"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface ProdutoRanking {
  nome: string;
  faturamento: number;
  quantidade: number;
}

interface RankingProdutosProps {
  dados: ProdutoRanking[];
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function RankingProdutos({ dados }: RankingProdutosProps) {
  const chartData = dados.map((d) => ({
    ...d,
    nomeShort: truncate(d.nome, 25),
  }));

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5">
      <h3 className="font-cera-pro font-bold text-[16px] text-black mb-4">
        Top 5 Produtos por Faturamento
      </h3>

      {dados.length === 0 ? (
        <p className="font-cera-pro font-light text-[13px] text-[#666666] text-center py-8">
          Sem dados no periodo
        </p>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 120 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#666666" }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="nomeShort"
                tick={{ fontSize: 11, fill: "#333333" }}
                tickLine={false}
                axisLine={false}
                width={115}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                formatter={(value?: number) => [formatCurrency(value ?? 0), "Faturamento"]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="faturamento"
                fill="#254333"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
