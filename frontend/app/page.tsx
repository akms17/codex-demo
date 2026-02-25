'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import CompareMetrics from '@/components/CompareMetrics';
import ComparePriceChart from '@/components/ComparePriceChart';
import KeyMetrics from '@/components/KeyMetrics';
import PriceChart from '@/components/PriceChart';
import { getMetrics, getPrices } from '@/lib/api';
import { MetricsResponse, PricesResponse, RANGE_OPTIONS, RangeOption } from '@/lib/types';

const DEFAULT_TICKER = 'AAPL';
const MAX_COMPARE_TICKERS = 5;

type CompareResult = {
  ticker: string;
  prices: PricesResponse | null;
  metrics: MetricsResponse | null;
  error: string | null;
};

const parseCompareTickers = (input: string): string[] => {
  const values = input
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  return Array.from(new Set(values)).slice(0, MAX_COMPARE_TICKERS);
};

export default function Home() {
  const [tickerInput, setTickerInput] = useState(DEFAULT_TICKER);
  const [ticker, setTicker] = useState(DEFAULT_TICKER);
  const [compareMode, setCompareMode] = useState(false);
  const [compareInput, setCompareInput] = useState('AAPL,MSFT');
  const [compareTickers, setCompareTickers] = useState<string[]>(['AAPL', 'MSFT']);
  const [normalize, setNormalize] = useState(false);
  const [range, setRange] = useState<RangeOption>('1y');

  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [compareResults, setCompareResults] = useState<CompareResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSingleTicker = async () => {
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
          setCompareResults([]);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unexpected error');
          setPrices(null);
          setMetrics(null);
          setCompareResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const loadCompareData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          compareTickers.map(async (item) => {
            try {
              const [pricesResult, metricsResult] = await Promise.all([
                getPrices(item, range),
                getMetrics(item),
              ]);
              return {
                ticker: item,
                prices: pricesResult,
                metrics: metricsResult,
                error: null,
              } satisfies CompareResult;
            } catch (err) {
              return {
                ticker: item,
                prices: null,
                metrics: null,
                error: err instanceof Error ? err.message : 'Unexpected error',
              } satisfies CompareResult;
            }
          }),
        );

        if (!controller.signal.aborted) {
          setCompareResults(results);
          setPrices(null);
          setMetrics(null);
          if (results.every((result) => result.error)) {
            setError('Could not load any of the selected tickers.');
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (compareMode) {
      void loadCompareData();
    } else {
      void loadSingleTicker();
    }

    return () => controller.abort();
  }, [ticker, range, compareMode, compareTickers]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (compareMode) {
      const nextTickers = parseCompareTickers(compareInput);
      if (nextTickers.length < 2) {
        setError('Enter at least two tickers for compare mode (comma-separated).');
        return;
      }
      setCompareTickers(nextTickers);
      return;
    }

    setTicker(tickerInput.toUpperCase());
  };

  const successfulCompareSeries = useMemo(
    () =>
      compareResults
        .filter((result) => result.prices)
        .map((result) => ({
          ticker: result.ticker,
          currency: result.prices?.currency ?? null,
          points: result.prices?.points ?? [],
        })),
    [compareResults],
  );

  const successfulCompareMetrics = useMemo(
    () =>
      compareResults
        .filter((result) => result.metrics)
        .map((result) => ({ ticker: result.ticker, metrics: result.metrics as MetricsResponse })),
    [compareResults],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Stock Dashboard</h1>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(event) => {
              setCompareMode(event.target.checked);
              setError(null);
            }}
          />
          Compare mode
        </label>

        {compareMode ? (
          <label className="flex flex-1 flex-col text-sm">
            <span className="mb-1 font-medium">Tickers (comma-separated, up to 5)</span>
            <input
              className="rounded border border-slate-300 px-3 py-2 uppercase"
              value={compareInput}
              onChange={(event) => setCompareInput(event.target.value)}
              placeholder="AAPL,MSFT,GOOGL"
              maxLength={60}
            />
          </label>
        ) : (
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
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
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

          {compareMode && (
            <label className="flex items-center gap-2 text-sm font-medium sm:pt-7">
              <input
                type="checkbox"
                checked={normalize}
                onChange={(event) => setNormalize(event.target.checked)}
              />
              Normalize to % change from start
            </label>
          )}

          <button
            type="submit"
            className="self-end rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Load
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {loading && <div className="rounded bg-slate-200 p-3 text-sm text-slate-700">Loading...</div>}

      {!loading && !compareMode && !error && prices && (
        <PriceChart points={prices.points} currency={prices.currency} />
      )}
      {!loading && !compareMode && !error && metrics && <KeyMetrics metrics={metrics} />}

      {!loading && compareMode && (
        <>
          <ComparePriceChart series={successfulCompareSeries} normalized={normalize} />
          <CompareMetrics items={successfulCompareMetrics} />

          {compareResults.some((result) => result.error) && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <h2 className="mb-2 font-semibold">Some tickers failed to load</h2>
              <ul className="list-disc space-y-1 pl-5">
                {compareResults
                  .filter((result) => result.error)
                  .map((result) => (
                    <li key={result.ticker}>
                      {result.ticker}: {result.error}
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
