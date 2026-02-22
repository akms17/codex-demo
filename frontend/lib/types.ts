export type PricePoint = {
  date: string;
  close: number;
};

export type PricesResponse = {
  ticker: string;
  range: string;
  currency: string | null;
  points: PricePoint[];
};

export type MetricsResponse = {
  ticker: string;
  name: string | null;
  industryType: string | null;
  exchange: string | null;
  currency: string | null;
  price: number | null;
  marketCap: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  dividendYield: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekHigh: number | null;
};

export const RANGE_OPTIONS = ['1m', '3m', '6m', '1y', '5y', 'max'] as const;
export type RangeOption = (typeof RANGE_OPTIONS)[number];
