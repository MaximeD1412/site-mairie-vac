import 'dotenv/config'
import { getPayload } from 'payload'
import type { CollectionSlug } from 'payload'
import config from './payload.config'

if (process.env.NODE_ENV !== 'development') {
  console.error('[seed] Refused: NODE_ENV is not "development"')
  process.exit(1)
}

const payload = await getPayload({ config })

try {
  await seedAssociations(payload)
  await seedElectedOfficials(payload)
  await seedNews(payload)
  await seedEvents(payload)
  await seedPages(payload)
  await seedGlobals(payload)
  console.log('[seed] Done.')
} finally {
  await payload.db.destroy?.()

  process.exit(0)
}

function richText(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [{ type: 'text' as const, text, version: 1 as const }],
          version: 1 as const,
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1 as const,
    },
  }
}

async function seedCollection<T extends Record<string, unknown>>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
  items: T[],
  uniqueKey: keyof T,
) {
  let inserted = 0
  let skipped = 0

  for (const item of items) {
    const existing = await payload.find({
      collection,
      where: { [uniqueKey as string]: { equals: item[uniqueKey] } },
      overrideAccess: true,
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      skipped++
      continue
    }

    await payload.create({ collection, data: item as any, overrideAccess: true })
    inserted++
  }

  console.log(`[seed] ${collection}: ${inserted} inserted, ${skipped} skipped`)
}
