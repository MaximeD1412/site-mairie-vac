'use client'

import { useActionState, useRef, useState } from 'react'
import type { EventFormState } from '@/actions/events'
import type { Event, EventCategory, Association, Media } from '@/payload-types'
import { BlockEditor, type Block } from './BlockEditor'
import { PreviewModal, type PreviewData } from './PreviewModal'
import { slugify } from '@/lib/slugify'

interface Props {
  action: (prevState: EventFormState, formData: FormData) => Promise<EventFormState>
  event?: Event
  deleteAction?: (formData: FormData) => Promise<EventFormState>
  categories: EventCategory[]
  associations: Association[]
}

function parseLayout(raw: unknown): Block[] {
  if (Array.isArray(raw)) return raw as Block[]
  return []
}

export function EventForm({ action, event, deleteAction, categories, associations }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)
  const [slug, setSlug] = useState(event?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!event)
  const [layout, setLayout] = useState<Block[]>(parseLayout(event?.layout))
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [startDate, setStartDate] = useState(event?.startDate ? event.startDate.slice(0, 16) : '')
  const [endDate, setEndDate] = useState(event?.endDate ? event.endDate.slice(0, 16) : '')
  const formRef = useRef<HTMLFormElement>(null)

  const endDateError =
    endDate && startDate && new Date(endDate) <= new Date(startDate)
      ? 'La date de fin doit être postérieure à la date de début.'
      : null

  const openPreview = () => {
    const form = formRef.current
    if (!form) return
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? ''
    const catId = get('category')
    const orgId = get('organizer')
    const cat = categories.find((c) => String(c.id) === catId)
    const org = associations.find((a) => String(a.id) === orgId)
    setPreview({
      type: 'event',
      title: get('title'),
      startDate: get('startDate') || new Date().toISOString(),
      endDate: get('endDate') || undefined,
      location: get('location') || undefined,
      category: cat ? { name: cat.name ?? '', color: cat.color ?? null } : null,
      organizer: org ? { name: org.name ?? '' } : null,
      image: existingImage?.url ? { url: existingImage.url, alt: existingImage.alt || '' } : null,
      layout,
    })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugTouched) setSlug(slugify(e.target.value))
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value)
    setSlugTouched(true)
  }

  const existingImage =
    event?.image && typeof event.image !== 'number' ? (event.image as Media) : null

  const categoryId =
    event?.category && typeof event.category === 'object'
      ? String((event.category as EventCategory).id)
      : event?.category
        ? String(event.category)
        : ''

  const organizerId =
    event?.organizer && typeof event.organizer === 'object'
      ? String((event.organizer as Association).id)
      : event?.organizer
        ? String(event.organizer)
        : ''

  return (
    <div className="space-y-8">
      {preview && <PreviewModal data={preview} onClose={() => setPreview(null)} />}
      <form ref={formRef} action={formAction} className="space-y-6">
        {state?.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
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
            defaultValue={event?.title}
            onChange={handleTitleChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="slug">
            Slug <span aria-hidden>*</span>
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={slug}
            onChange={handleSlugChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="startDate">
            Date et heure de début <span aria-hidden>*</span>
          </label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="endDate">
            Date et heure de fin
          </label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          {endDateError && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {endDateError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="location">
            Lieu
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={event?.location ?? undefined}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="category">
            Catégorie
          </label>
          <select
            id="category"
            name="category"
            defaultValue={categoryId}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="">— Aucune catégorie —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="organizer">
            Organisateur (association)
          </label>
          <select
            id="organizer"
            name="organizer"
            defaultValue={organizerId}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="">— Événement municipal —</option>
            {associations.map((asso) => (
              <option key={asso.id} value={String(asso.id)}>
                {asso.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="image">
            Image{' '}
            {existingImage && (
              <span className="font-normal text-slate-500">(laisser vide pour conserver)</span>
            )}
          </label>
          {existingImage?.url && (
            <img
              src={existingImage.url}
              alt={existingImage.alt || event?.title || ''}
              className="mt-1 h-24 w-auto rounded"
            />
          )}
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <input type="hidden" name="layout" value={JSON.stringify(layout)} />
          <BlockEditor value={layout} onChange={setLayout} />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-mid disabled:opacity-50"
          >
            {isPending ? 'Enregistrement…' : event ? 'Modifier' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={openPreview}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted hover:border-brand hover:text-brand"
          >
            Prévisualiser
          </button>
        </div>
      </form>

      {deleteAction && (
        <form
          action={async (formData) => { await deleteAction(formData) }}
          onSubmit={(e) => {
            if (!confirm('Supprimer cet événement définitivement ?')) e.preventDefault()
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
