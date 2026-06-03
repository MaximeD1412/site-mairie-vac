# Starter site communal — Next.js + Payload CMS

Starter pensé pour une petite commune : site vitrine moderne, back-office clair, contenus administrables, agenda, actualités, documents, associations et intégration PanneauPocket.

## Stack

- Next.js App Router
- Payload CMS intégré dans la même app
- SQLite au démarrage pour réduire le coût
- Cellar / S3 compatible pour les médias en production
- Tailwind CSS
- Clever Cloud Node nano recommandé

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
cp .env.example .env
npm install
npm run dev
```

Puis ouvrir :

```txt
http://localhost:3000/admin
```

Au premier lancement, Payload propose la création du premier utilisateur.

## Seed de démonstration

Pour pré-remplir la base avec des données fictives couvrant toutes les collections et tous les blocs CMS :

```bash
npm run seed
# ou
npm run seed:demo
```

Le seed est idempotent : il peut être relancé sans créer de doublons. Il ne fonctionne qu'en `NODE_ENV=development` et refuse de tourner en production.

Données insérées : associations, élus, actualités, catégories d'événements, événements, pages (avec blocs richText, quickLinks, collectionList, accordion, button, contact, map), navigation principale et footer, et globals (mairie-info, site-settings, homepage-settings).

> Les blocs `GalleryBlock` et `ImageBlock` nécessitent des médias importés manuellement et ne sont pas inclus dans le seed.

## Variables importantes

```env
PAYLOAD_SECRET=...
DATABASE_URI=file:./payload.db
S3_ENABLED=false
NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL=
```

## Production Clever Cloud économique

Architecture cible :

```txt
Clever Cloud Node nano
├── Next.js + Payload
├── SQLite fichier
└── Cellar pour images/PDF
```

Conditions à respecter :

1. Une seule instance Node tant que SQLite est utilisé.
2. Activer Cellar pour ne pas stocker les médias dans le filesystem applicatif.
3. Mettre en place une sauvegarde régulière du fichier SQLite.
4. Prévoir une migration vers PostgreSQL si le site devient plus utilisé ou plus métier.

## Cellar / S3

Activer dans `.env` :

```env
S3_ENABLED=true
S3_BUCKET=...
S3_REGION=fr
S3_ENDPOINT=https://cellar-c2.services.clever-cloud.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

## PanneauPocket

Deux options :

1. définir `NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL`,
2. ou créer un bloc `PanneauPocket` dans une page et remplir l’URL du widget.

## À compléter avant production

- Rendu propre du rich text Lexical au lieu du placeholder JSON.
- Pages détails `/actualites/[slug]` et `/agenda/[slug]`.
- Paramètres globaux du site : adresse, horaires, téléphone, réseaux sociaux.
- Déclaration d’accessibilité, mentions légales, politique de confidentialité.
- Redirections depuis les anciennes URLs Joomla.
- Sauvegardes SQLite.

## Notes RGAA

Base à respecter dès le début :

- un seul H1 par page,
- liens explicites,
- focus visible,
- contraste suffisant,
- alt images,
- navigation clavier,
- formulaires avec labels,
- pas de carrousel obligatoire,
- déclaration d’accessibilité.

## Philosophie du starter

Les menus et la majorité des pages sont administrables. Les contenus répétables restent dans des collections dédiées pour garder un back-office simple pour les agents.

## SQLite sécurisé + backups Cellar

Le starter inclut maintenant un flow complet pour utiliser SQLite en production légère :

```txt
./data/payload.db
→ backup périodique vers Cellar
→ restauration automatique au démarrage si la DB locale n'existe pas
```

Scripts utiles :

```bash
npm run sqlite:backup
npm run sqlite:restore
npm run sqlite:restore:force
npm start
```

En production, `npm start` exécute :

1. restauration depuis `backups/sqlite/latest.db` si `data/payload.db` n'existe pas ;
2. démarrage Next.js/Payload ;
3. sauvegarde périodique vers Cellar.

Documentation détaillée :

```txt
docs/sqlite-backup-cellar.md
docs/clever-cloud.md
```

> Important : cette stratégie est prévue pour une seule instance Node. Pour du multi-instance ou beaucoup d'écritures, passer sur PostgreSQL.
