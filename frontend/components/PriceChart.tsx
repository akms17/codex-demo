'use client';

import {
  CartesianGrid,
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

export default function PriceChart({ points, currency }: Props) {
  return (
    <div className="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Historical Close</h2>
      {points.length === 0 ? (
        <p className="text-sm text-slate-500">No data points available.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="date" minTickGap={24} />
            <YAxis tickFormatter={(value: number) => moneyFormatter(value, currency)} width={90} />
            <Tooltip
              formatter={(value: number) => moneyFormatter(value, currency)}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Line type="monotone" dataKey="close" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
