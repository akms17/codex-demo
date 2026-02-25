'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PricePoint } from '@/lib/types';

type CompareSeries = {
  ticker: string;
  currency: string | null;
  points: PricePoint[];
};

type Props = {
  series: CompareSeries[];
  normalized: boolean;
};

const COLORS = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#0f766e'];

const buildChartData = (series: CompareSeries[], normalized: boolean) => {
  const byDate = new Map<string, Record<string, number | string>>();

  for (const item of series) {
    if (item.points.length === 0) {
      continue;
    }

    const firstClose = item.points[0].close;
    for (const point of item.points) {
      const existing = byDate.get(point.date) ?? { date: point.date };
      const value =
        normalized && firstClose !== 0 ? ((point.close - firstClose) / firstClose) * 100 : point.close;
      existing[item.ticker] = Number(value.toFixed(4));
      byDate.set(point.date, existing);
    }
  }

  return Array.from(byDate.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
};

const formatter = (value: number, normalized: boolean) => {
  if (normalized) {
    return `${value.toFixed(2)}%`;
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
};

export default function ComparePriceChart({ series, normalized }: Props) {
  const validSeries = series.filter((item) => item.points.length > 0);
  const data = buildChartData(validSeries, normalized);

  return (
    <div className="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Comparison Chart</h2>
      {validSeries.length === 0 ? (
        <p className="text-sm text-slate-500">No comparison data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="date" minTickGap={24} />
            <YAxis tickFormatter={(value: number) => formatter(value, normalized)} width={90} />
            <Tooltip formatter={(value: number) => formatter(value, normalized)} />
            <Legend />
            {validSeries.map((item, index) => (
              <Line
                key={item.ticker}
                type="monotone"
                dataKey={item.ticker}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
