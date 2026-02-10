"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface ProdutoQtd {
  nome: string;
  quantidade: number;
  faturamento: number;
}

interface QuantidadeProdutosProps {
  dados: ProdutoQtd[];
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function QuantidadeProdutos({ dados }: QuantidadeProdutosProps) {
  const chartData = dados.map((d) => ({
    ...d,
    nomeShort: truncate(d.nome, 25),
  }));

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5">
      <h3 className="font-cera-pro font-bold text-[16px] text-black mb-4">
        Top 5 Produtos por Quantidade
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
                formatter={(value?: number) => [`${value ?? 0} unid.`, "Quantidade"]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="quantidade"
                fill="#7B6F5E"
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
