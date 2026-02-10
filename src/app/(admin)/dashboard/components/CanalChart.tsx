"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface CanalData {
  origem: string;
  valor: number;
  pedidos: number;
}

interface CanalChartProps {
  dados: CanalData[];
}

const COLORS: Record<string, string> = {
  checkout: "#254333",
  admin: "#7B6F5E",
};

const LABELS: Record<string, string> = {
  checkout: "E-commerce",
  admin: "Backoffice",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function CanalChart({ dados }: CanalChartProps) {
  const total = dados.reduce((sum, d) => sum + d.valor, 0);

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5 flex flex-col">
      <h3 className="font-cera-pro font-bold text-[16px] text-black mb-4">
        Faturamento por Canal
      </h3>

      <div className="flex-1 flex items-center gap-4">
        <div className="w-[160px] h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dados}
                dataKey="valor"
                nameKey="origem"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={2}
                strokeWidth={0}
              >
                {dados.map((entry) => (
                  <Cell
                    key={entry.origem}
                    fill={COLORS[entry.origem] || "#ccc"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  LABELS[name] || name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3">
          {dados.map((d) => {
            const pct = total > 0 ? ((d.valor / total) * 100).toFixed(0) : "0";
            return (
              <div key={d.origem} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[d.origem] || "#ccc" }}
                />
                <div>
                  <p className="font-cera-pro font-medium text-[13px] text-black">
                    {LABELS[d.origem] || d.origem} ({pct}%)
                  </p>
                  <p className="font-cera-pro font-light text-[11px] text-[#666666]">
                    {formatCurrency(d.valor)} &middot; {d.pedidos} pedidos
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
