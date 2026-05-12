# Infrastructure OVH VPS + Docker + PostgreSQL — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer l'hébergement de Clever Cloud (SQLite éphémère) vers un VPS OVH avec Docker Compose, PostgreSQL persistant, Caddy HTTPS, et backups pg_dump vers OVH Object Storage.

**Architecture:** Quatre containers Docker orchestrés par Compose : `caddy` (reverse proxy HTTPS), `app` (Next.js + Payload), `postgres` (base de données persistante), `backup` (cron pg_dump → OVH Object Storage). Médias conservés sur OVH Object Storage via le plugin S3 existant. Déploiement automatisé via GitHub Actions → SSH.

**Tech Stack:** Docker Compose, Caddy 2, PostgreSQL 16, `@payloadcms/db-postgres`, GitHub Actions (`appleboy/ssh-action`), awscli (backup container).

---

## File Structure

**Fichiers créés :**
- `Dockerfile` — build multi-stage Next.js standalone
- `.dockerignore`
- `docker-compose.yml` — orchestration des 4 services
- `Caddyfile` — reverse proxy + HTTPS auto
- `docker/backup/Dockerfile` — image backup (pg_dump + awscli)
- `docker/backup/backup.sh` — script pg_dump + upload + rotation
- `.github/workflows/deploy.yml` — CI/CD GitHub Actions

**Fichiers modifiés :**
- `package.json` — swap sqlite → postgres, nettoyage scripts
- `src/payload.config.ts` — swap `sqliteAdapter` → `postgresAdapter`
- `next.config.mjs` — ajout `output: 'standalone'`
- `.env.example` — remplacement complet

**Fichiers supprimés :**
- `scripts/sqlite-backup.mjs`
- `scripts/sqlite-restore.mjs`
- `scripts/start-with-sqlite-backups.mjs`

---

## Task 1 : Créer la branche depuis main

**Files:** aucun fichier modifié

- [ ] **Step 1 : Créer la branche depuis main**

```bash
git checkout main
git checkout -b feat/infra-ovh-docker
```

- [ ] **Step 2 : Récupérer la spec depuis feat/ui-design-system**

```bash
git checkout feat/ui-design-system -- docs/superpowers/specs/2026-05-07-infrastructure-ovh-docker-design.md
git add docs/superpowers/specs/2026-05-07-infrastructure-ovh-docker-design.md
git commit -m "docs: add infra ovh-docker spec"
```

---

## Task 2 : Swap adaptateur SQLite → PostgreSQL

**Files:**
- Modify: `package.json`
- Modify: `src/payload.config.ts`

- [ ] **Step 1 : Mettre à jour package.json**

Remplacer le contenu de `package.json` :

```json
{
  "name": "commune-next-payload-starter",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "payload": "payload",
    "generate:types": "payload generate:types"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "latest",
    "@payloadcms/db-postgres": "latest",
    "@payloadcms/next": "latest",
    "@payloadcms/plugin-seo": "latest",
    "@payloadcms/richtext-lexical": "latest",
    "@payloadcms/storage-s3": "latest",
    "cross-env": "latest",
    "dotenv": "latest",
    "lucide-react": "^1.14.0",
    "next": "latest",
    "payload": "latest",
    "pg": "latest",
    "react": "latest",
    "react-dom": "latest",
    "sharp": "latest"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "latest",
    "@types/node": "latest",
    "@types/pg": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "tailwindcss": "latest",
    "typescript": "latest"
  }
}
```

- [ ] **Step 2 : Installer les dépendances**

```bash
npm install
```

Résultat attendu : pas d'erreur, `package-lock.json` mis à jour, `@payloadcms/db-postgres` et `pg` présents dans `node_modules`.

- [ ] **Step 3 : Mettre à jour payload.config.ts**

Remplacer le contenu de `src/payload.config.ts` :

