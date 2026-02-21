from __future__ import annotations

import pandas as pd
from fastapi.testclient import TestClient
from pytest import MonkeyPatch

from app.main import app


class FakeTicker:
    def __init__(self, symbol: str) -> None:
        self.symbol = symbol
        self.info = {
            'currency': 'USD',
            'longName': 'Apple Inc.',
            'exchange': 'NMS',
            'currentPrice': 189.5,
            'marketCap': 1_000_000,
            'trailingPE': 22.1,
            'forwardPE': 20.0,
            'dividendYield': 0.004,
            'fiftyTwoWeekLow': 150.0,
            'fiftyTwoWeekHigh': 200.0,
        }

    def history(self, period: str, interval: str, auto_adjust: bool) -> pd.DataFrame:
        del period, interval, auto_adjust
        index = pd.to_datetime(['2026-01-01', '2026-01-02'])
        return pd.DataFrame({'Close': [180.1, 181.2]}, index=index)


def test_invalid_ticker_returns_400() -> None:
    client = TestClient(app)
    response = client.get('/api/prices', params={'ticker': '$$$', 'range': '1y'})

    assert response.status_code == 400
    payload = response.json()
    assert payload['error'] == 'Invalid ticker'


def test_prices_response_shape(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr('app.service.yf.Ticker', FakeTicker)
    client = TestClient(app)

    response = client.get('/api/prices', params={'ticker': 'AAPL', 'range': '1y'})

    assert response.status_code == 200
    payload = response.json()
    assert payload['ticker'] == 'AAPL'
    assert payload['range'] == '1y'
    assert payload['currency'] == 'USD'
    assert len(payload['points']) == 2
    assert payload['points'][0] == {'date': '2026-01-01', 'close': 180.1}


def test_metrics_response_shape(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr('app.service.yf.Ticker', FakeTicker)
    client = TestClient(app)

    response = client.get('/api/metrics', params={'ticker': 'AAPL'})

    assert response.status_code == 200
    payload = response.json()
    assert payload['ticker'] == 'AAPL'
    assert payload['name'] == 'Apple Inc.'
    assert payload['marketCap'] == 1_000_000
    assert payload['dividendYield'] == 0.004
