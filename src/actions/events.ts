'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'

export type EventFormState = { error: string } | null

async function assertAgentOrAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/connexion')
  const decoded = decodePayloadToken(token)
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')
}

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await assertAgentOrAdmin()

  const title = (formData.get('title') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const startDate = formData.get('startDate') as string
  const endDate = (formData.get('endDate') as string) || null
  const location = (formData.get('location') as string)?.trim() || null
  const categoryRaw = formData.get('category') as string
  const organizerRaw = formData.get('organizer') as string
  const layoutJson = (formData.get('layout') as string) || '[]'
  const imageFile = formData.get('image') as File | null

  if (!title || !slug || !startDate) {
    return { error: 'Le titre, le slug et la date de début sont obligatoires.' }
  }

  if (endDate && new Date(endDate) <= new Date(startDate)) {
    return { error: 'La date de fin doit être postérieure à la date de début.' }
  }

  const payload = await getPayloadClient()

  let imageId: number | undefined
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const media = await payload.create({
      collection: 'media',
      data: { alt: title },
      file: { data: buffer, mimetype: imageFile.type, name: imageFile.name, size: imageFile.size },
      overrideAccess: true,
    })
    imageId = media.id
  }

  await payload.create({
    collection: 'events',
    data: {
      title,
      slug,
      startDate,
      ...(endDate && { endDate }),
      ...(location && { location }),
      ...(categoryRaw && { category: Number(categoryRaw) }),
      ...(organizerRaw && { organizer: Number(organizerRaw) }),
      layout: JSON.parse(layoutJson),
      _status: 'published',
      ...(imageId !== undefined && { image: imageId }),
    } as any,
    overrideAccess: true,
  })

  revalidatePath('/agenda')
  redirect(`/agenda/${slug}`)
}

export async function updateEvent(
  id: number,
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await assertAgentOrAdmin()

  const title = (formData.get('title') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const startDate = formData.get('startDate') as string
  const endDate = (formData.get('endDate') as string) || null
  const location = (formData.get('location') as string)?.trim() || null
  const categoryRaw = formData.get('category') as string
  const organizerRaw = formData.get('organizer') as string
  const layoutJson = (formData.get('layout') as string) || '[]'
  const imageFile = formData.get('image') as File | null

  if (!title || !slug || !startDate) {
    return { error: 'Le titre, le slug et la date de début sont obligatoires.' }
  }

  if (endDate && new Date(endDate) <= new Date(startDate)) {
    return { error: 'La date de fin doit être postérieure à la date de début.' }
  }

  const payload = await getPayloadClient()

  const data: Record<string, unknown> = {
    title,
    slug,
    startDate,
    endDate,
    location,
    category: categoryRaw ? Number(categoryRaw) : null,
    organizer: organizerRaw ? Number(organizerRaw) : null,
    layout: JSON.parse(layoutJson),
  }

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const media = await payload.create({
      collection: 'media',
      data: { alt: title },
      file: { data: buffer, mimetype: imageFile.type, name: imageFile.name, size: imageFile.size },
      overrideAccess: true,
    })
    data.image = media.id
  }

  await payload.update({
    collection: 'events',
    id,
    data: data as any,
    overrideAccess: true,
  })

  revalidatePath('/agenda')
  revalidatePath(`/agenda/${slug}`)
  redirect(`/agenda/${slug}`)
}

export async function deleteEvent(
  id: number,
  _formData: FormData,
): Promise<EventFormState> {
  await assertAgentOrAdmin()
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'events', id, overrideAccess: true })
  revalidatePath('/agenda')
  redirect('/agenda')
}
