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
    echo "Starting dev server..."
    $COMPOSE up -d
    echo "Waiting for Next.js to be ready..."
    until $COMPOSE logs app 2>&1 | grep -q "Ready in"; do
      sleep 2
    done
    echo "Running migrations..."
    $COMPOSE exec -T app node_modules/.bin/payload migrate
    echo "Seeding data..."
    $COMPOSE exec -T app npm run seed
    echo "Done — http://localhost:3000"
    ;;
  seed)
    $COMPOSE exec -T app npm run seed
    ;;
  logs)
    $COMPOSE logs -f app
    ;;
  *)
    echo "Usage: ./dev.sh [up|down|reset|seed|logs]"
    exit 1
    ;;
esac
