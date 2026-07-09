import { useId } from 'react'

export function RallyIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  const maskId = useId()

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <mask id={maskId}>
          <rect width="64" height="64" fill="white" />
          <rect x="23" y="23" width="18" height="18" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <circle cx="32" cy="18" r="14" fill="currentColor" />
        <circle cx="46" cy="32" r="14" fill="currentColor" />
        <circle cx="32" cy="46" r="14" fill="currentColor" />
        <circle cx="18" cy="32" r="14" fill="currentColor" />
      </g>
    </svg>
  )
}

export function RallyLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RallyIcon size={28} />
      <span style={{ fontFamily: 'Circular, sans-serif', fontSize: 22, fontWeight: 400, letterSpacing: '-0.3px' }}>
        Rally
      </span>
    </div>
  )
}
