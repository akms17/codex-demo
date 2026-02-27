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

type Props = {
  points: PricePoint[];
  currency: string | null;
};

type ChartPoint = PricePoint & {
  sma20: number | null;
};

const SMA_PERIOD = 20;

const moneyFormatter = (value: number, currency?: string | null): string => {
  if (!currency) {
    return value.toFixed(2);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

const withSimpleMovingAverage = (points: PricePoint[], period: number): ChartPoint[] => {
  return points.map((point, index) => {
    if (index + 1 < period) {
      return { ...point, sma20: null };
    }

    const window = points.slice(index + 1 - period, index + 1);
    const average = window.reduce((sum, item) => sum + item.close, 0) / period;

    return {
      ...point,
      sma20: Number(average.toFixed(4)),
    };
  });
};

export default function PriceChart({ points, currency }: Props) {
  const chartData = withSimpleMovingAverage(points, SMA_PERIOD);

  return (
    <div className="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Historical Close</h2>
      {points.length === 0 ? (
        <p className="text-sm text-slate-500">No data points available.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="date" minTickGap={24} />
            <YAxis tickFormatter={(value: number) => moneyFormatter(value, currency)} width={90} />
            <Tooltip
              formatter={(value: number) => moneyFormatter(value, currency)}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="close"
              name="Close"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sma20"
              name="SMA (20)"
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
