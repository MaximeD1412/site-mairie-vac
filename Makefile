COMPOSE := docker compose -f docker-compose.dev.yml

.PHONY: up down down-clean build reset wait-ready migrate seed logs help

help: ## Afficher l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

up: ## Démarrer l'environnement de dev
	$(COMPOSE) up -d
	@echo "Dev environment started — http://localhost:3000"

down: ## Arrêter l'environnement (volumes conservés)
	$(COMPOSE) down

down-clean: ## Arrêter l'environnement et supprimer les volumes
	$(COMPOSE) down -v

build: ## Builder l'image Docker
	$(COMPOSE) build

wait-ready: ## Attendre que Next.js soit prêt
	@echo "Waiting for Next.js to be ready..."
	@until curl -sf http://localhost:3000 > /dev/null; do sleep 2; done
	@echo "Next.js is ready"

migrate: ## Lancer les migrations Payload
	$(COMPOSE) exec -T app node_modules/.bin/payload migrate

seed: ## Seeder la base de données
	$(COMPOSE) exec -T app npm run seed

reset: down-clean build up wait-ready migrate seed ## Reset complet (volumes supprimés, rebuild, migrate, seed)
	@echo "Done — http://localhost:3000"

logs: ## Suivre les logs de l'app
	$(COMPOSE) logs -f app
