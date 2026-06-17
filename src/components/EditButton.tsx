import Link from 'next/link'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
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
  icon?: ReactNode
  fab?: boolean
}

export async function EditButton({ href, label, variant = 'primary', icon, fab = false }: EditButtonProps) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  const role = decoded?.role

  if (role !== 'admin' && role !== 'agent') return null

  const fabClass = fab
    ? 'fixed bottom-6 right-6 z-50 shadow-lg rounded-full px-5 py-3 gap-2'
    : 'rounded-lg px-4 py-2 gap-1.5'

  return (
    <Link
      href={href}
      className={`inline-flex items-center text-sm font-semibold transition-colors no-underline ${variantClass[variant]} ${fabClass}`}
    >
      {icon}
      {label}
    </Link>
  )
}
