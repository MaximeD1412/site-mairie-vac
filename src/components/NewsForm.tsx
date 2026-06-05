'use client'

import { useActionState, useRef, useState } from 'react'
import type { NewsFormState } from '@/actions/news'
import type { News, Media } from '@/payload-types'
import { BlockEditor, type Block } from './BlockEditor'
import { PreviewModal, type PreviewData } from './PreviewModal'
import { slugify } from '@/lib/slugify'

interface Props {
  action: (prevState: NewsFormState, formData: FormData) => Promise<NewsFormState>
  news?: News
  deleteAction?: (formData: FormData) => Promise<NewsFormState>
}

function parseLayout(raw: unknown): Block[] {
  if (Array.isArray(raw)) return raw as Block[]
  return []
}

export function NewsForm({ action, news, deleteAction }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)
  const [slug, setSlug] = useState(news?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!news)
  const [layout, setLayout] = useState<Block[]>(parseLayout(news?.layout))
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const openPreview = () => {
    const form = formRef.current
    if (!form) return
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? ''
    setPreview({
      type: 'news',
      title: get('title'),
      summary: get('summary') || undefined,
      publishedAt: get('publishedAt') || undefined,
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
    news?.image && typeof news.image !== 'number' ? (news.image as Media) : null

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
            defaultValue={news?.title}
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
          <label className="block text-sm font-medium text-slate-700" htmlFor="summary">
            Résumé <span aria-hidden>*</span>
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            required
            defaultValue={news?.summary}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="image">
            Image de couverture{' '}
            {existingImage && (
              <span className="font-normal text-slate-500">(laisser vide pour conserver)</span>
            )}
          </label>
          {existingImage?.url && (
            <img
              src={existingImage.url}
              alt={existingImage.alt || news?.title || ''}
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
          <label className="block text-sm font-medium text-slate-700" htmlFor="publishedAt">
            Date de publication <span aria-hidden>*</span>
          </label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="date"
            required
            defaultValue={news?.publishedAt ? news.publishedAt.slice(0, 10) : undefined}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            defaultChecked={news?.featured ?? false}
            className="rounded border-slate-300"
          />
          <label className="text-sm font-medium text-slate-700" htmlFor="featured">
            Mettre en avant
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Contenu
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
            {isPending ? 'Enregistrement…' : news ? 'Modifier' : 'Créer'}
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
          action={deleteAction}
          onSubmit={(e) => {
            if (!confirm('Supprimer cette actualité définitivement ?')) e.preventDefault()
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
