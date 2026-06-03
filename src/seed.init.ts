// =============================================================
// SEED D'INITIALISATION PRODUCTION — structure minimale, sans données fictives.
// À exécuter une seule fois lors de la mise en production initiale.
// Refuse de tourner si des données existent déjà en base.
// Variables d'environnement requises : SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
// =============================================================
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { runSeedInit } from './seed.init.lib'

const payload = await getPayload({ config })

try {
  await runSeedInit(payload)
} catch (err) {
  console.error('[seed:init] Error:', err)
  process.exitCode = 1
} finally {
  await payload.db.destroy?.()
}
