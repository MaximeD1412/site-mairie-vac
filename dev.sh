#!/usr/bin/env bash
set -e

COMPOSE="docker compose -f docker-compose.dev.yml"

case "${1}" in
  up)
    $COMPOSE up -d
    echo "Dev environment started — http://localhost:3000"
    ;;
  down)
    $COMPOSE down
    ;;
  reset)
    echo "Resetting dev environment..."
    $COMPOSE down -v
    echo "Running migrations..."
    $COMPOSE run --rm app node_modules/.bin/payload migrate
    echo "Seeding data..."
    $COMPOSE run --rm app npm run seed
    echo "Starting dev server..."
    $COMPOSE up -d app
    echo "Done — http://localhost:3000"
    ;;
  seed)
    $COMPOSE exec app npm run seed
    ;;
  logs)
    $COMPOSE logs -f app
    ;;
  *)
    echo "Usage: ./dev.sh [up|down|reset|seed|logs]"
    exit 1
    ;;
esac
