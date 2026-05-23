#!/usr/bin/env bash
set -e

COMPOSE="docker compose -f docker-compose.yml"

case "${1}" in
  up)
    $COMPOSE up -d --build
    echo "Production environment started."
    ;;
  down)
    $COMPOSE down
    ;;
  *)
    echo "Usage: ./prod.sh [up|down]"
    exit 1
    ;;
esac
