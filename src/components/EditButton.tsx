import Link from 'next/link'
import { cookies } from 'next/headers'
import { decodePayloadToken } from '@/lib/auth'

type Variant = 'primary' | 'secondary'

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-mid',
  secondary: 'border border-brand text-brand hover:bg-brand-pale',
}

interface EditButtonProps {
  href: string
  label: string
  variant?: Variant
}

export async function EditButton({ href, label, variant = 'primary' }: EditButtonProps) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  const role = decoded?.role

  if (role !== 'admin' && role !== 'agent') return null

  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors no-underline ${variantClass[variant]}`}
    >
      {label}
    </Link>
  )
}
