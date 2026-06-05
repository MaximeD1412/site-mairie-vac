export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { decodePayloadToken } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { updateDocument, deleteDocument } from '@/actions/documents'
import { DocumentForm } from '@/components/DocumentForm'
import type { Document } from '@/payload-types'

export default async function DocumentModifierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')

  const { id: idParam } = await params
  const id = parseInt(idParam, 10)
  if (isNaN(id)) notFound()

  const payload = await getPayloadClient()
  let document: Document
  try {
    document = (await payload.findByID({ collection: 'documents', id, depth: 0 })) as Document
  } catch {
    notFound()
  }

  const boundUpdate = updateDocument.bind(null, id)
  const boundDelete = deleteDocument.bind(null, id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Modifier le document</h1>
      <DocumentForm action={boundUpdate} document={document} deleteAction={boundDelete} />
    </main>
  )
}
