NAME = hypertube
DOCKER_COMPOSE_FILE = docker-compose.yml
DOCKER_COMPOSE = docker compose -f $(DOCKER_COMPOSE_FILE) -p $(NAME)

all:
	# If the ./database/.env file does not exist, error message will be displayed
	[ -f ./database/.env ] || (echo "Please create a .env file in the database folder" && exit 1)
	$(DOCKER_COMPOSE) up -d

build:
	$(DOCKER_COMPOSE) build

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
