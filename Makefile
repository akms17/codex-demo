.PHONY: format lint test typecheck check frontend-install backend-install

frontend-install:
	cd frontend && npm install

backend-install:
	cd backend && pip install -r requirements.txt

format:
	cd frontend && npm run format
	cd backend && black app tests && ruff check app tests --fix

lint:
	cd frontend && npm run lint
	cd frontend && npm run format:check
	cd backend && ruff check app tests
	cd backend && black --check app tests

typecheck:
	cd backend && mypy app tests

test:
	cd backend && pytest

check: lint typecheck test
