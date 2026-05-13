# Site communal — Next.js + Payload CMS

Site vitrine pour une commune : back-office administrable, actualités, agenda, documents, associations, intégration PanneauPocket.

## Stack

- **Next.js 15** App Router + React 19
- **Payload CMS** intégré dans la même app Next.js
- **PostgreSQL 18** base de données
- **OVH Object Storage** (S3 compatible) pour les médias et les backups
- **Tailwind CSS v4** + **shadcn/ui**
- **Docker Compose** : app · postgres · caddy · backup

## Architecture Docker

```
Caddy (reverse proxy + TLS)
└── Next.js + Payload (port 3000)
    └── PostgreSQL 18
        └── Backup pg_dump → OVH Object Storage (cron séparé)
```

## Routes

```
/admin                      Back-office Payload
/                           Accueil
/actualites                 Liste des actualités
/actualites/[slug]          Détail actualité
/agenda                     Liste des événements
/agenda/[slug]              Détail événement
/documents                  Documents publics
/associations               Annuaire associatif
/[...slug]                  Pages CMS configurables
```

## Collections Payload

```
Pages                       Pages libres administrables
Navigation                  Menu principal / footer configurables
Actualités                  Actus publiables
Agenda                      Événements
Documents                   Bulletins, arrêtés, formulaires, comptes-rendus
Associations                Annuaire associatif
Élus                        Conseil municipal
Médias                      Images + PDF (stockés dans OVH Object Storage)
Utilisateurs                Admin technique / Agent mairie
```

## Installation locale (dev)

```bash
cp .env.example .env
# Renseigner DATABASE_URL avec une base PostgreSQL locale
npm install
npm run dev
```

Ouvrir `http://localhost:3000/admin` — Payload propose la création du premier utilisateur au premier lancement.

### PostgreSQL local avec Docker

```bash
docker run -d \
  --name postgres-mairie \
  -e POSTGRES_DB=mairie \
  -e POSTGRES_USER=mairie \
  -e POSTGRES_PASSWORD=mairie \
  -p 5432:5432 \
  postgres:18-alpine
```

Puis dans `.env` :

```
DATABASE_URL=postgresql://mairie:mairie@localhost:5432/mairie
```

## Variables d'environnement

```
# App
NEXT_PUBLIC_SITE_URL=https://mairie.exemple.fr
PAYLOAD_SECRET=<secret long et aléatoire>

# PostgreSQL
DATABASE_URL=postgresql://mairie:<password>@postgres:5432/mairie
POSTGRES_DB=mairie
POSTGRES_USER=mairie
POSTGRES_PASSWORD=<password>

# OVH Object Storage — médias Payload
S3_ENABLED=true
S3_BUCKET=mairie-media
S3_REGION=gra
S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# OVH Object Storage — backups pg_dump (bucket séparé)
BACKUP_S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
BACKUP_S3_REGION=gra
BACKUP_S3_BUCKET=mairie-backups
BACKUP_S3_ACCESS_KEY_ID=
BACKUP_S3_SECRET_ACCESS_KEY=

# Caddy — domaine du site
DOMAIN=mairie.exemple.fr

# PanneauPocket widget (optionnel)
NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL=
```

## Déploiement Docker

```bash
cp .env.example .env
# Renseigner toutes les variables

docker compose up -d
```

Les 4 services démarrent :
1. `postgres` — base de données (healthcheck avant que l'app démarre)
2. `app` — Next.js + Payload, exécute `payload migrate` au démarrage
3. `caddy` — reverse proxy, TLS automatique via Let's Encrypt
4. `backup` — pg_dump vers OVH Object Storage selon cron

## Backups PostgreSQL

Le service `backup` (dans `docker/backup/`) exécute `pg_dump` et envoie l'archive compressée vers OVH Object Storage. Rotation : 7 backups journaliers, 4 hebdomadaires, 2 mensuels.

Bucket séparé du stockage médias — credentials séparés recommandés.

## Médias — OVH Object Storage

Payload stocke les uploads directement dans OVH Object Storage via `@payloadcms/storage-s3`. Activer avec `S3_ENABLED=true` et renseigner les credentials OVH.

## PanneauPocket

Deux options :

1. Définir `NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL` dans `.env`
2. Créer un bloc `PanneauPocket` dans une page et renseigner l'URL du widget dans l'administration

## Notes RGAA

Base implémentée :

- Skip link (`Aller au contenu principal`) en haut de chaque page
- Un seul `H1` par page
- Focus visible sur tous les éléments interactifs (outline teal 3px)
- Navigation clavier sur les dropdowns du menu (focus-within)
- Contraste couleurs conforme
- Alt sur les images
- Labels sur les formulaires
- HTML sémantique (`header`, `main`, `footer`, `nav`, `section`)

## À compléter avant production

- Rendu propre du rich text Lexical (actuellement JSON brut)
- Pages détail `/actualites/[slug]` et `/agenda/[slug]`
- Déclaration d'accessibilité, mentions légales, politique de confidentialité
- Redirections depuis les anciennes URLs Joomla
- Script de seed initial : menus, page accueil, contact, démarches
- Logo SVG de la commune (actuellement placeholder "M")
- `aria-current="page"` sur l'item de nav actif
