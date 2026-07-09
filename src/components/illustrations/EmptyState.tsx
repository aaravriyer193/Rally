type Variant = 'tasks' | 'pros' | 'certificates' | 'reviews' | 'search'

export function EmptyState({ variant, className = '' }: { variant: Variant; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="52" fill="var(--color-rally-cream, #F5F3EE)" />

      {variant === 'tasks' && (
        <g>
          <path d="M40 30 h40 a6 6 0 0 1 6 6 v44 a6 6 0 0 1 -6 6 h-40 a6 6 0 0 1 -6 -6 v-44 a6 6 0 0 1 6 -6 Z" fill="#fff" stroke="var(--color-rally-black, #111110)" strokeWidth="3" />
          <rect x="50" y="26" width="20" height="10" rx="3" fill="var(--color-rally-amber, #F5A623)" stroke="var(--color-rally-black, #111110)" strokeWidth="2.5" />
          <line x1="46" y1="52" x2="74" y2="52" stroke="var(--color-rally-border, #E8E6E1)" strokeWidth="3" strokeLinecap="round" />
          <line x1="46" y1="62" x2="74" y2="62" stroke="var(--color-rally-border, #E8E6E1)" strokeWidth="3" strokeLinecap="round" />
          <line x1="46" y1="72" x2="64" y2="72" stroke="var(--color-rally-border, #E8E6E1)" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {variant === 'pros' && (
        <g>
          <circle cx="60" cy="48" r="16" fill="#fff" stroke="var(--color-rally-black, #111110)" strokeWidth="3" />
          <path d="M42 46 l9 -14 h18 l9 14" stroke="var(--color-rally-amber, #F5A623)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M34 86 q26 -22 52 0" stroke="var(--color-rally-black, #111110)" strokeWidth="3" fill="#fff" strokeLinejoin="round" />
        </g>
      )}

      {variant === 'certificates' && (
        <g>
          <rect x="36" y="30" width="48" height="60" rx="5" fill="#fff" stroke="var(--color-rally-black, #111110)" strokeWidth="3" />
          <circle cx="60" cy="52" r="12" fill="var(--color-rally-amber-light, #FEF6E4)" stroke="var(--color-rally-amber, #F5A623)" strokeWidth="3" />
          <path d="M52 82 l6 -10 h4 l6 10" stroke="var(--color-rally-black, #111110)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="44" y1="70" x2="76" y2="70" stroke="var(--color-rally-border, #E8E6E1)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {variant === 'reviews' && (
        <g>
          <path d="M60 32 l7.5 15.5 17 2.5 -12.3 12 2.9 17 -15.1 -8 -15.1 8 2.9 -17 -12.3 -12 17 -2.5 Z"
            fill="var(--color-rally-amber-light, #FEF6E4)" stroke="var(--color-rally-amber, #F5A623)" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}

      {variant === 'search' && (
        <g>
          <circle cx="54" cy="52" r="18" fill="#fff" stroke="var(--color-rally-black, #111110)" strokeWidth="3" />
          <line x1="67" y1="65" x2="82" y2="80" stroke="var(--color-rally-black, #111110)" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
