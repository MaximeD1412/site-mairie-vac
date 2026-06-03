# Starter site communal — Next.js + Payload CMS

Starter pensé pour une petite commune : site vitrine moderne, back-office clair, contenus administrables, agenda, actualités, documents, associations et intégration PanneauPocket.

## Stack

- Next.js App Router
- Payload CMS intégré dans la même app
- PostgreSQL
- OVH Object Storage (S3 compatible) pour les médias en production
- Tailwind CSS
- Docker Compose (Caddy + Next.js + PostgreSQL + service backup)
- OVH Cloud VPS

## Structure fonctionnelle

```txt
/admin                      Back-office Payload
/                           Accueil
/actualites                 Liste des actualités
/agenda                     Liste des événements
/documents                  Documents publics
/associations               Annuaire associatif
/[...slug]                  Pages CMS configurables
```

## Collections Payload

```txt
Pages                       Pages libres administrables
Navigation                  Menu principal / footer configurables
Actualités                  Actus publiables
Agenda                      Événements
Documents                   Bulletins, arrêtés, formulaires, comptes-rendus
Associations                Annuaire associatif
Élus                        Conseil municipal
Médias                      Images + PDF
Utilisateurs                Admin technique / Agent mairie
```

## Installation locale

```bash
cp .env.example .env.dev
# remplir .env.dev avec vos valeurs
./dev.sh up
```

Puis ouvrir :

```txt
http://localhost:3000/admin
```

Au premier lancement, Payload propose la création du premier utilisateur.

### Commandes dev disponibles

```bash
./dev.sh up      # démarrer l'environnement Docker
./dev.sh down    # arrêter
./dev.sh reset   # reset complet (volumes + migrations + seed démo)
./dev.sh seed    # relancer le seed démo
./dev.sh logs    # suivre les logs de l'app
```

## Seed de démonstration

Pour pré-remplir la base avec des données fictives couvrant toutes les collections et tous les blocs CMS :

```bash
./dev.sh seed
# ou directement dans le conteneur :
docker compose -f docker-compose.dev.yml exec app npm run seed
```

Le seed est idempotent : il peut être relancé sans créer de doublons. Il ne fonctionne qu'en `NODE_ENV=development` et refuse de tourner en production.

Données insérées : associations, élus, actualités, catégories d'événements, événements, pages (avec blocs richText, quickLinks, collectionList, accordion, button, contact, map), navigation principale et footer, et globals (mairie-info, site-settings, homepage-settings).

> Les blocs `GalleryBlock` et `ImageBlock` nécessitent des médias importés manuellement et ne sont pas inclus dans le seed.

### Seed init production

Pour initialiser la structure minimale en production (sans données fictives) :

```bash
docker compose exec app npm run seed:init
```

## Variables d'environnement

Copier `.env.example` comme base :

```bash
cp .env.example .env.dev    # développement
cp .env.example .env.prod   # production
```

Variables principales :

```env
PAYLOAD_SECRET=...

POSTGRES_DB=mairie
POSTGRES_USER=mairie
POSTGRES_PASSWORD=...
DATABASE_URL=postgresql://mairie:...@postgres:5432/mairie

NEXT_PUBLIC_SITE_URL=https://mairie.exemple.fr
```

Variables production (OVH Object Storage) :

```env
# Médias Payload
S3_ENABLED=true
S3_BUCKET=mairie-media
S3_REGION=gra
S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# Backups pg_dump
BACKUP_S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
BACKUP_S3_REGION=gra
BACKUP_S3_BUCKET=mairie-backups
BACKUP_S3_ACCESS_KEY_ID=...
BACKUP_S3_SECRET_ACCESS_KEY=...

# Caddy
DOMAIN=mairie.exemple.fr

# PanneauPocket (optionnel)
NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL=

# Resend (bloc Contact)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@mairie-vac.fr
```

## Déploiement production (OVH Cloud VPS)

Architecture cible :

```txt
OVH Cloud VPS
└── Docker Compose
    ├── caddy     (reverse proxy — HTTPS automatique via Let's Encrypt)
    ├── app       (Next.js + Payload)
    ├── postgres  (PostgreSQL 18)
    └── backup    (pg_dump → OVH Object Storage toutes les 6h)
```

Commandes :

```bash
cp .env.example .env.prod
# remplir .env.prod
./prod.sh up     # build + démarrage
./prod.sh down   # arrêt
```

## OVH Object Storage / S3

Activer dans `.env.prod` les variables `S3_*` (médias) et `BACKUP_S3_*` (backups pg_dump).

## PanneauPocket

Deux options :

1. définir `NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL`,
2. ou créer un bloc `PanneauPocket` dans une page et remplir l'URL du widget.

## Notes RGAA

Conformité partielle A + AA :

- un seul H1 par page,
- liens explicites,
- focus visible,
- contraste suffisant,
- alt images,
- navigation clavier,
- formulaires avec labels,
- déclaration d'accessibilité sous `/accessibilite`.

## Philosophie du starter

Les menus et la majorité des pages sont administrables. Les contenus répétables restent dans des collections dédiées pour garder un back-office simple pour les agents.
