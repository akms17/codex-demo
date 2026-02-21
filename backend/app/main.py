from __future__ import annotations

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .models import APIError, MetricsResponse, PricesResponse, QueryParams, RangeOption
from .service import ServiceError, StockService

app = FastAPI(title='Stock Dashboard API')
service = StockService(cache_ttl_seconds=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/api/prices', response_model=PricesResponse, responses={400: {'model': APIError}, 502: {'model': APIError}})
def prices(ticker: str = Query(...), range: RangeOption = Query(...)) -> PricesResponse | JSONResponse:
    try:
        params = QueryParams(ticker=ticker)
    except ValidationError as exc:
        return JSONResponse(
            status_code=400,
            content={'error': 'Invalid ticker', 'details': str(exc.errors()[0]['msg'])},
        )

    try:
        return service.get_prices(params.ticker, range)
    except ServiceError as exc:
        status_code = 400 if 'not found' in exc.message.lower() else 502
        return JSONResponse(
            status_code=status_code,
            content={'error': exc.message, 'details': exc.details},
        )


@app.get('/api/metrics', response_model=MetricsResponse, responses={400: {'model': APIError}, 502: {'model': APIError}})
def metrics(ticker: str = Query(...)) -> MetricsResponse | JSONResponse:
    try:
        params = QueryParams(ticker=ticker)
    except ValidationError as exc:
        return JSONResponse(
            status_code=400,
            content={'error': 'Invalid ticker', 'details': str(exc.errors()[0]['msg'])},
        )

    try:
        return service.get_metrics(params.ticker)
    except ServiceError as exc:
        status_code = 400 if 'not found' in exc.message.lower() else 502
        return JSONResponse(
            status_code=status_code,
            content={'error': exc.message, 'details': exc.details},
        )
