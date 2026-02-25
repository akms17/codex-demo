import { MetricsResponse } from '@/lib/types';

type CompareMetricItem = {
  ticker: string;
  metrics: MetricsResponse;
};

type Props = {
  items: CompareMetricItem[];
};

const formatValue = (
  value: number | null,
  type: 'currency' | 'number' | 'percent' = 'number',
  currency?: string | null,
): string => {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  if (type === 'currency') {
    if (!currency) {
      return value.toFixed(2);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (type === 'percent') {
    return `${(value * 100).toFixed(2)}%`;
  }

  return new Intl.NumberFormat('en-US', {
    notation: Math.abs(value) >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(value);
};

const metricRows = [
  { label: 'Company', get: (m: MetricsResponse) => m.name ?? 'N/A' },
  { label: 'Industry', get: (m: MetricsResponse) => m.industryType ?? 'N/A' },
  { label: 'Exchange', get: (m: MetricsResponse) => m.exchange ?? 'N/A' },
  {
    label: 'Current Price',
    get: (m: MetricsResponse) => formatValue(m.price, 'currency', m.currency),
  },
  { label: 'Market Cap', get: (m: MetricsResponse) => formatValue(m.marketCap, 'number') },
  { label: 'Trailing P/E', get: (m: MetricsResponse) => formatValue(m.trailingPE) },
  { label: 'Forward P/E', get: (m: MetricsResponse) => formatValue(m.forwardPE) },
  {
    label: 'Dividend Yield',
    get: (m: MetricsResponse) => formatValue(m.dividendYield, 'percent'),
  },
];

export default function CompareMetrics({ items }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Compare Metrics</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-3 py-2 text-left text-slate-500">Metric</th>
              {items.map((item) => (
                <th key={item.ticker} className="border-b border-slate-200 px-3 py-2 text-left">
                  {item.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricRows.map((row) => (
              <tr key={row.label}>
                <td className="border-b border-slate-100 px-3 py-2 font-medium">{row.label}</td>
                {items.map((item) => (
                  <td key={`${row.label}-${item.ticker}`} className="border-b border-slate-100 px-3 py-2">
                    {row.get(item.metrics)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
