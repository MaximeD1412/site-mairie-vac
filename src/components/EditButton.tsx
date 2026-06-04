import Link from 'next/link'
import { cookies } from 'next/headers'
import { decodePayloadToken } from '@/lib/auth'

interface EditButtonProps {
  href: string
  label: string
}

export async function EditButton({ href, label }: EditButtonProps) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const decoded = token ? decodePayloadToken(token) : null
  const role = decoded?.role

  if (role !== 'admin' && role !== 'agent') return null

  return <Link href={href}>{label}</Link>
}
