'use server'

import { Resend } from 'resend'
import { getPayloadClient } from '@/lib/payload'

const resend = new Resend(process.env.RESEND_API_KEY)

export type ContactState = { success: true } | { error: string } | null

export async function sendContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
  const nom = (formData.get('nom') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()

  if (!nom || !email || !message) {
    return { error: 'Tous les champs sont obligatoires.' }
  }

  const payload = await getPayloadClient()
  const info = await payload.findGlobal({ slug: 'mairie-info' })
  const to = info.email

  if (!to) {
    return { error: "Aucune adresse de destination configurée. Veuillez contacter l'administrateur." }
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@mairie-vac.fr'

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Message de contact de ${nom}`,
    text: `Nom : ${nom}\nEmail : ${email}\n\n${message}`,
    replyTo: email,
  })

  if (error) {
    return { error: "L'envoi a échoué. Veuillez réessayer ultérieurement." }
  }

  return { success: true }
}
