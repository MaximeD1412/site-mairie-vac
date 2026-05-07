#!/usr/bin/env node
import 'dotenv/config'
import { spawn } from 'node:child_process'

function runNodeScript(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], { stdio: 'inherit', env: process.env })
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${script} exited with ${code}`)))
    child.on('error', reject)
  })
}

async function backupOnce() {
  try {
    await runNodeScript('scripts/sqlite-backup.mjs')
  } catch (error) {
    console.error('[start] Backup SQLite échoué, application conservée en ligne')
    console.error(error)
  }
}

async function main() {
  await runNodeScript('scripts/sqlite-restore.mjs')

  const intervalMinutes = Number(process.env.SQLITE_BACKUP_INTERVAL_MINUTES || '360')
  const firstBackupDelayMinutes = Number(process.env.SQLITE_BACKUP_FIRST_DELAY_MINUTES || '10')

  if (process.env.SQLITE_BACKUP_ENABLED !== 'false') {
    setTimeout(backupOnce, firstBackupDelayMinutes * 60 * 1000)
    setInterval(backupOnce, intervalMinutes * 60 * 1000)
  }

  const nextBin = process.platform === 'win32' ? 'node_modules/next/dist/bin/next' : 'node_modules/next/dist/bin/next'
  const app = spawn(process.execPath, [nextBin, 'start'], { stdio: 'inherit', env: process.env })

  app.on('exit', (code) => process.exit(code || 0))
  app.on('error', (error) => {
    console.error('[start] Échec du démarrage Next.js')
    console.error(error)
    process.exit(1)
  })
}

main().catch((error) => {
  console.error('[start] Échec du démarrage sécurisé')
  console.error(error)
  process.exit(1)
})
