'use client';

import { FormEvent, useEffect, useState } from 'react';
import PriceChart from '@/components/PriceChart';
import KeyMetrics from '@/components/KeyMetrics';
import { getMetrics, getPrices } from '@/lib/api';
import { MetricsResponse, PricesResponse, RANGE_OPTIONS, RangeOption } from '@/lib/types';

const DEFAULT_TICKER = 'AAPL';

export default function Home() {
  const [tickerInput, setTickerInput] = useState(DEFAULT_TICKER);
  const [ticker, setTicker] = useState(DEFAULT_TICKER);
  const [range, setRange] = useState<RangeOption>('1y');
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const sanitizedTicker = ticker.trim().toUpperCase();
        const [pricesResult, metricsResult] = await Promise.all([
          getPrices(sanitizedTicker, range),
          getMetrics(sanitizedTicker),
        ]);
        if (!controller.signal.aborted) {
          setPrices(pricesResult);
          setMetrics(metricsResult);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unexpected error');
          setPrices(null);
          setMetrics(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => controller.abort();
  }, [ticker, range]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTicker(tickerInput.toUpperCase());
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Stock Dashboard</h1>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
      >
        <label className="flex flex-1 flex-col text-sm">
          <span className="mb-1 font-medium">Ticker</span>
          <input
            className="rounded border border-slate-300 px-3 py-2 uppercase"
            value={tickerInput}
            onChange={(event) => setTickerInput(event.target.value)}
            placeholder="AAPL"
            maxLength={10}
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Range</span>
          <select
            className="rounded border border-slate-300 px-3 py-2"
            value={range}
            onChange={(event) => setRange(event.target.value as RangeOption)}
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="self-end rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Load
        </button>
      </form>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading && <div className="rounded bg-slate-200 p-3 text-sm text-slate-700">Loading...</div>}

      {!loading && !error && prices && <PriceChart points={prices.points} currency={prices.currency} />}
      {!loading && !error && metrics && <KeyMetrics metrics={metrics} />}
    </main>
  );
}
