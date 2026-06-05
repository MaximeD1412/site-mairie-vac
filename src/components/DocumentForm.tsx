'use client'

import { useActionState } from 'react'
import type { DocumentFormState } from '@/actions/documents'
import type { Document } from '@/payload-types'

const CATEGORIES: { label: string; value: Document['category'] }[] = [
  { label: 'Bulletin municipal', value: 'bulletin-municipal' },
  { label: 'Ptitmag', value: 'ptitmag' },
  { label: 'BEPOS', value: 'bepos' },
  { label: 'PV du conseil municipal', value: 'pv-conseil' },
  { label: 'Actes administratifs', value: 'actes-administratifs' },
  { label: 'Compte-rendu', value: 'compte-rendu' },
  { label: 'Arrêté', value: 'arrete' },
  { label: 'Formulaire', value: 'formulaire' },
  { label: 'Autre', value: 'autre' },
]

interface Props {
  action: (prevState: DocumentFormState, formData: FormData) => Promise<DocumentFormState>
  document?: Document
  deleteAction?: (formData: FormData) => Promise<DocumentFormState>
}

export function DocumentForm({ action, document, deleteAction }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="title">
            Titre <span aria-hidden>*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={document?.title}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="file">
            Fichier PDF{' '}
            <span className="font-normal text-slate-500">
              {document ? '(laisser vide pour conserver)' : <span aria-hidden>*</span>}
            </span>
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".pdf,application/pdf"
            required={!document}
            className="mt-1 block w-full text-sm text-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="category">
            Catégorie <span aria-hidden>*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={document?.category ?? ''}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="">— Choisir —</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="date">
            Date <span aria-hidden>*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={document?.date ? document.date.slice(0, 10) : undefined}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={document?.description ?? undefined}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-mid disabled:opacity-50"
        >
          {isPending ? 'Enregistrement…' : document ? 'Modifier' : 'Créer'}
        </button>
      </form>

      {deleteAction && (
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!confirm('Supprimer ce document définitivement ?')) e.preventDefault()
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Supprimer
          </button>
        </form>
      )}
    </div>
  )
}
