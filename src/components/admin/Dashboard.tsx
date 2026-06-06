import { getPayloadClient } from '@/lib/payload'

const SHORTCUTS = [
  { label: 'Pages', href: '/admin/collections/pages', emoji: '📄' },
  { label: 'Navigation', href: '/admin/globals/navigation', emoji: '🔗' },
  { label: 'Élus', href: '/admin/collections/elected-officials', emoji: '👤' },
  { label: 'Associations', href: '/admin/collections/associations', emoji: '🤝' },
  { label: 'Actualités', href: '/admin/collections/news', emoji: '📰' },
  { label: 'Agenda', href: '/admin/collections/events', emoji: '📅' },
  { label: 'Documents', href: '/admin/collections/documents', emoji: '📁' },
]

export default async function AdminDashboard() {
  let counters: { label: string; count: number | null; href: string }[] = [
    { label: 'Actualités publiées', count: null, href: '/admin/collections/news' },
    { label: 'Événements publiés', count: null, href: '/admin/collections/events' },
    { label: 'Documents', count: null, href: '/admin/collections/documents' },
  ]

  try {
    const payload = await getPayloadClient()
    const [newsCount, eventsCount, documentsCount] = await Promise.all([
      payload.count({ collection: 'news', overrideAccess: true, where: { _status: { equals: 'published' } } }),
      payload.count({ collection: 'events', overrideAccess: true, where: { _status: { equals: 'published' } } }),
      payload.count({ collection: 'documents', overrideAccess: true }),
    ])
    counters = [
      { label: 'Actualités publiées', count: newsCount.totalDocs, href: '/admin/collections/news' },
      { label: 'Événements publiés', count: eventsCount.totalDocs, href: '/admin/collections/events' },
      { label: 'Documents', count: documentsCount.totalDocs, href: '/admin/collections/documents' },
    ]
  } catch {
    // DB unavailable — dashboard still renders without counters
  }

  return (
    <div style={{ padding: '40px 32px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="40" height="40" rx="8" fill="#1a61ab" />
          <text x="20" y="27" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">LVC</text>
        </svg>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--theme-elevation-800)' }}>
            La Ville-aux-Clercs
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--theme-elevation-500)', marginTop: '2px' }}>
            Bienvenue dans l'espace d'administration du site municipal.
          </p>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--theme-elevation-150)', margin: '28px 0' }} />

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--theme-elevation-500)', margin: '0 0 16px' }}>
          Accès rapide
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {SHORTCUTS.map(({ label, href, emoji }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '20px 12px',
                borderRadius: '10px',
                border: '1px solid var(--theme-elevation-150)',
                background: 'var(--theme-elevation-0)',
                textDecoration: 'none',
                color: 'var(--theme-elevation-800)',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span style={{ fontSize: '22px', lineHeight: 1 }}>{emoji}</span>
              {label}
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--theme-elevation-500)', margin: '0 0 16px' }}>
          Contenus publiés
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {counters.map(({ label, count, href }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '20px 24px',
                borderRadius: '10px',
                border: '1px solid var(--theme-elevation-150)',
                background: 'var(--theme-elevation-0)',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a61ab', lineHeight: 1 }}>
                {count ?? '—'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--theme-elevation-500)', marginTop: '6px' }}>
                {label}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
