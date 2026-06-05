'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { decodePayloadToken } from '@/lib/auth'

export type NewsFormState = { error: string } | null

async function assertAgentOrAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/connexion')
  const decoded = decodePayloadToken(token)
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')
}

export async function createNews(
  _prevState: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  await assertAgentOrAdmin()

  const title = (formData.get('title') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const summary = (formData.get('summary') as string)?.trim()
  const publishedAt = formData.get('publishedAt') as string
  const featured = formData.get('featured') === 'on'
  const content = (formData.get('content') as string) || ''
  const imageFile = formData.get('image') as File | null

  if (!title || !slug || !summary || !publishedAt) {
    return { error: 'Le titre, le slug, le résumé et la date sont obligatoires.' }
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
    collection: 'news',
    data: {
      title,
      slug,
      summary,
      publishedAt,
      featured,
      content: content || null,
      _status: 'published',
      ...(imageId !== undefined && { image: imageId }),
    } as any,
    overrideAccess: true,
  })

  revalidatePath('/actualites')
  redirect(`/actualites/${slug}`)
}

export async function updateNews(
  id: number,
  _prevState: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  await assertAgentOrAdmin()

  const title = (formData.get('title') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const summary = (formData.get('summary') as string)?.trim()
  const publishedAt = formData.get('publishedAt') as string
  const featured = formData.get('featured') === 'on'
  const content = (formData.get('content') as string) || ''
  const imageFile = formData.get('image') as File | null

  if (!title || !slug || !summary || !publishedAt) {
    return { error: 'Le titre, le slug, le résumé et la date sont obligatoires.' }
  }

  const payload = await getPayloadClient()

  const data: Record<string, unknown> = {
    title,
    slug,
    summary,
    publishedAt,
    featured,
    content: content || null,
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
    collection: 'news',
    id,
    data: data as any,
    overrideAccess: true,
  })

  revalidatePath('/actualites')
  revalidatePath(`/actualites/${slug}`)
  redirect(`/actualites/${slug}`)
}

export async function deleteNews(
  id: number,
  _formData: FormData,
): Promise<NewsFormState> {
  await assertAgentOrAdmin()
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'news', id, overrideAccess: true })
  revalidatePath('/actualites')
  redirect('/actualites')
}
