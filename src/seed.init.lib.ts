import type { Payload } from 'payload'

export async function runSeedInit(payload: Payload): Promise<void> {
  const [pagesResult, navResult, usersResult] = await Promise.all([
    payload.find({ collection: 'pages', limit: 1, overrideAccess: true }),
    payload.find({ collection: 'navigation', limit: 1, overrideAccess: true }),
    payload.find({ collection: 'users', limit: 1, overrideAccess: true }),
  ])

  if (pagesResult.totalDocs > 0 || navResult.totalDocs > 0 || usersResult.totalDocs > 0) {
    console.error('[seed:init] Refused: database already has data. Use --force to skip this check.')
    process.exit(1)
  }

  await payload.updateGlobal({ slug: 'mairie-info', data: {}, overrideAccess: true })
  await payload.updateGlobal({ slug: 'site-settings', data: {}, overrideAccess: true })
  await payload.updateGlobal({ slug: 'homepage-settings', data: {}, overrideAccess: true })

  await payload.create({
    collection: 'navigation',
    data: { name: 'Menu principal', location: 'main', items: [] },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'navigation',
    data: { name: 'Menu footer', location: 'footer', items: [] },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'pages',
    data: { title: 'Accueil', slug: '/', layout: [] },
    overrideAccess: true,
  })

  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    throw new Error('[seed:init] Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD env vars')
  }
  await payload.create({
    collection: 'users',
    data: { email: adminEmail, password: adminPassword, role: 'admin' },
    overrideAccess: true,
  })

  console.log('[seed:init] Done.')
}
