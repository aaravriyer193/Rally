import type { ReactNode } from 'react'

export function PhoneFrame({ children, className = '', tilt = 0 }: { children: ReactNode; className?: string; tilt?: number }) {
  return (
    <div
      className={`relative w-[260px] h-[540px] flex-shrink-0 ${className}`}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      <div className="absolute inset-0 bg-rally-black rounded-[2.75rem] shadow-[0_30px_60px_rgba(17,17,16,0.25)]" />
      <div className="absolute inset-[9px] bg-rally-cream rounded-[2.2rem] overflow-hidden">
        {children}
      </div>
      <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-24 h-6 bg-rally-black rounded-b-2xl z-10" />
    </div>
  )
}
