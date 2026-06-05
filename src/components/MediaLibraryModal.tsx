'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Upload } from 'lucide-react'

interface MediaDoc {
  id: string
  url: string
  alt?: string
  filename?: string
  mimeType?: string
}

interface MediaLibraryModalProps {
  onSelect: (url: string, alt: string) => void
  onClose: () => void
}

export function MediaLibraryModal({ onSelect, onClose }: MediaLibraryModalProps) {
  const [docs, setDocs] = useState<MediaDoc[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleId = 'media-library-title'

  useEffect(() => {
    fetch('/api/media?where[mimeType][contains]=image&limit=100')
      .then((r) => r.json())
      .then((data) => setDocs(data.docs ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const body = new FormData()
    body.append('file', file)
    try {
      const res = await fetch('/api/media', { method: 'POST', body })
      if (res.ok) {
        const { doc } = await res.json()
        onSelect(doc.url, doc.alt ?? doc.filename ?? file.name)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 id={titleId} className="font-semibold text-base">
            Médiathèque
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-gray-100">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Uploader une image"
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-light)] transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]"
          >
            <Upload size={14} />
            {uploading ? 'Envoi…' : 'Uploader'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        <div className="overflow-y-auto p-4 grid grid-cols-3 gap-3">
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelect(doc.url, doc.alt ?? doc.filename ?? '')}
              className="relative aspect-square rounded overflow-hidden border-2 border-transparent hover:border-[var(--color-brand)] focus-visible:outline-2 focus-visible:outline-[var(--color-teal)] transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.url}
                alt={doc.alt ?? doc.filename ?? ''}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