```ts
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Navigation } from './collections/Navigation'
import { News } from './collections/News'
import { Events } from './collections/Events'
import { Documents } from './collections/Documents'
import { Associations } from './collections/Associations'
import { ElectedOfficials } from './collections/ElectedOfficials'
import { SiteSettings } from './globals/SiteSettings'
import { MairieInfo } from './globals/MairieInfo'
import { HomepageSettings } from './globals/HomepageSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const s3Enabled = process.env.S3_ENABLED === 'true'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Site communal'
    }
  },
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL
    }
  }),
  collections: [
    Users,
    Media,
    Pages,
    Navigation,
    News,
    Events,
    Documents,
    Associations,
    ElectedOfficials
  ],
  globals: [SiteSettings, MairieInfo, HomepageSettings],
  plugins: [
    ...(s3Enabled
      ? [
          s3Storage({
            collections: {
              media: true
            },
            bucket: process.env.S3_BUCKET || '',
            config: {
              region: process.env.S3_REGION || 'gra',
              endpoint: process.env.S3_ENDPOINT,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
              },
              forcePathStyle: true
            }
          })
        ]
      : [])
  ]
})
```

- [ ] **Step 4 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur de type.

- [ ] **Step 5 : Commit**

```bash
git add package.json package-lock.json src/payload.config.ts
git commit -m "feat: swap SQLite adapter for PostgreSQL"
```

---

## Task 3 : Supprimer les scripts SQLite

**Files:**
- Delete: `scripts/sqlite-backup.mjs`
- Delete: `scripts/sqlite-restore.mjs`
- Delete: `scripts/start-with-sqlite-backups.mjs`

- [ ] **Step 1 : Supprimer les fichiers**

```bash
rm scripts/sqlite-backup.mjs scripts/sqlite-restore.mjs scripts/start-with-sqlite-backups.mjs
```

- [ ] **Step 2 : Vérifier qu'aucune référence ne subsiste**

```bash
grep -r "sqlite-backup\|sqlite-restore\|start-with-sqlite" src/ --include="*.ts" --include="*.mjs" --include="*.js"
```

Résultat attendu : aucune sortie (pas de référence restante).

- [ ] **Step 3 : Commit**

```bash
git add -A scripts/
git commit -m "chore: remove SQLite backup scripts"
```

---

## Task 4 : Mettre à jour .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1 : Remplacer .env.example**

```bash
cat > .env.example << 'EOF'
# App
NEXT_PUBLIC_SITE_URL=https://mairie.exemple.fr
PAYLOAD_SECRET=change-me-please-use-a-long-random-secret

# PostgreSQL
DATABASE_URL=postgresql://mairie:password@postgres:5432/mairie
POSTGRES_DB=mairie
POSTGRES_USER=mairie
POSTGRES_PASSWORD=change-me-strong-password

# OVH Object Storage — médias Payload (S3 compatible)
S3_ENABLED=true
S3_BUCKET=mairie-media
S3_REGION=gra
S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# OVH Object Storage — backups pg_dump (bucket séparé, credentials séparés)
BACKUP_S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
BACKUP_S3_REGION=gra
BACKUP_S3_BUCKET=mairie-backups
BACKUP_S3_ACCESS_KEY_ID=
BACKUP_S3_SECRET_ACCESS_KEY=

# Caddy — domaine du site
DOMAIN=mairie.exemple.fr

# PanneauPocket widget, optionnel
NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL=
EOF
```

- [ ] **Step 2 : Commit**

```bash
git add .env.example
git commit -m "chore: update .env.example for OVH/Docker/PostgreSQL"
```

---

## Task 5 : Préparer Next.js pour le build Docker (standalone)

**Files:**
- Modify: `next.config.mjs`
- Create: `.dockerignore`

- [ ] **Step 1 : Ajouter output standalone dans next.config.mjs**

```js
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  output: 'standalone',
  experimental: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
}

export default withPayload(nextConfig)
```

- [ ] **Step 2 : Créer .dockerignore**

```
node_modules
.next
.git
data/
*.md
.env
.env.local
```

- [ ] **Step 3 : Vérifier le build Next.js en local**

Nécessite `DATABASE_URL` valide. Si une instance PostgreSQL locale est disponible :

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/mairie npm run build
```

Si aucune base n'est disponible localement, le build sera vérifié à l'étape Docker (Task 6). Passer à l'étape suivante.

- [ ] **Step 4 : Commit**

```bash
git add next.config.mjs .dockerignore
git commit -m "chore: add standalone output and dockerignore"
```

---

## Task 6 : Créer le Dockerfile

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1 : Créer le Dockerfile multi-stage**

```dockerfile
# Stage 1 — Dépendances
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2 — Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 3 — Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

