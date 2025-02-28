NAME = hypertube
DOCKER_COMPOSE_FILE = docker-compose.yml
DOCKER_COMPOSE = docker compose -f $(DOCKER_COMPOSE_FILE) -p $(NAME)

all:
	$(DOCKER_COMPOSE) up -d --build

build_up:
$(DOCKER_COMPOSE) up  --build

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
	docker rmi -f $(shell docker images -q)
	docker volume rm $(shell docker volume ls -q)

re: fclean build_up
