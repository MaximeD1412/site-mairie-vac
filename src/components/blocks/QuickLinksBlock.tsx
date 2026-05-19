import Link from 'next/link'

interface QuickLink {
  label: string
  url: string
  description?: string | null
}

export function QuickLinksBlock({ links }: { links?: QuickLink[] }) {
  if (!links?.length) return null
  return (
    <section className="my-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {links.map((link, i) => (
        <Link
          key={i}
          href={link.url}
          className="rounded-2xl bg-brand-pale border border-brand-light/40 p-5 no-underline hover:shadow-md hover:border-brand-light transition-all group"
        >
          <strong className="text-brand group-hover:text-brand-mid text-[14px] font-semibold">
            {link.label}
          </strong>
          {link.description && (
            <p className="mt-1.5 text-sm text-muted">{link.description}</p>
          )}
        </Link>
      ))}
    </section>
  )
}
