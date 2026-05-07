# Spec — Refonte infrastructure : OVH VPS + Docker + PostgreSQL

**Date :** 2026-05-07
**Branche :** feat/ui-design-system

---

## Contexte

Le projet était initialement prévu pour Clever Cloud (SQLite éphémère + backup Cellar). L'hébergement passe sur un VPS OVH avec Docker Compose, ce qui permet d'utiliser PostgreSQL avec un volume persistant et simplifie la stratégie de backup.

---

## Architecture cible

```
OVH VPS
│
├── docker-compose.yml
│   ├── caddy          (ports 80/443 publics)
│   │   └── reverse_proxy → app:3000
│   ├── app            (Next.js + Payload, port 3000 interne)
│   │   └── dépend de postgres
│   ├── postgres       (port 5432 interne uniquement)
│   │   └── volume: postgres_data
│   └── backup         (cron Alpine + pg_dump + aws cli)
│       └── upload → OVH Object Storage
│
├── volumes
│   ├── postgres_data  (données PostgreSQL persistantes)
│   ├── caddy_data     (certificats TLS auto)
│   └── caddy_config
│
└── réseau interne: app_network
```

Seul Caddy est exposé à l'extérieur. Les services `app`, `postgres` et `backup` communiquent sur un réseau Docker interne.

---

## Services Docker

### caddy

- Image officielle `caddy:alpine`
- Ports 80 et 443 exposés
- Caddyfile minimal : reverse proxy vers `app:3000`
- HTTPS automatique via Let's Encrypt
- Volume `caddy_data` pour les certificats (persistance entre redémarrages)

### app

- Image buildée depuis un `Dockerfile` multi-stage (Node Alpine)
- Stage build : `npm ci` + `next build`
- Stage runtime : copie du `.next` standalone, expose port 3000
- Lit les variables d'env depuis le fichier `.env` sur le VPS (non versionné)
- Dépend de `postgres` (healthcheck)

### postgres

- Image `postgres:16-alpine`
- Volume `postgres_data` monté sur `/var/lib/postgresql/data`
- Port 5432 non exposé à l'hôte
- Variables : `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

### backup

- Image légère construite depuis un Dockerfile Alpine avec `postgresql-client` + `aws cli`
- Cron toutes les 6h : `pg_dump` compressé + upload OVH Object Storage
- Rotation : 7 quotidiens, 4 hebdomadaires, 2 mensuels
- Même logique de nommage que l'ancienne stratégie Cellar

---

## Stockage externe — OVH Object Storage

Remplace Cellar pour les deux usages :

| Usage | Bucket | Contenu |
|-------|--------|---------|
| Médias Payload | `mairie-media` | Images, PDFs uploadés via le CMS |
| Backups | `mairie-backups` | Archives pg_dump compressées |

Le plugin `@payloadcms/storage-s3` est conservé, seules les variables d'env changent (endpoint OVH, nouvelles credentials).

OVH Object Storage est compatible S3 (endpoint : `s3.<region>.io.cloud.ovh.net`).

---

## Changements de code

### payload.config.ts

Remplacement de l'adapter SQLite par PostgreSQL :

```ts
import { postgresAdapter } from '@payloadcms/db-postgres'

db: postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URL },
})
```

### package.json

- Retirer : `@payloadcms/db-sqlite`, `better-sqlite3`
- Ajouter : `@payloadcms/db-postgres`, `pg`
- Script `start` : redevient `next start` (suppression de `start-with-sqlite-backups.mjs`)

### Scripts supprimés

- `scripts/sqlite-backup.mjs`
- `scripts/sqlite-restore.mjs`
- `scripts/start-with-sqlite-backups.mjs`

### Fichiers à créer

- `Dockerfile` — multi-stage Node Alpine
- `docker-compose.yml` — 4 services
- `Caddyfile` — reverse proxy + HTTPS
- `docker/backup/Dockerfile` — image backup Alpine
- `docker/backup/backup.sh` — script pg_dump + upload + rotation
- `.github/workflows/deploy.yml` — GitHub Actions SSH deploy

### .env.example

Mis à jour pour documenter toutes les variables runtime attendues :
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` (médias)
- `BACKUP_S3_ENDPOINT`, `BACKUP_S3_ACCESS_KEY`, `BACKUP_S3_SECRET_KEY`, `BACKUP_S3_BUCKET`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

---

## Déploiement — GitHub Actions

Workflow déclenché sur push vers `main` :

1. Connexion SSH au VPS (clé privée dans les secrets GitHub)
2. `git pull origin main`
3. `docker compose up -d --build`

`docker compose up -d --build` reconstruit uniquement le container `app` si le code a changé. Les containers `postgres`, `caddy` et `backup` ne sont pas interrompus.

**Secrets GitHub à configurer :**
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

---

## Migration des données

Les données SQLite existantes sont du contenu de développement — pas de migration automatique nécessaire.

Procedure de premier démarrage sur le VPS :
1. `docker compose up -d postgres`
2. `docker compose run --rm app npx payload migrate`
3. `docker compose up -d`

Les fichiers de migration Payload existants (`src/migrations/`) sont conservés et rejoués sur la nouvelle base PostgreSQL.

---

## Ce qui ne change pas

- Toutes les collections, globals et composants Payload/Next.js
- Le plugin `@payloadcms/storage-s3` (seules les variables d'env changent)
- Les migrations Payload existantes
- La logique de rotation des backups (7j / 4s / 2m)
