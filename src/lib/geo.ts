// Distance in km between two lat/lng points (haversine formula).
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Best-effort browser geolocation — resolves to null if denied/unavailable, never throws.
export function getBrowserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 },
    )
  })
}

// Reverse-geocode via OpenStreetMap's Nominatim — turns coordinates into a
// human-readable neighbourhood/city label. Best-effort, never throws.
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const a = data.address ?? {}
    const place = a.suburb || a.neighbourhood || a.village || a.town || a.city || a.county
    return place ? `${place}${a.postcode ? ', ' + a.postcode : ''}` : (data.display_name ?? null)
  } catch {
    return null
  }
}

// Forward-geocode via Nominatim — turns free-typed text ("Ras Al Khor, Dubai")
// into coordinates. This is what lets ANY typed location get pinned on the
// map, not just ones reached by dragging the pin or granting GPS access.
export async function geocodeText(query: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const q = query.trim()
  if (!q) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const hit = data?.[0]
    if (!hit) return null
    return { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), label: hit.display_name }
  } catch {
    return null
  }
}
