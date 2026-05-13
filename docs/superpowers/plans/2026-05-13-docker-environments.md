# Docker Environments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Séparer dev (hot reload) et prod dans des configs Docker distinctes.

**Architecture:** Dockerfile multi-stage avec un stage `development` (sans build, source en volume) et le stage `runner` existant pour la prod. Un fichier `docker-compose.dev.yml` autonome pour le dev (app + postgres uniquement), le `docker-compose.yml` existant reste pour la prod avec `target: runner` explicite.

**Tech Stack:** Docker, Docker Compose, Next.js (Payload CMS), Node 24 Alpine

---

### Task 1 : Ajouter le stage `development` au Dockerfile

**Files:**
- Modify: `Dockerfile`

- [ ] **Step 1 : Modifier le Dockerfile**

Insérer le stage `development` après le stage `deps` et avant `builder` :

```dockerfile
# Stage 1 — Dépendances
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2 — Development (hot reload via volume)
FROM node:24-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
CMD ["npm", "run", "dev"]

# Stage 3 — Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 4 — Runtime
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "node_modules/.bin/payload migrate && node_modules/.bin/next start"]
```

- [ ] **Step 2 : Commit**

```bash
git add Dockerfile
git commit -m "feat: add development stage to Dockerfile"
```

---

### Task 2 : Créer docker-compose.dev.yml

**Files:**
- Create: `docker-compose.dev.yml`

- [ ] **Step 1 : Créer le fichier**

```yaml
services:
  app:
    build:
      context: .
      target: development
      network: host
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    env_file: .env
    environment:
      - WATCHPACK_POLLING=true
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app_network

  postgres:
    image: postgres:18-alpine
    env_file: .env
    volumes:
      - postgres_data_dev:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - app_network

volumes:
  postgres_data_dev:

networks:
  app_network:
    driver: bridge
```

- [ ] **Step 2 : Commit**

```bash
git add docker-compose.dev.yml
git commit -m "feat: add docker-compose.dev.yml with hot reload"
```

---

### Task 3 : Mettre à jour docker-compose.yml (prod)

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1 : Ajouter `target: runner` au service app**

Dans le bloc `build` du service `app` :

```yaml
  app:
    ports:
      - "3000:3000"
    build:
      context: .
      target: runner
      network: host
```

- [ ] **Step 2 : Commit**

```bash
git add docker-compose.yml
git commit -m "feat: explicit target runner in prod docker-compose"
```

---

## Utilisation

```bash
# Dev (hot reload)
docker compose -f docker-compose.dev.yml up --build

# Prod
docker compose up --build
```
