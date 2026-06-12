'use client'

import { Loader2 } from 'lucide-react'
import { useIsPending } from './NavigationContext'

export function NavigationOverlay() {
  const isPending = useIsPending()

  if (!isPending) return null

  return (
    <div
      role="status"
      aria-label="Chargement en cours"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30"
    >
      <Loader2 className="h-10 w-10 animate-spin text-white" aria-hidden />
    </div>
  )
}
