'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import type { NewsFormState } from '@/actions/news'
import type { News, Media } from '@/payload-types'
import { BlockEditor, type Block } from './BlockEditor'
import { PreviewModal, type PreviewData } from './PreviewModal'
import { slugify } from '@/lib/slugify'
import { saveWorkingCopy } from '@/actions/working-copies'

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
  const [title, setTitle] = useState(news?.title ?? '')
  const [slug, setSlug] = useState(news?.slug ?? '')
  const [summary, setSummary] = useState(news?.summary ?? '')
  const [publishedAt, setPublishedAt] = useState(news?.publishedAt ? news.publishedAt.slice(0, 10) : '')
  const [featured, setFeatured] = useState(news?.featured ?? false)
  const [layout, setLayout] = useState<Block[]>(parseLayout(news?.layout))
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const formRef = useRef<HTMLFormElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const intentStatusRef = useRef<HTMLInputElement>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (state?.error) {
      errorRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
  }, [state])

  const formSnapshot = JSON.stringify({ title, slug, summary, publishedAt, featured, layout })

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(async () => {
      const relatedId = news ? String(news.id) : undefined
      await saveWorkingCopy('news', { title, slug, summary, publishedAt, featured, layout }, relatedId)
      setSavedAt(new Date())
    }, 5000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formSnapshot])

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [])

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
    setTitle(e.target.value)
    if (!news) setSlug(slugify(e.target.value))
  }

  const existingImage =
    news?.image && typeof news.image !== 'number' ? (news.image as Media) : null

  return (
    <div className="space-y-8">
      {preview && <PreviewModal data={preview} onClose={() => setPreview(null)} />}
      <form ref={formRef} action={formAction} className="space-y-6">
        {state?.error && (
          <p ref={errorRef} role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <input ref={intentStatusRef} type="hidden" name="_intentStatus" defaultValue="published" />

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="title">
            Titre <span aria-hidden>*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <input type="hidden" name="slug" value={slug} />

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="summary">
            Résumé <span aria-hidden>*</span>
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
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
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
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

        {savedAt && (
          <p className="text-xs text-slate-500">
            Brouillon personnel sauvegardé à{' '}
            {savedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            onClick={() => { if (intentStatusRef.current) intentStatusRef.current.value = 'draft' }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {isPending ? 'Enregistrement…' : 'Soumettre en brouillon'}
          </button>
          <button
            type="submit"
            disabled={isPending}
            onClick={() => { if (intentStatusRef.current) intentStatusRef.current.value = 'published' }}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-mid disabled:opacity-50"
          >
            {isPending ? 'Enregistrement…' : 'Publier'}
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
