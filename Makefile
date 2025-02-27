all: 
	docker-compose up --build -d

up:
	docker-compose up -d

build:
	docker-compose build

exec_api:
	docker exec -it fastapi bash

logs:
	docker compose logs -f api

schema:
	docker compose exec api alembic upgrade heads

db:
	docker compose exec database psql dev dev

down:
	docker-compose down