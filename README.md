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
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── tests
│       └── test_api.py
├── docker-compose.yml
├── frontend
│   ├── .eslintrc.json
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
├── .editorconfig
├── .pre-commit-config.yaml
├── .prettierignore
├── .prettierrc.json
├── CONTRIBUTING.md
├── Makefile
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

## Development Standards

### Tooling

- **Frontend linting**: ESLint with `next/core-web-vitals`, `next/typescript`, and `@typescript-eslint/recommended`.
- **Frontend formatting**: Prettier.
- **Backend linting/import sorting**: Ruff.
- **Backend formatting**: Black (`line-length = 100`).
- **Backend type checking**: MyPy (strict-ish settings).

### Repo-wide commands

Run from repository root:

```bash
make format
make lint
make typecheck
make test
make check
```

### Frontend commands

```bash
cd frontend
npm run lint
npm run format
npm run format:check
npm run build
```

### Backend commands

```bash
cd backend
ruff check app tests
black --check app tests
mypy app tests
pytest
```

### Pre-commit (optional but recommended)

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

Configured hooks run Ruff, Black, Prettier, and ESLint.

## Notes

- Supported ranges: `1m`, `3m`, `6m`, `1y`, `5y`, `max`
- Ticker validation: alphanumeric + `.` + `-`, length 1–10
- Backend cache: in-memory TTL (60 seconds)
- Dates are returned as timezone-safe `YYYY-MM-DD`
- Missing yfinance fields are returned as `null`
