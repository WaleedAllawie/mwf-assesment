.PHONY: up down logs test test-backend test-frontend

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

test-backend:
	cd backend && uv run pytest

test-frontend:
	cd frontend && npm run test

test: test-backend test-frontend
