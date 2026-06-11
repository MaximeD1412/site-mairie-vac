import Link from 'next/link'
import { FileText } from 'lucide-react'

interface DocumentFile {
  url?: string | null
}

interface DocumentItem {
  id: string
  title: string
  category?: string | null
  date?: string | null
  file?: DocumentFile | string | null
}

interface PublicationsSectionProps {
  documents: DocumentItem[]
  role?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  'bulletin-municipal': 'Bulletin municipal',
  'ptitmag': 'Ptitmag',
  'bepos': 'BEPOS',
  'pv-conseil': 'PV du conseil',
  'actes-administratifs': 'Actes admin.',
  'compte-rendu': 'Compte-rendu',
  'arrete': 'Arrêté',
  'formulaire': 'Formulaire',
  'autre': 'Autre',
}

export function PublicationsSection({ documents, role }: PublicationsSectionProps) {
  return (
    <section className="py-14 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-[25px] font-extrabold text-brand">
            Publications
            <span className="block w-10 h-1 bg-teal rounded mt-2" aria-hidden="true" />
          </h2>
          <div className="flex items-center gap-3">
            {(role === 'agent' || role === 'admin') && (
              <Link href="/documents/new" className="inline-flex items-center gap-1 text-[12px] font-semibold text-teal border border-teal rounded px-2 py-1 hover:bg-teal hover:text-white transition-colors no-underline">
                + Nouvelle publication
              </Link>
            )}
            <Link href="/documents" className="text-brand-mid text-[13px] font-semibold no-underline hover:text-teal">
              Toutes les publications →
            </Link>
          </div>
        </div>

        {documents.length === 0 ? (
          <p className="text-muted text-[13px]">Aucune publication disponible.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 list-none p-0 m-0">
            {documents.map((doc) => {
              const file = doc.file && typeof doc.file === 'object' ? doc.file : null
              const fileUrl = file?.url
              if (!fileUrl) return null
              return (
                <li key={doc.id}>
                  <a
                    href={fileUrl as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col rounded-xl overflow-hidden border border-border bg-white hover:border-brand-light hover:shadow-md transition-all no-underline"
                    aria-label={`Télécharger : ${doc.title}`}
                  >
                    <div className="h-[100px] bg-gradient-to-br from-[#1a3a6b] to-brand-mid flex items-center justify-center text-white" aria-hidden="true">
                      <FileText size={32} aria-hidden={true} />
                    </div>
                    <div className="p-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-teal-dark mb-1">
                        {doc.category ? (CATEGORY_LABELS[doc.category] ?? doc.category) : ''}
                      </div>
                      <strong className="block text-[12.5px] font-semibold text-text leading-snug">{doc.title}</strong>
                      {doc.date && (
                        <span className="block text-[11px] text-muted mt-1.5">
                          {new Date(doc.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
