import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapPin {
  lat: number
  lng: number
  label?: string
  amber?: boolean
  onClick?: () => void
}

function pinIcon(amber: boolean) {
  const color = amber ? '#F5A623' : '#111110'
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0Z" fill="${color}"/>
      <circle cx="14" cy="14" r="5.5" fill="white"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  })
}

export function MiniMap({
  pins,
  center,
  zoom = 13,
  interactive = false,
  draggableMarker = false,
  onDrag,
  className = '',
}: {
  pins: MapPin[]
  center: { lat: number; lng: number }
  zoom?: number
  interactive?: boolean
  draggableMarker?: boolean
  onDrag?: (lat: number, lng: number) => void
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const map = L.map(ref.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView([center.lat, center.lng], zoom)

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    pins.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: pinIcon(!!p.amber),
        draggable: draggableMarker,
      }).addTo(map)
      if (p.label) marker.bindTooltip(p.label)
      if (p.onClick) marker.on('click', p.onClick)
      if (draggableMarker && onDrag) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          onDrag(pos.lat, pos.lng)
        })
      }
      markersRef.current.push(marker)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, center.lat, center.lng, zoom])

  return <div ref={ref} className={className} />
}
