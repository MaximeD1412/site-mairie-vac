import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decodePayloadToken } from '@/lib/auth'
import { createDocument } from '@/actions/documents'
import { DocumentForm } from '@/components/DocumentForm'

export default async function DocumentNewPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  if (decoded?.role !== 'admin' && decoded?.role !== 'agent') redirect('/connexion')

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Nouveau document</h1>
      <DocumentForm action={createDocument} />
    </main>
  )
}
