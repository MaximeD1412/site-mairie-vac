#!/usr/bin/env node
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

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

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const dbPath = resolveSqlitePath()
  const shouldRestore = getEnv('SQLITE_RESTORE_ON_START', 'true') === 'true'
  const forceRestore = process.argv.includes('--force')

  if (!shouldRestore && !forceRestore) {
    console.log('[sqlite-restore] Restauration désactivée')
    return
  }

  if (!forceRestore && await fileExists(dbPath)) {
    console.log(`[sqlite-restore] DB déjà présente: ${dbPath}`)
    return
  }

  for (const key of ['S3_BUCKET', 'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY']) {
    if (!process.env[key]) {
      console.log(`[sqlite-restore] ${key} manquante: aucun restore possible, Payload créera une DB vide si nécessaire`)
      return
    }
  }

  const bucket = getEnv('S3_BUCKET')
  const prefix = getEnv('SQLITE_BACKUP_PREFIX', 'backups/sqlite')
  const latestKey = `${prefix}/latest.db`

  console.log(`[sqlite-restore] Téléchargement depuis Cellar: ${latestKey}`)
  const client = getS3Client()

  try {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: latestKey }))
    const body = await streamToBuffer(result.Body)
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    await fs.writeFile(dbPath, body)
    console.log(`[sqlite-restore] DB restaurée: ${dbPath}`)
  } catch (error) {
    if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
      console.log('[sqlite-restore] Aucun backup latest trouvé: Payload créera une DB vide')
      return
    }
    throw error
  }
}

main().catch((error) => {
  console.error('[sqlite-restore] Échec de la restauration')
  console.error(error)
  process.exit(1)
})
