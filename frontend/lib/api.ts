import { MetricsResponse, PricesResponse, RangeOption } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type ApiError = {
  error?: string;
  details?: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    let payload: ApiError | null = null;
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      payload = null;
    }
    const message = payload?.error ?? `Request failed with ${response.status}`;
    const details = payload?.details ? `: ${payload.details}` : '';
    throw new Error(`${message}${details}`);
  }
  return (await response.json()) as T;
}

export async function getPrices(
  ticker: string,
  range: RangeOption,
): Promise<PricesResponse> {
  const query = new URLSearchParams({ ticker, range });
  return fetchJson<PricesResponse>(`/api/prices?${query.toString()}`);
}

export async function getMetrics(ticker: string): Promise<MetricsResponse> {
  const query = new URLSearchParams({ ticker });
  return fetchJson<MetricsResponse>(`/api/metrics?${query.toString()}`);
}
