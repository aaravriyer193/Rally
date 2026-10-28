import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'

function FeatureCard({ icon, tint, title, desc }: { icon: React.ReactNode; tint: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] hover:shadow-[0_8px_24px_rgba(17,17,16,0.08)] hover:-translate-y-0.5 transition-all duration-300 p-6">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 ${tint}`}>
        {icon}
      </div>
      <h3 className="text-rally-black text-lg mb-2" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

// Phones rendered with React Bits Center Stage (reactbits.dev/tools/center-stage).
function DeviceShot({ src, alt, width, height, eager, className = '' }: { src: string; alt: string; width: number; height: number; eager?: boolean; className?: string }) {
  return <img src={src} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" className={`h-auto select-none ${className}`} draggable={false} />
}

function FeatureRow({
  reverse, eyebrow, title, desc, points, phone,
}: {
  reverse?: boolean
  eyebrow: string
  title: string
  desc: string
  points: string[]
  phone: React.ReactNode
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
      <div>
        <p className="text-xs text-rally-amber uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>{eyebrow}</p>
        <h2 className="text-3xl text-rally-black mb-4" style={{ fontFamily: 'CoFo Robert', fontWeight: 500, letterSpacing: '-0.4px' }}>{title}</h2>
        <p className="text-gray-400 text-base leading-relaxed mb-6 max-w-md">{desc}</p>
        <ul className="space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-gray-500">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-rally-cream flex items-center justify-center flex-shrink-0 text-[10px] text-rally-black font-bold">✓</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center">{phone}</div>
    </div>
  )
}

export function Landing() {
  return (
    <div className="min-h-screen bg-rally-cream overflow-x-hidden">
      <MarketingNav />

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-8 pt-16 pb-24 bg-grain">
        <div
          className="pointer-events-none absolute -top-24 right-0 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
        />
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-rally-border rounded-full px-4 py-1.5 text-xs text-gray-500 mb-8 shadow-sm">
              <Icon name="shield-check" weight="fill" size={13} className="text-rally-amber" />
              Built for DofE, CAS, and good neighbours
            </div>
            <h1 className="text-[clamp(2rem,3.8vw,3.4rem)] text-rally-black leading-[1.08] mb-6"
              style={{ fontFamily: 'CoFo Robert', fontWeight: 500, letterSpacing: '-1px' }}>
              Your community,<br />actually connected.
            </h1>
            <p className="text-gray-400 text-lg max-w-lg mb-10 leading-relaxed">
              Get help from a neighbour, or give it. Volunteer for someone nearby, log hours
              toward a certificate, or find a local pro when the job needs a professional.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/sign-in"
                className="inline-flex items-center gap-3 bg-rally-black text-white rounded-2xl px-8 py-4 text-base hover:opacity-90 transition-opacity shadow-[0_8px_24px_rgba(17,17,16,0.18)]"
                style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}
              >
                Get started
                <Icon name="arrow-right" weight="bold" size={16} />
              </Link>
              <span className="text-xs text-gray-400">Free to join · no fees on volunteering</span>
            </div>
          </div>

          <div className="hidden sm:flex justify-center relative">
            <DeviceShot
              src="/phones/hero.webp"
              alt="Rally on three phones: a matched task, nearby tasks and local pros"
              width={1200}
              height={889}
              eager
              className="w-[122%] max-w-none flex-shrink-0"
            />

            <div className="absolute -top-2 -right-2 bg-white rounded-full border border-rally-border pl-2 pr-3.5 py-1.5 shadow-[0_12px_30px_rgba(17,17,16,0.12)] flex items-center gap-1.5 whitespace-nowrap rotate-3">
              <span className="w-4 h-4 rounded-full bg-rally-green-light flex items-center justify-center text-[9px] text-rally-green font-bold flex-shrink-0">✓</span>
              <span className="text-[11px] text-rally-black">Selected at random</span>
            </div>

            <div className="absolute -bottom-3 -left-6 bg-white rounded-full border border-rally-border pl-1.5 pr-3.5 py-1.5 shadow-[0_12px_30px_rgba(17,17,16,0.12)] flex items-center gap-1.5 whitespace-nowrap -rotate-2">
              <span className="w-6 h-6 rounded-full bg-rally-amber-light flex items-center justify-center flex-shrink-0">
                <Icon name="star" weight="fill" size={11} className="text-rally-amber" />
              </span>
              <span className="text-[11px] text-rally-black">4.9 rated by neighbours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature showcase */}
      <section id="modules" className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-24 scroll-mt-20">
        <FeatureRow
          eyebrow="Volunteer"
          title="Get matched, fairly."
          desc="A neighbour needs a lawn mowed, a grocery run, or regular babysitting. You need volunteer hours for DofE or CAS. Apply, get picked at random, and you're connected — no favourites, no awkward turn-downs."
          points={[
            'Neighbours post one-off or recurring tasks',
            'One applicant selected at random, server-side',
            'Numbers exchanged only once you’re matched',
          ]}
          phone={<DeviceShot src="/phones/match.webp" alt="A task matched to a volunteer at random" width={720} height={1272} className="w-[300px] max-w-full" />}
        />
        <FeatureRow
          reverse
          eyebrow="Certificates"
          title="Proof of service that looks like proof."
          desc="Once a task is confirmed by both sides, request a real certificate — recipient name, hours, a certificate number, print-ready for DofE and CAS records. Not a list item. An actual document."
          points={[
            'Issued only after mutual confirmation',
            'Milestone certificates for hour & task streaks',
            'Print or save as PDF straight from your browser',
          ]}
          phone={<DeviceShot src="/phones/cert.webp" alt="A Rally certificate of service" width={720} height={1171} className="w-[310px] max-w-full" />}
        />
        <FeatureRow
          eyebrow="Find a pro"
          title="Or skip straight to a professional."
          desc="Need an electrician, not a volunteer? Browse local trades by category and get their number directly — no bidding, no booking fees, just a connection."
          points={[
            'Real, editable listings by category',
            'Filtered by distance to you',
            'We connect you — no payments through the app',
          ]}
          phone={<DeviceShot src="/phones/pro.webp" alt="Local professionals listed by category" width={720} height={1157} className="w-[340px] max-w-full" />}
        />
      </section>

      {/* Feature grid */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-8 py-24 scroll-mt-20">
        <h2 className="text-3xl text-rally-black mb-3 text-center" style={{ fontFamily: 'CoFo Robert', fontWeight: 500, letterSpacing: '-0.5px' }}>
          How it works
        </h2>
        <p className="text-gray-400 text-sm text-center mb-10 max-w-md mx-auto">
          Three ideas that make this actually work, instead of dying like every other neighbourhood app.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          <FeatureCard
            tint="bg-rally-amber-light"
            icon={<Icon name="users-three" weight="fill" size={22} className="text-rally-amber" />}
            title="Fair random selection"
            desc="When more volunteers apply than slots available, one is picked at random. No favouritism, no awkward turn-downs."
          />
          <FeatureCard
            tint="bg-rally-green-light"
            icon={<Icon name="medal" weight="fill" size={22} className="text-rally-green" />}
            title="Verified certificates"
            desc="Complete a task and request a certificate with your name, hours, and the task details — accepted for DofE and CAS records."
          />
          <FeatureCard
            tint="bg-rally-cream"
            icon={<Icon name="shield-check" weight="fill" size={22} className="text-rally-black" />}
            title="Numbers stay private"
            desc="Contact info is only shared once you're matched — with a task poster, a selected volunteer, or a professional you reach out to."
          />
        </div>
      </section>

      {/* CTA band */}
      <section className="relative max-w-6xl mx-auto px-8 pb-24">
        <div className="relative rounded-[2rem] bg-rally-black overflow-hidden px-10 py-16 text-center bg-grain">
          <div
            className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
          />
          <div className="relative">
            <p className="text-2xl text-white mb-6" style={{ fontFamily: 'CoFo Robert', fontWeight: 500, letterSpacing: '-0.3px' }}>Ready to rally your street?</p>
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-2 bg-white text-rally-black rounded-2xl px-8 py-4 text-sm hover:opacity-90 transition-opacity"
            >
              Get started — it's free <Icon name="arrow-right" weight="bold" size={14} />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
