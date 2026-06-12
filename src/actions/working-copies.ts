'use server'

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'

async function getCurrentUserId(): Promise<number | string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) return null
  const decoded = decodePayloadToken(token)
  return decoded?.id ?? null
}

export async function saveWorkingCopy(
  collection: 'events' | 'news',
  data: unknown,
  relatedId?: string,
): Promise<{ id: string } | { error: string }> {
  const userId = await getCurrentUserId()
  if (!userId) return { error: 'Non authentifié' }

  const payload = await getPayloadClient()

  const whereConditions: object[] = [
    { author: { equals: userId } },
    { collection: { equals: collection } },
  ]
  if (relatedId) {
    whereConditions.push({ relatedId: { equals: relatedId } })
  } else {
    whereConditions.push({ relatedId: { exists: false } })
  }

  const existing = await payload.find({
    collection: 'working-copies',
    where: { and: whereConditions },
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const updated = await payload.update({
      collection: 'working-copies',
      id: existing.docs[0].id,
      data: { data },
      overrideAccess: true,
    })
    return { id: String(updated.id) }
  }

  const created = await payload.create({
    collection: 'working-copies',
    data: {
      author: userId as number,
      collection,
      ...(relatedId && { relatedId }),
      data,
    } as any,
    overrideAccess: true,
  })
  return { id: String(created.id) }
}

export async function getWorkingCopy(
  collection: 'events' | 'news',
  relatedId: string,
): Promise<{ id: string; data: unknown; updatedAt: string } | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'working-copies',
    where: {
      and: [
        { author: { equals: userId } },
        { collection: { equals: collection } },
        { relatedId: { equals: relatedId } },
      ],
    },
    overrideAccess: true,
    limit: 1,
  })

  if (result.docs.length === 0) return null

  const doc = result.docs[0]
  return {
    id: String(doc.id),
    data: doc.data,
    updatedAt: doc.updatedAt,
  }
}

export async function deleteWorkingCopy(
  collection: 'events' | 'news',
  relatedId?: string,
): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) return

  const payload = await getPayloadClient()

  const whereConditions: object[] = [
    { author: { equals: userId } },
    { collection: { equals: collection } },
  ]
  if (relatedId) {
    whereConditions.push({ relatedId: { equals: relatedId } })
  } else {
    whereConditions.push({ relatedId: { exists: false } })
  }

  const existing = await payload.find({
    collection: 'working-copies',
    where: { and: whereConditions },
    overrideAccess: true,
  })

  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'working-copies',
      id: doc.id,
      overrideAccess: true,
    })
  }
}
