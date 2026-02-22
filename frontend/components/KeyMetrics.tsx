import { MetricsResponse } from '@/lib/types';

type Props = {
  metrics: MetricsResponse;
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

export default function KeyMetrics({ metrics }: Props) {
  const cards = [
    { label: 'Company', value: metrics.name ?? 'N/A' },
    { label: 'Industry Type', value: metrics.industryType ?? 'N/A' },
    { label: 'Exchange', value: metrics.exchange ?? 'N/A' },
    {
      label: 'Current Price',
      value: formatValue(metrics.price, 'currency', metrics.currency),
    },
    {
      label: 'Market Cap',
      value: formatValue(metrics.marketCap, 'number'),
    },
    { label: 'Trailing P/E', value: formatValue(metrics.trailingPE) },
    { label: 'Forward P/E', value: formatValue(metrics.forwardPE) },
    {
      label: 'Dividend Yield',
      value: formatValue(metrics.dividendYield, 'percent'),
    },
    {
      label: '52W Low',
      value: formatValue(metrics.fiftyTwoWeekLow, 'currency', metrics.currency),
    },
    {
      label: '52W High',
      value: formatValue(metrics.fiftyTwoWeekHigh, 'currency', metrics.currency),
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Key Metrics</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
