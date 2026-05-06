# Déploiement Clever Cloud

## Configuration économique

```txt
Runtime : Node.js nano
Base : SQLite fichier local + restore/backup Cellar
Médias : Cellar S3 compatible
```

## Variables à configurer

Reprendre `.env.example` dans l’interface Clever Cloud.

Variables minimales :

```txt
PAYLOAD_SECRET
NEXT_PUBLIC_SITE_URL
DATABASE_URI=file:./data/payload.db
S3_ENABLED=true
S3_BUCKET
S3_ENDPOINT
S3_REGION
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
SQLITE_RESTORE_ON_START=true
SQLITE_BACKUP_ENABLED=true
```

## Commandes

Le `package.json` utilise :

```bash
npm run build
npm start
```

`npm start` restaure SQLite si nécessaire puis lance Next.js avec backups périodiques.

## Important

Ne pas scaler horizontalement cette version SQLite.

Utiliser une seule instance Node. Si le projet nécessite plusieurs instances, migrer vers PostgreSQL.
