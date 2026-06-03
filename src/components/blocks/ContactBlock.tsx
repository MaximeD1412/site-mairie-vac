'use client'

import { useActionState } from 'react'
import { sendContact } from '@/actions/sendContact'

export function ContactBlock({ title }: { title?: string | null }) {
  const [state, formAction, isPending] = useActionState(sendContact, null)

  return (
    <section className="my-8 rounded-2xl border border-brand-light/40 bg-brand-pale p-8">
      {title && <h2 className="mb-6 text-2xl font-bold text-brand">{title}</h2>}

      {state && 'success' in state ? (
        <p role="status" className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-800">
          Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.
        </p>
      ) : (
        <form action={formAction} noValidate>
          {state && 'error' in state && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800">
              {state.error}
            </p>
          )}

          <div className="mb-4">
            <label htmlFor="contact-nom" className="mb-1 block text-sm font-medium text-gray-700">
              Nom <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-nom"
              name="nom"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-gray-700">
              Message <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-mid disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Envoi en cours…' : 'Envoyer le message'}
          </button>

          <p className="mt-3 text-xs text-muted">
            Vos données sont utilisées uniquement pour traiter votre demande.
          </p>
        </form>
      )}
    </section>
  )
}