- [ ] **Step 2 : Tester le build Docker**

Depuis la racine du projet :

```bash
docker build -t mairie-app .
```

Résultat attendu : `Successfully built <hash>` et `Successfully tagged mairie-app:latest`. Le build passe les 3 stages sans erreur.

Note : le stage `builder` lance `next build` sans `DATABASE_URL` — c'est normal, Payload ne requiert pas la base au moment du build.

- [ ] **Step 3 : Commit**

```bash
git add Dockerfile
git commit -m "feat: add multi-stage Dockerfile for Next.js standalone"
```

---

## Task 7 : Créer docker-compose.yml

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1 : Créer docker-compose.yml**

```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - app_network
    restart: unless-stopped

  app:
    build: .
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app_network
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    env_file: .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - app_network
    restart: unless-stopped

  backup:
    build: ./docker/backup
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app_network
    restart: unless-stopped

volumes:
  postgres_data:
  caddy_data:
  caddy_config:

networks:
  app_network:
    driver: bridge
```

- [ ] **Step 2 : Valider la syntaxe Compose**

```bash
docker compose config
```

Résultat attendu : la configuration complète s'affiche sans erreur.

- [ ] **Step 3 : Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose with caddy, app, postgres, backup"
```

---

## Task 8 : Créer le Caddyfile

**Files:**
- Create: `Caddyfile`

- [ ] **Step 1 : Créer le Caddyfile**

```caddyfile
{$DOMAIN} {
    reverse_proxy app:3000
}
```

`{$DOMAIN}` lit la variable d'env `DOMAIN` depuis le `.env` sur le VPS (ex: `mairie.exemple.fr`). Caddy gère le certificat Let's Encrypt automatiquement.

- [ ] **Step 2 : Commit**

```bash
git add Caddyfile
git commit -m "feat: add Caddyfile with auto-HTTPS reverse proxy"
```

---

## Task 9 : Créer le container de backup

**Files:**
- Create: `docker/backup/Dockerfile`
- Create: `docker/backup/backup.sh`

- [ ] **Step 1 : Créer le répertoire**

```bash
mkdir -p docker/backup
```

- [ ] **Step 2 : Créer backup.sh**

```bash
cat > docker/backup/backup.sh << 'SCRIPT'
#!/bin/sh
set -e

TIMESTAMP=$(date -u +%Y-%m-%dT%H%M%SZ)
DAY_OF_WEEK=$(date -u +%u)
DAY_OF_MONTH=$(date -u +%d)
BACKUP_FILE="/tmp/backup_${TIMESTAMP}.sql.gz"

echo "[$(date -u)] Starting pg_dump..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
echo "[$(date -u)] pg_dump complete."

export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$BACKUP_S3_REGION"
ENDPOINT="--endpoint-url ${BACKUP_S3_ENDPOINT}"
S3_BASE="s3://${BACKUP_S3_BUCKET}"

# Daily
aws s3 cp "$BACKUP_FILE" "${S3_BASE}/daily/${TIMESTAMP}.sql.gz" $ENDPOINT

# Weekly (dimanche)
if [ "$DAY_OF_WEEK" = "7" ]; then
  WEEK=$(date -u +%G-W%V)
  aws s3 cp "$BACKUP_FILE" "${S3_BASE}/weekly/${WEEK}.sql.gz" $ENDPOINT
fi

# Monthly (1er du mois)
if [ "$DAY_OF_MONTH" = "01" ]; then
  MONTH=$(date -u +%Y-%m)
  aws s3 cp "$BACKUP_FILE" "${S3_BASE}/monthly/${MONTH}.sql.gz" $ENDPOINT
fi

# Latest
aws s3 cp "$BACKUP_FILE" "${S3_BASE}/latest.sql.gz" $ENDPOINT

rm "$BACKUP_FILE"

# Rotation daily : garder 28 (7 jours × 4 backups/jour)
aws s3 ls "${S3_BASE}/daily/" $ENDPOINT | sort | head -n -28 | awk '{print $4}' | \
  while read -r f; do aws s3 rm "${S3_BASE}/daily/${f}" $ENDPOINT; done

