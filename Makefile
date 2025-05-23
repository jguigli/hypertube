NAME = hypertube
DOCKER_COMPOSE_FILE = docker-compose.yml
DOCKER_COMPOSE = docker compose -f $(DOCKER_COMPOSE_FILE) -p $(NAME)

all:
	$(DOCKER_COMPOSE) up -d --build

build_up:
	$(DOCKER_COMPOSE) up --build

build_up_d:
	$(DOCKER_COMPOSE) up --build -d

build:
	$(DOCKER_COMPOSE) build

exec_api:
	docker exec -it fastapi bash

logs:
	$(DOCKER_COMPOSE) logs -f api

# Logs of a specific container
# Usage: make logs_<container_name>
logs_%:
	$(DOCKER_COMPOSE) logs $*

schema:
	$(DOCKER_COMPOSE) exec api alembic upgrade heads

db:
	$(DOCKER_COMPOSE) exec database psql dev dev

down:
	$(DOCKER_COMPOSE) down

# Execute a shell in the container
# Usage: make shell_<container_name>
shell_%:
	$(DOCKER_COMPOSE) exec $* sh

clean:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) rm -f
	docker volume rm $(shell docker volume ls -q)

fclean:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) rm -f
	@if [ -n "$(shell docker volume ls -q)" ]; then \
		docker volume rm $(shell docker volume ls -q); \
	fi
	@if [ -n "$(shell docker images -q)" ]; then \
		docker rmi -f $(shell docker images -q); \
	fi
	mv ./backend/profile_pictures/default.jpg ./backend/default.jpg.tmp
	rm -rf ./backend/profile_pictures/*
	mv ./backend/default.jpg.tmp ./backend/profile_pictures/default.jpg
	rm -rf ./backend/downloads/*
	rm -rf ./backend/hls_movies/*
	docker system prune -af


re: fclean build_up
