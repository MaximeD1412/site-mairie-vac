'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { PreviewBlocks } from './PreviewBlocks'

interface NewsPreviewData {
  type: 'news'
  title: string
  summary?: string
  publishedAt?: string
  image?: { url: string; alt: string } | null
  layout: any[]
}

interface EventPreviewData {
  type: 'event'
  title: string
  startDate: string
  endDate?: string
  location?: string
  category?: { name: string; color?: string | null } | null
  organizer?: { name: string } | null
  image?: { url: string; alt: string } | null
  layout: any[]
}

export type PreviewData = NewsPreviewData | EventPreviewData

interface PreviewModalProps {
  data: PreviewData
  onClose: () => void
}

export function PreviewModal({ data, onClose }: PreviewModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Prévisualisation"
      className="fixed inset-0 z-200 h-dvh bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute inset-3 sm:inset-6 flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre de contrôle */}
        <div className="shrink-0 flex items-center justify-between bg-slate-800 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Prévisualisation
            </span>
            <span className="hidden sm:inline text-xs text-slate-500">· Échap pour fermer</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la prévisualisation"
            className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-600 focus-visible:outline-2 focus-visible:outline-white transition-colors"
          >
            <X size={14} />
            Fermer
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="mx-auto max-w-5xl bg-white min-h-full shadow-sm">
            {data.type === 'news' ? <NewsPreview {...data} /> : <EventPreview {...data} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewsPreview({ title, summary, publishedAt, image, layout }: NewsPreviewData) {
  return (
    <article>
      {image?.url && (
        <div className="relative h-64 w-full overflow-hidden bg-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <span className="text-sm text-brand-mid">← Retour aux actualités</span>
        <div className="mt-6 flex items-center gap-3">
          <span className="inline-block bg-teal-light text-teal-dark rounded px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide">
            Actualité
          </span>
          {publishedAt && (
            <span className="text-sm text-muted">
              {new Date(publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-text leading-tight">{title || '(Sans titre)'}</h1>
        {summary && <p className="mt-3 text-lg text-muted">{summary}</p>}
        {layout?.length > 0 && (
          <>
            <hr className="my-6 border-border" />
            <PreviewBlocks blocks={layout} />
          </>
        )}
      </div>
    </article>
  )
}

const DAY_FMT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' }
const TIME_FMT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }
const toParisDateStr = (d: Date) => d.toLocaleString('sv-SE', { timeZone: 'Europe/Paris' }).slice(0, 10)

function formatEventDate(startISO: string, endISO?: string): string {
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : null
  const startDay = start.toLocaleDateString('fr-FR', DAY_FMT)
  const startTime = start.toLocaleTimeString('fr-FR', TIME_FMT)
  if (!end) return `${startDay} · ${startTime}`
  if (toParisDateStr(start) === toParisDateStr(end))
    return `${startDay} · ${startTime} – ${end.toLocaleTimeString('fr-FR', TIME_FMT)}`
  return `Du ${startDay} au ${end.toLocaleDateString('fr-FR', DAY_FMT)}`
}

const DEFAULT_COLOR = '#3B82F6'

function EventPreview({ title, startDate, endDate, location, category, organizer, image, layout }: EventPreviewData) {
  const color = category?.color ?? DEFAULT_COLOR
  return (
    <main>
      {image?.url && (
        <div className="relative h-64 w-full overflow-hidden bg-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.alt ?? title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <span className="text-sm text-brand-mid">← Retour à l&apos;agenda</span>

        {category?.name && (
          <div className="mt-6">
            <span
              className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {category.name}
            </span>
          </div>
        )}

        <h1 className="mt-3 text-3xl font-extrabold text-text leading-tight">{title || '(Sans titre)'}</h1>

        <div className="mt-6 rounded-xl border border-border bg-white px-5 py-4 flex flex-col gap-2 text-[14px] text-text">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">📅</span>
            <span>{formatEventDate(startDate, endDate)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <span aria-hidden="true">📍</span>
              <span>{location}</span>
            </div>
          )}
          {organizer?.name && (
            <div className="flex items-center gap-2">
              <span aria-hidden="true">👤</span>
              <span>{organizer.name}</span>
            </div>
          )}
        </div>

        <PreviewBlocks blocks={layout} />
      </div>
    </main>
  )
}
