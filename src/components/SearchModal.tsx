'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import { useNavigate } from './NavigationContext'

interface SearchResult {
  title: string
  type: 'Actualité' | 'Événement' | 'Page'
  date: string | null
  url: string
}

interface SearchModalProps {
  onClose: () => void
}

const badgeClass: Record<SearchResult['type'], string> = {
  Actualité: 'bg-blue-100 text-blue-700',
  Événement: 'bg-green-100 text-green-700',
  Page: 'bg-gray-100 text-gray-600',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function SearchModal({ onClose }: SearchModalProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setSearched('')
      return
    }
    setLoading(true)
    setSearched(q)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data: SearchResult[] = await res.json()
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleResultClick(url: string) {
    navigate(url)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-200 flex flex-col items-center bg-black/60 backdrop-blur-sm pt-24 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search size={18} className="text-gray-400 shrink-0" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Rechercher…"
            aria-label="Terme de recherche"
            className="flex-1 text-[15px] text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
          />
          {loading && <Loader2 size={16} className="text-gray-400 animate-spin shrink-0" aria-hidden />}
          <button
            onClick={onClose}
            aria-label="Fermer la recherche"
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
          >
            <X size={15} aria-hidden />
          </button>
        </div>

        {/* Results */}
        {searched.length >= 2 && !loading && (
          <div>
            {results.length === 0 ? (
              <p className="px-5 py-6 text-[14px] text-gray-500 text-center">
                Aucun résultat pour « {searched} »
              </p>
            ) : (
              <ul className="divide-y divide-gray-50 max-h-96 overflow-y-auto" role="listbox" aria-label="Résultats de recherche">
                {results.map((r, i) => (
                  <li key={i} role="option" aria-selected="false">
                    <button
                      onClick={() => handleResultClick(r.url)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeClass[r.type]}`}>
                        {r.type}
                      </span>
                      <span className="flex-1 text-[14px] text-gray-800 font-medium truncate">{r.title}</span>
                      {r.date && (
                        <span className="text-[12px] text-gray-400 shrink-0">{formatDate(r.date)}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
