'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'

export type DocumentFormState = { error: string } | null

async function assertAgentOrAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/connexion')
  const decoded = decodePayloadToken(token)
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')
}

export async function createDocument(
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  await assertAgentOrAdmin()

  const title = (formData.get('title') as string)?.trim()
  const category = formData.get('category') as string
  const date = formData.get('date') as string | null
  const description = (formData.get('description') as string)?.trim()
  const fileInput = formData.get('file') as File | null

  if (!title || !category) return { error: 'Le titre et la catégorie sont obligatoires.' }
  if (!fileInput || fileInput.size === 0) return { error: 'Un fichier est obligatoire.' }

  const payload = await getPayloadClient()

  const buffer = Buffer.from(await fileInput.arrayBuffer())
  const media = await payload.create({
    collection: 'media',
    data: { alt: title },
    file: { data: buffer, mimetype: fileInput.type, name: fileInput.name, size: fileInput.size },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'documents',
    data: {
      title,
      file: media.id,
      category: category as any,
      date: date || undefined,
      description: description || undefined,
    },
    overrideAccess: true,
  })

  revalidatePath('/documents')
  redirect('/documents')
}

export async function updateDocument(
  id: number,
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  await assertAgentOrAdmin()

  const title = (formData.get('title') as string)?.trim()
  const category = formData.get('category') as string
  const date = formData.get('date') as string | null
  const description = (formData.get('description') as string)?.trim()
  const fileInput = formData.get('file') as File | null

  if (!title || !category) return { error: 'Le titre et la catégorie sont obligatoires.' }

  const payload = await getPayloadClient()

  const data: Record<string, unknown> = {
    title,
    category,
    date: date || null,
    description: description || null,
  }

  if (fileInput && fileInput.size > 0) {
    const buffer = Buffer.from(await fileInput.arrayBuffer())
    const media = await payload.create({
      collection: 'media',
      data: { alt: title },
      file: { data: buffer, mimetype: fileInput.type, name: fileInput.name, size: fileInput.size },
      overrideAccess: true,
    })
    data.file = media.id
  }

  await payload.update({
    collection: 'documents',
    id,
    data: data as any,
    overrideAccess: true,
  })

  revalidatePath('/documents')
  redirect('/documents')
}

export async function deleteDocument(
  id: number,
  _formData: FormData,
): Promise<DocumentFormState> {
  await assertAgentOrAdmin()
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'documents', id, overrideAccess: true })
  revalidatePath('/documents')
  redirect('/documents')
}
