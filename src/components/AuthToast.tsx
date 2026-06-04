'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function AuthToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('auth') === 'required') {
      toast.error('Vous devez être connecté pour accéder à cette page')
      router.replace('/')
    }
  }, [searchParams, router])

  return null
}
