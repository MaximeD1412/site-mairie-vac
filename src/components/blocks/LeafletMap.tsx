'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon paths broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LeafletMapProps {
  lat: number
  lng: number
  label?: string
}

function RecenterOnChange({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng])
  }, [lat, lng, map])
  return null
}

export default function LeafletMap({ lat, lng, label }: LeafletMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        {label && <Popup>{label}</Popup>}
      </Marker>
      <RecenterOnChange lat={lat} lng={lng} />
    </MapContainer>
  )
}
