.PHONY: help install dev-api dev-web test lint generate-contracts demo docker-up docker-down

help:
	@echo "ScamShield AI Automation Commands:"
	@echo "  make install            Install Python backend & Node frontend dependencies"
	@echo "  make dev-api            Run FastAPI backend with reload"
	@echo "  make dev-web            Run Next.js frontend dev server"
	@echo "  make test               Run Python unit, integration, and scenario tests"
	@echo "  make lint               Run ruff / flake8 and TypeScript checks"
	@echo "  make generate-contracts Export OpenAPI spec and generate TypeScript client"
	@echo "  make demo               Execute full end-to-end demo scenarios suite"
	@echo "  make docker-up          Start all services via Docker Compose"
	@echo "  make docker-down        Stop all Docker Compose services"

install:
	cd apps/api && pip install -r requirements.txt
	cd apps/web && npm install
	cd packages/contracts && npm install

dev-api:
	cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-web:
	cd apps/web && npm run dev

test:
	cd apps/api && pytest ../../tests -v

lint:
	cd apps/api && ruff check .
	cd apps/web && npm run lint

generate-contracts:
	python -c "import json; from apps.api.app.main import app; open('packages/contracts/openapi.json', 'w').write(json.dumps(app.openapi(), indent=2))"
	cd packages/contracts && npm run build

demo:
	cd apps/api && pytest ../../tests/e2e/test_scenarios.py -v

docker-up:
	docker compose up -d

docker-down:
	docker compose down
