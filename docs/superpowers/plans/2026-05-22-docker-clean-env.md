# Docker Clean Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Séparer proprement les environnements dev et prod Docker avec hot reload fonctionnel, seed resetable en une commande, et fichiers d'environnement distincts.

**Architecture:** Dev tourne sur le filesystem WSL2 natif (inotify natif = hot reload sans polling), avec une DB persistante resetable via `./dev.sh reset` qui nuke le volume + re-seed. Prod reste inchangé fonctionnellement, seul le fichier env change (`.env` → `.env.prod`). Deux scripts bash (`dev.sh`, `prod.sh`) exposent une interface simple.

**Tech Stack:** Docker Compose v2, Next.js 15 (Turbopack), Payload CMS 3.x, PostgreSQL 18-alpine, Caddy, node:24-alpine

---

## Prérequis : Déménager le projet dans le filesystem WSL2

> ⚠️ **À faire manuellement AVANT toute autre tâche.** Le hot reload ne fonctionnera pas tant que le projet est sur `/mnt/c/`.

- [ ] **Step 1 : Copier le projet dans le filesystem WSL2**

```bash
cp -r /mnt/c/Users/MaximeDUPRE/PROJECTS/site-mairie-vac ~/projects/site-mairie-vac
```

- [ ] **Step 2 : Ouvrir le projet depuis le nouveau chemin**

Dans VS Code : `Ctrl+Shift+P` → "Remote-WSL: Open Folder in WSL" → sélectionner `~/projects/site-mairie-vac`.

Ou depuis le terminal WSL2 :
```bash
cd ~/projects/site-mairie-vac
code .
```

- [ ] **Step 3 : Vérifier que git est intact**

```bash
git status
git log --oneline -3
```

Expected : historique intact, branche courante visible.

- [ ] **Step 4 : Supprimer l'ancienne copie Windows (optionnel, après validation)**

```bash
# Uniquement après avoir vérifié que tout fonctionne depuis ~/projects/
rm -rf /mnt/c/Users/MaximeDUPRE/PROJECTS/site-mairie-vac
```

---

## Fichiers créés / modifiés

| Fichier | Action | Responsabilité |
|---|---|---|
| `.gitignore` | Modifier | Ignorer `.env.dev` et `.env.prod` |
| `.env.example` | Modifier | Template annoté dev vs prod |
| `.env.dev` | Créer | Variables dev locales (gitignored) |
| `docker-compose.dev.yml` | Modifier | Orchestration dev : volumes WSL2-native, env dev |
| `Dockerfile.dev` | Modifier | Image dev : Turbopack sans `--webpack` |
| `docker-compose.yml` | Modifier | Orchestration prod : référence `.env.prod` |
| `dev.sh` | Créer | CLI dev : up / down / reset / seed / logs |
| `prod.sh` | Créer | CLI prod : up / down |

---

## Task 1 : `.gitignore`, `.env.example`, `.env.dev`

**Files:**
- Modify: `.gitignore`
- Modify: `.env.example`
- Create: `.env.dev`

- [ ] **Step 1 : Mettre à jour `.gitignore`**

Remplacer la ligne `.env` par les trois lignes suivantes :

```
.env
.env.dev
.env.prod
.env.local
```

- [ ] **Step 2 : Réécrire `.env.example` annoté dev vs prod**

Remplacer le contenu de `.env.example` par :

```
# ============================================================
# VARIABLES COMMUNES (dev + prod)
# ============================================================

PAYLOAD_SECRET=change-me-please-use-a-long-random-secret

POSTGRES_DB=mairie
POSTGRES_USER=mairie
POSTGRES_PASSWORD=change-me-strong-password
DATABASE_URL=postgresql://mairie:change-me-strong-password@postgres:5432/mairie

# ============================================================
# DEV UNIQUEMENT — copier dans .env.dev
# ============================================================

# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# S3_ENABLED=false
# NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL=

# ============================================================
# PROD UNIQUEMENT — copier dans .env.prod
# ============================================================

# NEXT_PUBLIC_SITE_URL=https://mairie.exemple.fr

# OVH Object Storage — médias Payload (S3 compatible)
# S3_ENABLED=true
# S3_BUCKET=mairie-media
# S3_REGION=gra
# S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=

# OVH Object Storage — backups pg_dump (bucket séparé)
# BACKUP_S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
# BACKUP_S3_REGION=gra
# BACKUP_S3_BUCKET=mairie-backups
# BACKUP_S3_ACCESS_KEY_ID=
# BACKUP_S3_SECRET_ACCESS_KEY=

# Caddy — domaine du site
# DOMAIN=mairie.exemple.fr

# PanneauPocket widget, optionnel
# NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL=
```

