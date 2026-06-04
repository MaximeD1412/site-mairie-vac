'use client'

import { useEffect, useState } from 'react'
import { X, FileText, Film, File } from 'lucide-react'

interface DocumentFile {
  url?: string | null
  mimeType?: string | null
  filename?: string | null
}

interface DocumentItem {
  id: number
  title: string
  category: string
  file: DocumentFile
}

export type DocumentInsertMode =
  | { type: 'link'; href: string; label: string }
  | { type: 'pdf-viewer'; src: string; title: string }
  | { type: 'video'; src: string; mimeType: string }

interface DocumentLibraryModalProps {
  onInsert: (mode: DocumentInsertMode) => void
  onClose: () => void
}

function FileIcon({ mimeType }: { mimeType?: string | null }) {
  if (mimeType === 'application/pdf') return <FileText size={14} />
  if (mimeType?.startsWith('video/')) return <Film size={14} />
  return <File size={14} />
}

export function DocumentLibraryModal({ onInsert, onClose }: DocumentLibraryModalProps) {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [selected, setSelected] = useState<DocumentItem | null>(null)
  const [linkLabel, setLinkLabel] = useState('')
  const titleId = 'doc-library-title'

  useEffect(() => {
    fetch('/api/documents?depth=1&limit=100')
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

  const handleSelectDoc = (doc: DocumentItem) => {
    setSelected(doc)
    setLinkLabel(doc.title)
  }

  const isPdf = selected?.file.mimeType === 'application/pdf'
  const isVideo = selected?.file.mimeType?.startsWith('video/')

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
            Insérer un document
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

        <div className="overflow-y-auto flex-1 p-4">
          {!selected ? (
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectDoc(doc)}
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:border-[var(--color-brand)] hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FileIcon mimeType={doc.file.mimeType} />
                    <span className="flex-1 font-medium text-sm">{doc.title}</span>
                    <span className="text-xs text-gray-500">{doc.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Retour à la liste"
                className="text-sm text-[var(--color-brand)] hover:underline"
              >
                ← Retour
              </button>
              <p className="font-medium">{selected.title}</p>

              <div className="space-y-3">
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium">Lien texte</p>
                  <input
                    type="text"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    placeholder="Texte du lien"
                    aria-label="Texte du lien"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      selected.file.url &&
                      onInsert({ type: 'link', href: selected.file.url, label: linkLabel || selected.title })
                    }
                    disabled={!linkLabel.trim()}
                    className="px-3 py-1.5 text-sm bg-[var(--color-brand)] text-white rounded hover:bg-[var(--color-brand-light)] disabled:opacity-60 transition-colors"
                  >
                    Insérer le lien
                  </button>
                </div>

                {isPdf && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Afficher en viewer</p>
                    <button
                      type="button"
                      onClick={() =>
                        selected.file.url &&
                        onInsert({ type: 'pdf-viewer', src: selected.file.url, title: selected.title })
                      }
                      className="px-3 py-1.5 text-sm bg-[var(--color-brand)] text-white rounded hover:bg-[var(--color-brand-light)] transition-colors"
                    >
                      Insérer le viewer PDF
                    </button>
                  </div>
                )}

                {isVideo && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Lecteur vidéo inline</p>
                    <button
                      type="button"
                      onClick={() =>
                        selected.file.url &&
                        onInsert({
                          type: 'video',
                          src: selected.file.url,
                          mimeType: selected.file.mimeType ?? 'video/mp4',
                        })
                      }
                      className="px-3 py-1.5 text-sm bg-[var(--color-brand)] text-white rounded hover:bg-[var(--color-brand-light)] transition-colors"
                    >
                      Insérer le lecteur vidéo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
