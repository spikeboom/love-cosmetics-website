"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DiaValor {
  dia: string;
  valor: number;
}

interface FaturamentoChartProps {
  dadosAtual: DiaValor[];
  dadosAnterior: DiaValor[];
  mesAtual: number;
  anoAtual: number;
}

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const MESES = [
  "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export function FaturamentoChart({
  dadosAtual,
  dadosAnterior,
  mesAtual,
  anoAtual,
}: FaturamentoChartProps) {
  const totalDias = getDaysInMonth(mesAtual, anoAtual);

  // Map data by day number for alignment
  const atualByDay = new Map<number, number>();
  dadosAtual.forEach((d) => {
    const dayNum = new Date(d.dia + "T12:00:00").getDate();
    atualByDay.set(dayNum, d.valor);
  });

  const anteriorByDay = new Map<number, number>();
  dadosAnterior.forEach((d) => {
    const dayNum = new Date(d.dia + "T12:00:00").getDate();
    anteriorByDay.set(dayNum, d.valor);
  });

  // Build chart data with cumulative values
  let acumAtual = 0;
  let acumAnterior = 0;
  const chartData = [];

  for (let day = 1; day <= totalDias; day++) {
    acumAtual += atualByDay.get(day) || 0;
    acumAnterior += anteriorByDay.get(day) || 0;
    chartData.push({
      dia: day,
      atual: Math.round(acumAtual * 100) / 100,
      anterior: Math.round(acumAnterior * 100) / 100,
    });
  }

  const prevMonth = mesAtual === 1 ? 12 : mesAtual - 1;

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-5">
      <h3 className="font-cera-pro font-bold text-[16px] text-black mb-4">
        Evolucao do Faturamento
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11, fill: "#666666" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e5e5" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#666666" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "var(--font-cera-pro), sans-serif",
              }}
              formatter={(value?: number, name?: string) => [
                formatCurrency(value ?? 0),
                name === "atual"
                  ? `${MESES[mesAtual]}/${anoAtual}`
                  : `${MESES[prevMonth]}/${mesAtual === 1 ? anoAtual - 1 : anoAtual}`,
              ]}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) =>
                value === "atual"
                  ? `${MESES[mesAtual]}/${anoAtual}`
                  : `${MESES[prevMonth]}/${mesAtual === 1 ? anoAtual - 1 : anoAtual}`
              }
              wrapperStyle={{ fontSize: "12px", fontFamily: "var(--font-cera-pro), sans-serif" }}
            />
            <Line
              type="monotone"
              dataKey="atual"
              stroke="#254333"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#254333" }}
            />
            <Line
              type="monotone"
              dataKey="anterior"
              stroke="#999999"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 3, fill: "#999999" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
