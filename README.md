# Stock Dashboard Monorepo

A full-stack monorepo with:

- **Frontend**: Next.js + TypeScript + Tailwind + Recharts
- **Backend**: FastAPI + yfinance + in-memory TTL cache

## File tree

```text
.
├── backend
│   ├── app
│   │   ├── __init__.py
│   │   ├── cache.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── service.py
│   ├── requirements.txt
│   └── tests
│       └── test_api.py
├── docker-compose.yml
├── frontend
│   ├── .env.example
│   ├── app
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── KeyMetrics.tsx
│   │   └── PriceChart.tsx
│   ├── lib
│   │   ├── api.ts
│   │   └── types.ts
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Backend setup (FastAPI)

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`

### Backend API examples

```bash
curl "http://localhost:8000/api/prices?ticker=AAPL&range=1y"
curl "http://localhost:8000/api/metrics?ticker=AAPL"
```

Error shape:

```json
{ "error": "...", "details": "..." }
```

## Frontend setup (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

Environment variable used by frontend:

- `NEXT_PUBLIC_API_BASE_URL` (default local value: `http://localhost:8000`)

## Full stack with Docker Compose (optional)

```bash
docker compose up --build
```

This starts:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`

## Notes

- Supported ranges: `1m`, `3m`, `6m`, `1y`, `5y`, `max`
- Ticker validation: alphanumeric + `.` + `-`, length 1–10
- Backend cache: in-memory TTL (60 seconds)
- Dates are returned as timezone-safe `YYYY-MM-DD`
- Missing yfinance fields are returned as `null`

## Run tests

```bash
cd backend
pytest
```
