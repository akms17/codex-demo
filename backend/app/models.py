from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

RangeOption = Literal["1m", "3m", "6m", "1y", "5y", "max"]


class PricePoint(BaseModel):
    date: str
    close: float


class PricesResponse(BaseModel):
    ticker: str
    range: RangeOption
    currency: str | None = None
    points: list[PricePoint]


class MetricsResponse(BaseModel):
    ticker: str
    name: str | None = None
    exchange: str | None = None
    currency: str | None = None
    price: float | None = None
    marketCap: float | None = None
    trailingPE: float | None = None
    forwardPE: float | None = None
    dividendYield: float | None = None
    fiftyTwoWeekLow: float | None = None
    fiftyTwoWeekHigh: float | None = None


class APIError(BaseModel):
    error: str
    details: str | None = None


TICKER_REGEX = r"^[A-Za-z0-9.-]{1,10}$"


class QueryParams(BaseModel):
    ticker: str = Field(pattern=TICKER_REGEX)

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, value: str) -> str:
        return value.upper()
