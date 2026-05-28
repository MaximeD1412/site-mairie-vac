'use client'

import { useState } from 'react'
import { RichTextBlock } from './RichTextBlock'

interface AccordionItem {
  title: string
  content?: unknown
}

export function AccordionBlock({ items }: { items?: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!items?.length) return null

  return (
    <section className="my-8">
      <dl className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
        {items.map((item, i) => {
          const isOpen = openIndex === i
          const panelId = `accordion-panel-${i}`
          const triggerId = `accordion-trigger-${i}`

          return (
            <div key={i}>
              <dt>
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-text hover:bg-brand-pale transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span>{item.title}</span>
                  <span
                    aria-hidden="true"
                    className={`ml-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ▾
                  </span>
                </button>
              </dt>
              <dd
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={`px-5 pb-4${isOpen ? '' : ' hidden'}`}
              >
                <RichTextBlock content={item.content as any} />
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
