'use client'

import dynamic from 'next/dynamic'

interface MapBlockProps {
  title?: string | null
  address?: string | null
  lat: number
  lng: number
}

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

export function MapBlock({ title, address, lat, lng }: MapBlockProps) {
  return (
    <div className="my-8">
      {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
      {address && <p className="text-sm text-muted mb-3">{address}</p>}
      <LeafletMap lat={lat} lng={lng} label={address ?? title ?? undefined} />
    </div>
  )
}