# Rotation weekly : garder 4
aws s3 ls "${S3_BASE}/weekly/" $ENDPOINT | sort | head -n -4 | awk '{print $4}' | \
  while read -r f; do aws s3 rm "${S3_BASE}/weekly/${f}" $ENDPOINT; done

# Rotation monthly : garder 2
aws s3 ls "${S3_BASE}/monthly/" $ENDPOINT | sort | head -n -2 | awk '{print $4}' | \
  while read -r f; do aws s3 rm "${S3_BASE}/monthly/${f}" $ENDPOINT; done

echo "[$(date -u)] Backup and rotation complete."
SCRIPT

chmod +x docker/backup/backup.sh
```

- [ ] **Step 3 : Créer docker/backup/Dockerfile**

```dockerfile
FROM alpine:3.19
RUN apk add --no-cache postgresql16-client python3 py3-pip dcron && \
    pip3 install awscli
COPY backup.sh /backup.sh
RUN chmod +x /backup.sh
# Toutes les 6h
RUN echo "0 */6 * * * /backup.sh >> /var/log/backup.log 2>&1" | crontab -
CMD ["crond", "-f", "-d", "8"]
```

Note : on utilise `alpine:3.19` (pas `postgres:16-alpine`) — l'image postgres a un entrypoint qui tente de démarrer un serveur, ce qui interfèrerait avec le cron.

- [ ] **Step 4 : Tester le build du container backup**

```bash
docker build -t mairie-backup ./docker/backup
```

Résultat attendu : `Successfully built <hash>`.

- [ ] **Step 5 : Commit**

```bash
git add docker/
git commit -m "feat: add backup container with pg_dump and S3 rotation"
```

---

## Task 10 : Créer le workflow GitHub Actions

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1 : Créer le répertoire**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2 : Créer deploy.yml**

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/mairie
            git pull origin main
            docker compose up -d --build
```

- [ ] **Step 3 : Commit**

```bash
git add .github/
git commit -m "feat: add GitHub Actions deploy workflow"
```

---

## Task 11 : Vérification finale et smoke test

- [ ] **Step 1 : Vérifier que tous les fichiers sont présents**

```bash
ls Dockerfile .dockerignore docker-compose.yml Caddyfile \
   docker/backup/Dockerfile docker/backup/backup.sh \
   .github/workflows/deploy.yml
```

Résultat attendu : tous les fichiers listés existent.

- [ ] **Step 2 : Valider la config Compose complète**

```bash
docker compose config
```

Résultat attendu : configuration complète affichée sans erreur, les 4 services visibles.

- [ ] **Step 3 : Smoke test local (si PostgreSQL disponible localement)**

Créer un `.env` local temporaire :

```
DATABASE_URL=postgresql://mairie:password@localhost:5432/mairie
POSTGRES_DB=mairie
POSTGRES_USER=mairie
POSTGRES_PASSWORD=password
PAYLOAD_SECRET=dev-secret
DOMAIN=localhost
S3_ENABLED=false
BACKUP_S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
BACKUP_S3_REGION=gra
BACKUP_S3_BUCKET=mairie-backups
BACKUP_S3_ACCESS_KEY_ID=dummy
BACKUP_S3_SECRET_ACCESS_KEY=dummy
```

Puis :

```bash
docker compose up -d
docker compose logs -f app
```

Résultat attendu : le container `app` démarre et affiche `Ready` dans les logs, Caddy démarre, postgres passe le healthcheck.

- [ ] **Step 4 : Commit final**

```bash
git status
# S'assurer qu'il ne reste rien de non commité
```

---

## Notes de déploiement initial sur le VPS

Ces étapes sont manuelles et effectuées une seule fois sur le VPS, hors plan d'implémentation.

```bash
# 1. Cloner le repo sur le VPS
git clone <repo-url> /opt/mairie
cd /opt/mairie

# 2. Créer le .env (à partir de .env.example, remplir toutes les valeurs)
cp .env.example .env
nano .env

# 3. Démarrer PostgreSQL seul
docker compose up -d postgres

# 4. Créer les tables Payload
docker compose run --rm app npx payload migrate

# 5. Démarrer tous les services
docker compose up -d

# 6. Vérifier
docker compose ps
docker compose logs app
```
