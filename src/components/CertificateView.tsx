import { RallyIcon } from './Logo'
import { Icon } from './Icon'

export function CertificateView({
  recipientName,
  eyebrow,
  title,
  detail,
  dateStr,
  certId,
}: {
  recipientName: string
  eyebrow: string
  title: string
  detail: string
  dateStr: string
  certId: string
}) {
  return (
    <div
      className="cert-print relative bg-white mx-auto w-full max-w-[820px] aspect-[1.414/1] p-3 sm:p-5"
      style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}
    >
      <div className="relative w-full h-full border-2 border-rally-black p-1.5">
        <div className="w-full h-full border border-rally-border p-6 sm:p-10 flex flex-col items-center text-center relative overflow-hidden">
          {/* corner marks */}
          <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-rally-amber" />
          <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-rally-amber" />
          <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-rally-amber" />
          <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-rally-amber" />

          <div className="flex items-center gap-2 text-rally-black mb-4 sm:mb-6">
            <RallyIcon size={22} />
            <span className="text-base tracking-wide">Rally</span>
          </div>

          <p className="text-[10px] sm:text-xs tracking-[0.25em] text-rally-amber uppercase mb-3">{eyebrow}</p>
          <h1 className="text-2xl sm:text-4xl text-rally-black mb-4 sm:mb-6" style={{ letterSpacing: '-0.5px' }}>
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">This certifies that</p>
          <p
            className="text-2xl sm:text-4xl text-rally-black mb-3 sm:mb-5 px-4 pb-1 border-b-2 border-rally-cream"
            style={{ fontFamily: 'CoFo Robert', fontWeight: 500, letterSpacing: '-0.5px' }}
          >
            {recipientName}
          </p>

          <p className="text-xs sm:text-sm text-gray-500 max-w-md leading-relaxed mb-6 sm:mb-10">{detail}</p>

          <div className="mt-auto w-full flex items-end justify-between pt-4 sm:pt-6 border-t border-rally-border">
            <div className="text-left">
              <p className="text-[9px] sm:text-[11px] text-gray-400">Issued</p>
              <p className="text-xs sm:text-sm text-rally-black">{dateStr}</p>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-rally-black flex items-center justify-center flex-shrink-0">
              <Icon name="seal-check" weight="fill" size={20} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-[9px] sm:text-[11px] text-gray-400">Certificate No.</p>
              <p className="text-xs sm:text-sm text-rally-black">{certId}</p>
            </div>
          </div>

          <p className="text-[8px] sm:text-[9px] text-gray-300 mt-3">
            Confirmed by both parties via Rally — self-reported, not independently verified.
          </p>
        </div>
      </div>
    </div>
  )
}
