# Sauvegarde SQLite vers Cellar

Ce starter peut fonctionner en mode économique avec SQLite. Dans ce mode, la base active est un fichier local, par défaut :

```txt
./data/payload.db
```

Sur un hébergement applicatif, le filesystem local ne doit pas être considéré comme une sauvegarde durable. Le starter inclut donc un flow de sécurité :

```txt
Démarrage app
→ si ./data/payload.db existe : utilisation normale
→ sinon : restauration depuis Cellar backups/sqlite/latest.db

App en fonctionnement
→ Next.js + Payload utilisent SQLite localement
→ un backup cohérent est créé périodiquement
→ upload vers Cellar : backup daté + latest.db
```

## Scripts disponibles

```bash
npm run sqlite:restore
npm run sqlite:restore:force
npm run sqlite:backup
npm start
```

`npm start` lance :

1. `scripts/sqlite-restore.mjs`
2. Next.js en production
3. une sauvegarde périodique en tâche interne

## Variables d’environnement

```txt
DATABASE_URI=file:./data/payload.db

S3_BUCKET=commune-medias
S3_REGION=fr
S3_ENDPOINT=https://cellar-c2.services.clever-cloud.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

SQLITE_RESTORE_ON_START=true
SQLITE_BACKUP_ENABLED=true
SQLITE_BACKUP_PREFIX=backups/sqlite
SQLITE_BACKUP_KEEP=30
SQLITE_BACKUP_INTERVAL_MINUTES=360
SQLITE_BACKUP_FIRST_DELAY_MINUTES=10
```

## Cohérence du backup

Le script n’utilise pas un simple `cp`. Il ouvre la base avec `better-sqlite3` et utilise l’API SQLite Online Backup via :

```js
db.backup(tmpBackupPath)
```

Cela produit un snapshot plus sûr qu’une copie brute, notamment si SQLite utilise un journal WAL.

## Rotation

Par défaut :

```txt
SQLITE_BACKUP_KEEP=30
```

Le système garde les 30 derniers backups datés et supprime les plus anciens.

## Restauration manuelle

Pour forcer une restauration depuis `latest.db` :

```bash
npm run sqlite:restore:force
```

Attention : cette commande écrase la base locale existante.

## Test recommandé avant mise en production

1. Lancer le projet localement.
2. Créer quelques contenus dans Payload.
3. Exécuter :

```bash
npm run sqlite:backup
```

4. Supprimer temporairement `data/payload.db`.
5. Exécuter :

```bash
npm run sqlite:restore
```

6. Relancer le site et vérifier que les contenus sont revenus.

## Limites assumées

Cette stratégie est adaptée à une petite commune avec peu d’écritures.

À éviter si :

```txt
- plusieurs instances Node en parallèle
- nombreux agents connectés simultanément
- formulaires citoyens très sollicités
- besoin de haute disponibilité
```

Dans ces cas, migrer vers PostgreSQL managé.