- [ ] **Step 3 : Créer `.env.dev`**

Créer le fichier `.env.dev` avec les valeurs de développement :

```
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYLOAD_SECRET=dev-secret-not-for-production

# PostgreSQL
DATABASE_URL=postgresql://mairie:devpassword@postgres:5432/mairie
POSTGRES_DB=mairie
POSTGRES_USER=mairie
POSTGRES_PASSWORD=devpassword

# S3 — désactivé en dev
S3_ENABLED=false
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

- [ ] **Step 4 : Vérifier que `.env.dev` est bien ignoré par git**

```bash
git status
```

Expected : `.env.dev` n'apparaît pas dans les fichiers trackés.

- [ ] **Step 5 : Commit**

```bash
git add .gitignore .env.example
git commit -m "chore: split env into .env.dev / .env.prod, update .gitignore"
```

---

## Task 2 : Mettre à jour `docker-compose.dev.yml`

**Files:**
- Modify: `docker-compose.dev.yml`

- [ ] **Step 1 : Réécrire `docker-compose.dev.yml`**

Remplacer le contenu entier par :

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
      network: host
    ports:
      - "3000:3000"
    env_file: .env.dev
    environment:
      - NODE_ENV=development
    volumes:
      - ./:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app_network

  postgres:
    image: postgres:18-alpine
    ports:
      - "5432:5432"
    env_file: .env.dev
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
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

Changements clés vs l'ancienne version :
- `env_file: .env` → `env_file: .env.dev`
- Volumes : mounts de fichiers individuels → `./:/app` + `/app/node_modules` (possible sur WSL2 natif)
- Suppression de `WATCHPACK_POLLING=true` (inutile sur filesystem ext4 natif)
- Volume postgres corrigé : `/var/lib/postgresql` → `/var/lib/postgresql/data`

- [ ] **Step 2 : Vérifier la syntaxe du fichier**

```bash
docker compose -f docker-compose.dev.yml config
```

Expected : YAML valide affiché sans erreur.

- [ ] **Step 3 : Commit**

```bash
git add docker-compose.dev.yml
git commit -m "chore(dev): use WSL2-native volumes, .env.dev, remove watchpack polling"
```

---

## Task 3 : Mettre à jour `Dockerfile.dev`

**Files:**
- Modify: `Dockerfile.dev`

- [ ] **Step 1 : Réécrire `Dockerfile.dev`**

Remplacer le contenu entier par :

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Changement : `next dev --webpack` → `npm run dev` (Turbopack par défaut, plus rapide, cohérent avec `package.json`).

- [ ] **Step 2 : Commit**

```bash
git add Dockerfile.dev
git commit -m "chore(dev): switch to Turbopack via npm run dev"
```

---

## Task 4 : Mettre à jour `docker-compose.yml` (prod)

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1 : Remplacer `env_file: .env` par `env_file: .env.prod` dans tous les services**

Dans `docker-compose.yml`, chaque service (`caddy`, `app`, `postgres`, `backup`) a `env_file: .env`. Remplacer toutes les occurrences par `env_file: .env.prod`.

Résultat attendu — extrait du fichier :

```yaml
  caddy:
    ...
    env_file: .env.prod

  app:
    ...
    env_file: .env.prod

  postgres:
    ...
    env_file: .env.prod

  backup:
    ...
    env_file: .env.prod
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
docker compose -f docker-compose.yml config 2>&1 | head -5
```

Expected : erreur `env_file .env.prod not found` (normal, le fichier n'existe pas en local — la config est valide).

- [ ] **Step 3 : Migrer le fichier `.env` sur le VPS**

> ⚠️ **Action manuelle sur le serveur** — à faire avant le prochain déploiement.

Se connecter en SSH et renommer :

```bash
cd /opt/mairie
cp .env .env.prod
# Vérifier que .env.prod contient tout ce qu'il faut
cat .env.prod
```

Garder l'ancien `.env` sur le serveur jusqu'à validation du déploiement.

- [ ] **Step 4 : Commit**

```bash
git add docker-compose.yml
git commit -m "chore(prod): use .env.prod instead of .env"
```

---

## Task 5 : Créer `dev.sh`

**Files:**
- Create: `dev.sh`

- [ ] **Step 1 : Créer `dev.sh`**

```bash
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
    echo "Initializing schema and seeding data..."
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
```

Explication du flux `reset` :
1. `down -v` — stoppe tout et supprime le volume postgres
2. `run --rm app npm run seed` — démarre postgres (via `depends_on`), attend le healthcheck, puis exécute le seed qui pousse le schéma Payload en mode dev et insère les données
3. `up -d app` — démarre le dev server, Payload trouve le schéma déjà en place

- [ ] **Step 2 : Rendre le script exécutable**

```bash
chmod +x dev.sh
```

- [ ] **Step 3 : Vérifier la syntaxe bash**

```bash
bash -n dev.sh
```

Expected : aucune sortie (pas d'erreur de syntaxe).

- [ ] **Step 4 : Commit**

```bash
git add dev.sh
git commit -m "chore: add dev.sh with up/down/reset/seed/logs commands"
```

---

## Task 6 : Créer `prod.sh`

**Files:**
- Create: `prod.sh`

- [ ] **Step 1 : Créer `prod.sh`**

```bash
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
```

- [ ] **Step 2 : Rendre le script exécutable**

```bash
chmod +x prod.sh
```

- [ ] **Step 3 : Vérifier la syntaxe bash**

```bash
bash -n prod.sh
```

Expected : aucune sortie.

- [ ] **Step 4 : Commit**

```bash
git add prod.sh
git commit -m "chore: add prod.sh with up/down commands"
```

---

## Task 7 : Test de bout en bout

> Effectuer ces tests depuis `~/projects/site-mairie-vac` (filesystem WSL2 natif).

- [ ] **Step 1 : Premier démarrage propre**

```bash
./dev.sh reset
```

Expected :
```
Resetting dev environment...
Initializing schema and seeding data...
[seed] associations: 3 inserted, 0 skipped
[seed] elected-officials: 5 inserted, 0 skipped
[seed] news: 8 inserted, 0 skipped
[seed] events: 8 inserted, 0 skipped
[seed] pages: 2 inserted, 0 skipped
[seed] mairie-info: updated
[seed] site-settings: updated
[seed] homepage-settings: updated
[seed] Done.
Starting dev server...
Done — http://localhost:3000
```

- [ ] **Step 2 : Vérifier que l'app tourne**

```bash
./dev.sh logs
```

Attendre la ligne `✓ Ready in Xs` dans les logs Next.js. Ouvrir `http://localhost:3000` dans le navigateur.

- [ ] **Step 3 : Vérifier le hot reload**

Modifier n'importe quel fichier dans `src/` (ex. changer un texte dans un composant React). Le navigateur doit se rafraîchir automatiquement en moins de 2 secondes, sans relancer le serveur.

- [ ] **Step 4 : Vérifier l'idempotence du seed**

```bash
./dev.sh seed
```

Expected : tous les compteurs affichent `0 inserted, X skipped`. Aucune erreur.

- [ ] **Step 5 : Vérifier le reset complet**

```bash
./dev.sh reset
```

Expected : même output qu'au Step 1. L'app repart avec des données fraîches.

- [ ] **Step 6 : Vérifier `down`**

```bash
./dev.sh down
docker ps
```

Expected : aucun container du projet en cours d'exécution.
