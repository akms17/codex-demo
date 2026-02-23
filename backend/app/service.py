from __future__ import annotations

from collections.abc import Mapping
from datetime import date
from typing import cast

import pandas as pd
import yfinance as yf

from .cache import TTLCache
from .models import MetricsResponse, PricePoint, PricesResponse, RangeOption

PERIOD_MAP: dict[RangeOption, str] = {
    "1m": "1mo",
    "3m": "3mo",
    "6m": "6mo",
    "1y": "1y",
    "5y": "5y",
    "max": "max",
}


class ServiceError(Exception):
    def __init__(self, message: str, details: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details


class StockService:
    def __init__(self, cache_ttl_seconds: int = 60) -> None:
        self.cache = TTLCache(ttl_seconds=cache_ttl_seconds)

    def _ticker(self, symbol: str) -> yf.Ticker:
        return yf.Ticker(symbol)

    def get_prices(self, ticker: str, range_option: RangeOption) -> PricesResponse:
        cache_key = f"prices:{ticker}:{range_option}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cast(PricesResponse, cached)

        period = PERIOD_MAP[range_option]
        try:
            ticker_obj = self._ticker(ticker)
            history = ticker_obj.history(period=period, interval="1d", auto_adjust=False)
        except Exception as exc:  # noqa: BLE001
            raise ServiceError("Failed to fetch historical prices", str(exc)) from exc

        if history.empty or "Close" not in history:
            raise ServiceError("Ticker not found or no historical data available", ticker)

        points: list[PricePoint] = []
        close_series = history["Close"].dropna()

        for timestamp, close in close_series.items():
            if isinstance(timestamp, pd.Timestamp):
                point_date: date = timestamp.date()
            else:
                point_date = pd.to_datetime(timestamp).date()
            points.append(PricePoint(date=point_date.isoformat(), close=float(close)))

        currency = self._safe_info_value(ticker_obj.info, "currency")

        response = PricesResponse(
            ticker=ticker,
            range=range_option,
            currency=currency,
            points=points,
        )
        self.cache.set(cache_key, response)
        return response

    def get_metrics(self, ticker: str) -> MetricsResponse:
        cache_key = f"metrics:{ticker}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cast(MetricsResponse, cached)

        try:
            ticker_obj = self._ticker(ticker)
            info = ticker_obj.info
            # yfinance>=1.0 continues to expose .info, but this can be sparse/rate-limited.
            # Fall back to fast_info fields when available.
            fast_info = cast(Mapping[str, object], getattr(ticker_obj, "fast_info", {}) or {})
        except Exception as exc:  # noqa: BLE001
            raise ServiceError("Failed to fetch stock metrics", str(exc)) from exc

        if not info and not fast_info:
            raise ServiceError("Ticker not found or metrics unavailable", ticker)

        response = MetricsResponse(
            ticker=ticker,
            name=self._safe_info_value(info, "longName"),
            industryType=self._safe_info_value(info, "sector")
            or self._safe_info_value(info, "industry"),
            exchange=self._safe_info_value(info, "exchange"),
            currency=self._safe_info_value(info, "currency")
            or self._safe_info_value(fast_info, "currency"),
            price=self._safe_float(info.get("currentPrice"))
            or self._safe_float(fast_info.get("lastPrice"))
            or self._safe_float(fast_info.get("last_price")),
            marketCap=self._safe_float(info.get("marketCap"))
            or self._safe_float(fast_info.get("marketCap"))
            or self._safe_float(fast_info.get("market_cap")),
            trailingPE=self._safe_float(info.get("trailingPE")),
            forwardPE=self._safe_float(info.get("forwardPE")),
            dividendYield=self._safe_float(info.get("dividendYield")),
            fiftyTwoWeekLow=self._safe_float(info.get("fiftyTwoWeekLow"))
            or self._safe_float(fast_info.get("yearLow"))
            or self._safe_float(fast_info.get("year_low")),
            fiftyTwoWeekHigh=self._safe_float(info.get("fiftyTwoWeekHigh"))
            or self._safe_float(fast_info.get("yearHigh"))
            or self._safe_float(fast_info.get("year_high")),
        )
        self.cache.set(cache_key, response)
        return response

    @staticmethod
    def _safe_info_value(info: Mapping[str, object], key: str) -> str | None:
        value = info.get(key)
        if value is None:
            return None
        return str(value)

    @staticmethod
    def _safe_float(value: object) -> float | None:
        if not isinstance(value, int | float | str):
            return None
        try:
            return float(value)
        except ValueError:
            return None
