// Google's plain iframe embed — no API key, no billing, works immediately.
export function GoogleMapEmbed({ query, className = '' }: { query: string; className?: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`

  return (
    <iframe
      src={src}
      className={className}
      style={{ border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Map"
    />
  )
}
