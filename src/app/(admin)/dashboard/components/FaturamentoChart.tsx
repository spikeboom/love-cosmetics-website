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
  dataInicio: string;
  dataFim: string;
  dataInicioAnterior: string;
  dataFimAnterior: string;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDateBR(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

function getAllDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + "T12:00:00");
  const endDate = new Date(end + "T12:00:00");
  while (current <= endDate) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function FaturamentoChart({
  dadosAtual,
  dadosAnterior,
  dataInicio,
  dataFim,
  dataInicioAnterior,
  dataFimAnterior,
}: FaturamentoChartProps) {
  // Build all dates in the current range
  const allDates = getAllDatesInRange(dataInicio, dataFim);

  // Map data by date
  const atualByDate = new Map<string, number>();
  dadosAtual.forEach((d) => atualByDate.set(d.dia, d.valor));

  // Map previous period by day index (align by position, not by date)
  const allDatesAnterior = getAllDatesInRange(dataInicioAnterior, dataFimAnterior);
  const anteriorByIndex = new Map<number, number>();
  dadosAnterior.forEach((d) => {
    const idx = allDatesAnterior.indexOf(d.dia);
    if (idx >= 0) anteriorByIndex.set(idx, d.valor);
  });

  // Build chart data with cumulative values
  let acumAtual = 0;
  let acumAnterior = 0;
  const chartData = allDates.map((date, i) => {
    acumAtual += atualByDate.get(date) || 0;
    acumAnterior += anteriorByIndex.get(i) || 0;
    return {
      dia: formatDateBR(date),
      atual: Math.round(acumAtual * 100) / 100,
      anterior: Math.round(acumAnterior * 100) / 100,
    };
  });

  const labelAtual = `${formatDateBR(dataInicio)} - ${formatDateBR(dataFim)}`;
  const labelAnterior = `${formatDateBR(dataInicioAnterior)} - ${formatDateBR(dataFimAnterior)}`;

  // Show fewer tick labels when range is large
  const tickInterval = allDates.length > 60 ? 6 : allDates.length > 30 ? 3 : allDates.length > 14 ? 1 : 0;

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
              interval={tickInterval}
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
                name === "atual" ? labelAtual : labelAnterior,
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) =>
                value === "atual" ? labelAtual : labelAnterior
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
