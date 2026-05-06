#!/usr/bin/env node
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import Database from 'better-sqlite3'
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

function getEnv(name, fallback = undefined) {
  return process.env[name] || fallback
}

function resolveSqlitePath() {
  const uri = getEnv('DATABASE_URI', 'file:./data/payload.db')
  if (!uri.startsWith('file:')) {
    throw new Error(`DATABASE_URI doit commencer par file: pour SQLite. Reçu: ${uri}`)
  }
  return path.resolve(process.cwd(), uri.replace(/^file:/, ''))
}

function getS3Client() {
  return new S3Client({
    endpoint: getEnv('S3_ENDPOINT'),
    region: getEnv('S3_REGION', 'fr'),
    forcePathStyle: true,
    credentials: {
      accessKeyId: getEnv('S3_ACCESS_KEY_ID', ''),
      secretAccessKey: getEnv('S3_SECRET_ACCESS_KEY', ''),
    },
  })
}

function requireS3Config() {
  for (const key of ['S3_BUCKET', 'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY']) {
    if (!process.env[key]) throw new Error(`Variable manquante: ${key}`)
  }
}

async function uploadFile(client, bucket, key, filePath) {
  const body = await fs.readFile(filePath)
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: 'application/vnd.sqlite3',
  }))
}

async function rotateBackups(client, bucket, prefix, keep) {
  if (!keep || keep <= 0) return

  const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }))
  const backups = (result.Contents || [])
    .filter((item) => item.Key && /backup-.*\.db$/.test(item.Key))
    .sort((a, b) => new Date(b.LastModified || 0) - new Date(a.LastModified || 0))

  const toDelete = backups.slice(keep)
  for (const item of toDelete) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: item.Key }))
    console.log(`[sqlite-backup] Ancien backup supprimé: ${item.Key}`)
  }
}

async function main() {
  requireS3Config()

  const dbPath = resolveSqlitePath()
  const prefix = getEnv('SQLITE_BACKUP_PREFIX', 'backups/sqlite')
  const keep = Number(getEnv('SQLITE_BACKUP_KEEP', '30'))
  const bucket = getEnv('S3_BUCKET')

  await fs.access(dbPath)
  await fs.mkdir(path.resolve(process.cwd(), '.backups'), { recursive: true })

  const now = new Date()
  const stamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
  const tmpBackupPath = path.resolve(process.cwd(), `.backups/payload-${stamp}.db`)

  console.log(`[sqlite-backup] Création d'un snapshot cohérent depuis ${dbPath}`)
  const db = new Database(dbPath, { readonly: true, fileMustExist: true })
  await db.backup(tmpBackupPath)
  db.close()

  const client = getS3Client()
  const datedKey = `${prefix}/backup-${stamp}.db`
  const latestKey = `${prefix}/latest.db`

  console.log(`[sqlite-backup] Upload vers Cellar: ${datedKey}`)
  await uploadFile(client, bucket, datedKey, tmpBackupPath)

  console.log(`[sqlite-backup] Mise à jour du backup latest: ${latestKey}`)
  await uploadFile(client, bucket, latestKey, tmpBackupPath)

  await rotateBackups(client, bucket, `${prefix}/`, keep)
  await fs.rm(tmpBackupPath, { force: true })

  console.log('[sqlite-backup] Backup terminé')
}

main().catch((error) => {
  console.error('[sqlite-backup] Échec du backup')
  console.error(error)
  process.exit(1)
})
