'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminRelayPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const to = params.get('to')
    const back = params.get('back') ?? '/admin'
    if (to) window.open(to, '_blank', 'noopener,noreferrer')
    router.replace(back)
  }, [])

  return null
}
