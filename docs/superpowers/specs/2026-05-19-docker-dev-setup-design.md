# Docker Dev Setup — Design Spec

**Date:** 2026-05-19  
**Status:** Approved

## Context

The existing `docker-compose.yml` + `Dockerfile` target production only (`NODE_ENV=production`, multi-stage build, `payload migrate && next start`). There is no dev mode Docker setup. Running the app in dev requires either running Next.js locally (outside Docker) or a dedicated dev compose file.

## Goal

Run the full dev stack (Next.js + Payload + Postgres) inside Docker with hot reload, using a single command.

## Scope

Two new files:
- `Dockerfile.dev`
- `docker-compose.dev.yml`

No changes to existing `docker-compose.yml` or `Dockerfile`.

## Architecture

### `Dockerfile.dev`

- Base image: `node:24-alpine`
- Single stage (no multi-stage — no build artifact needed)
- Installs dependencies (`npm install`) from `package.json`
- Does NOT copy source code (sources are mounted via volume at runtime)
- `node_modules` lives inside the image, isolated from the host via an anonymous volume
- CMD: `npm run dev`

### `docker-compose.dev.yml`

Two services, no Caddy, no backup.

**`postgres`**
- Same image and healthcheck as prod (`postgres:18-alpine`)
- Separate named volume `postgres_data_dev` to avoid polluting the prod DB
- Same `env_file: .env`

**`app`**
- Built from `Dockerfile.dev`
- Depends on postgres (healthcheck)
- Mounts source files as read-write volumes: `./src`, `./public`, `./package.json`, `./tsconfig.json`, `next.config.js` (if present), `payload.config.ts` (via `./src`)
- Anonymous volume on `/app/node_modules` to shadow host's `node_modules`
- `env_file: .env`
- `NODE_ENV=development`
- `WATCHPACK_POLLING=true` — required for reliable hot reload in WSL2 (inotify events don't propagate correctly through the WSL2/Windows filesystem boundary)
- Port: `3000:3000`

### Payload behavior in dev mode

With `NODE_ENV=development`, Payload's `postgresAdapter` uses `push` (direct schema sync) instead of migrations. This is intentional for dev — no need to run `payload migrate` manually.

## Launch command

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Files affected

| File | Action |
|------|--------|
| `Dockerfile.dev` | Create |
| `docker-compose.dev.yml` | Create |
