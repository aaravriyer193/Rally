import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'
import { PhoneFrame } from '../components/PhoneFrame'

function FeatureCard({ icon, tint, title, desc }: { icon: React.ReactNode; tint: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-3xl border border-rally-border shadow-[0_1px_2px_rgba(17,17,16,0.04)] hover:shadow-[0_8px_24px_rgba(17,17,16,0.08)] hover:-translate-y-0.5 transition-all duration-300 p-6">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 ${tint}`}>
        {icon}
      </div>
      <h3 className="text-rally-black text-lg mb-2" style={{ fontFamily: 'CoFo Robert' }}>{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="h-9 flex items-center justify-between px-5 pt-1 text-[10px] text-rally-black flex-shrink-0">
      <span style={{ fontFamily: 'CoFo Robert' }}>9:41</span>
      <div className="flex items-center gap-1">
        <Icon name="cell-signal-full" size={11} />
        <Icon name="wifi-high" size={11} />
        <Icon name="battery-full" size={12} />
      </div>
    </div>
  )
}

function HomeScreenMock() {
  return (
    <div className="h-full flex flex-col bg-rally-cream">
      <StatusBar />
      <div className="bg-rally-black px-4 pt-2 pb-5 flex-shrink-0">
        <p className="text-white text-xl" style={{ fontFamily: 'CoFo Robert' }}>Hi, Alex</p>
        <p className="text-[10px] text-[#999] mt-1 flex items-center gap-1"><Icon name="map-pin" weight="fill" size={10} className="text-rally-amber" /> Near Riverside</p>
      </div>
      <div className="px-4 pt-3 flex gap-1.5 flex-shrink-0">
        <span className="text-[9px] bg-rally-black text-white px-2.5 py-1 rounded-full" style={{ fontFamily: 'CoFo Robert' }}>Tasks near you</span>
        <span className="text-[9px] bg-white border border-rally-border text-gray-500 px-2.5 py-1 rounded-full">Find a pro</span>
      </div>
      <div className="px-4 pt-3 flex flex-col gap-2 flex-1">
        <div className="bg-white rounded-2xl border border-rally-border p-3">
          <div className="flex items-start justify-between">
            <p className="text-[11px] text-rally-black" style={{ fontFamily: 'CoFo Robert' }}>Mow the lawn this weekend</p>
            <span className="text-[7px] bg-rally-cream text-gray-500 px-1.5 py-0.5 rounded-full flex-shrink-0">Yard</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-1">Mrs. Patel · 0.3 mi</p>
        </div>
        <div className="bg-white rounded-2xl border border-rally-border p-3">
          <div className="flex items-start justify-between">
            <p className="text-[11px] text-rally-black" style={{ fontFamily: 'CoFo Robert' }}>Grocery run</p>
            <span className="text-[7px] bg-rally-cream text-gray-500 px-1.5 py-0.5 rounded-full flex-shrink-0">Errands</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-1">Mr. Okonkwo · 0.5 mi</p>
        </div>
        <div className="bg-rally-black rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
              <Icon name="wrench" weight="fill" size={10} className="text-white" />
            </div>
            <p className="text-[10px] text-white" style={{ fontFamily: 'CoFo Robert' }}>Marcus T. — Electrician</p>
          </div>
          <p className="text-[9px] text-[#999]">$65/hr · Riverside</p>
        </div>
      </div>
    </div>
  )
}

function MatchScreenMock() {
  return (
    <div className="h-full flex flex-col bg-rally-cream">
      <StatusBar />
      <div className="px-4 pt-2 flex items-center gap-2 flex-shrink-0">
        <Icon name="arrow-left" size={14} className="text-rally-black" />
        <span className="text-[9px] text-gray-400">Yard &amp; outdoor</span>
      </div>
      <div className="px-4 pt-4 flex-1">
        <div className="bg-white rounded-2xl border border-rally-border p-3.5">
          <span className="text-[8px] bg-rally-green-light text-rally-green px-2 py-0.5 rounded-full">Filled — matched</span>
          <p className="text-[13px] text-rally-black mt-2" style={{ fontFamily: 'CoFo Robert' }}>Mow the lawn this weekend</p>
          <p className="text-[18px] text-rally-black mt-1" style={{ fontFamily: 'CoFo Robert' }}>Unpaid</p>

          <div className="bg-rally-cream rounded-xl p-2.5 mt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <Icon name="user" size={12} className="text-rally-border" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-rally-black" style={{ fontFamily: 'CoFo Robert' }}>Jordan Rivera</p>
              <p className="text-[8px] text-gray-400">You&apos;re matched!</p>
            </div>
            <div className="flex items-center gap-0.5 bg-rally-green-light text-rally-green px-2 py-1 rounded-lg flex-shrink-0">
              <Icon name="check" weight="bold" size={8} />
              <span className="text-[8px]">Random</span>
            </div>
          </div>

          <div className="bg-rally-black text-white text-center rounded-xl py-2.5 mt-3">
            <span className="text-[10px]" style={{ fontFamily: 'CoFo Robert' }}>Confirm task is done</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CertScreenMock() {
  return (
    <div className="h-full flex flex-col bg-rally-cream">
      <StatusBar />
      <div className="px-4 pt-3 flex-1 flex items-center">
        <div className="w-full bg-white rounded-xl border-2 border-rally-black p-1">
          <div className="border border-rally-border rounded-lg px-4 py-5 flex flex-col items-center text-center relative">
            <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-rally-amber" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-rally-amber" />
            <span className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-rally-amber" />
            <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-rally-amber" />
            <Icon name="seal-check" weight="fill" size={16} className="text-rally-black mb-2" />
            <p className="text-[7px] tracking-[0.15em] text-rally-amber uppercase">Certificate of Service</p>
            <p className="text-[8px] text-gray-400 mt-2">This certifies that</p>
            <p className="text-[15px] text-rally-black mt-1 pb-1 border-b border-rally-cream px-3" style={{ fontFamily: 'CoFo Robert' }}>Jordan Rivera</p>
            <p className="text-[7px] text-gray-500 mt-2 leading-relaxed">completed 25+ hours of volunteer service on Rally</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProScreenMock() {
  return (
    <div className="h-full flex flex-col bg-rally-cream">
      <StatusBar />
      <div className="px-4 pt-2 flex-shrink-0">
        <p className="text-rally-black text-xl" style={{ fontFamily: 'CoFo Robert' }}>Find a pro</p>
      </div>
      <div className="px-4 pt-2 flex gap-1.5 overflow-hidden flex-shrink-0">
        {['All', 'Electrical', 'Plumbing', 'Tutoring'].map((c, i) => (
          <span key={c} className={`text-[8px] px-2 py-1 rounded-full flex-shrink-0 ${i === 0 ? 'bg-rally-black text-white' : 'bg-white border border-rally-border text-gray-500'}`}>{c}</span>
        ))}
      </div>
      <div className="px-4 pt-3 flex flex-col gap-2 flex-1">
        {[["Marcus T.", "Electrician", "$65/hr"], ["Priya S.", "Tutoring", "$30/hr"]].map((p) => (
          <div key={p[0]} className="bg-white rounded-2xl border border-rally-border p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rally-amber-light flex items-center justify-center flex-shrink-0">
              <Icon name="wrench" size={13} className="text-rally-amber" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-rally-black" style={{ fontFamily: 'CoFo Robert' }}>{p[0]}</p>
              <p className="text-[8px] text-gray-400">{p[1]}</p>
            </div>
            <span className="text-[9px] text-rally-black flex-shrink-0">{p[2]}</span>
          </div>
        ))}
      </div>
    </div>
  )
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
        <p className="text-xs text-rally-amber uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'CoFo Robert' }}>{eyebrow}</p>
        <h2 className="text-3xl text-rally-black mb-4" style={{ fontFamily: 'CoFo Robert', letterSpacing: '-0.4px' }}>{title}</h2>
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
              style={{ fontFamily: 'CoFo Robert', letterSpacing: '-1px' }}>
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
                style={{ fontFamily: 'CoFo Robert' }}
              >
                Get started
                <Icon name="arrow-right" weight="bold" size={16} />
              </Link>
              <span className="text-xs text-gray-400">Free to join · no fees on volunteering</span>
            </div>
          </div>

          <div className="hidden sm:flex justify-center relative">
            <PhoneFrame>
              <HomeScreenMock />
            </PhoneFrame>

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
          phone={<PhoneFrame tilt={-2}><MatchScreenMock /></PhoneFrame>}
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
          phone={<PhoneFrame tilt={2}><CertScreenMock /></PhoneFrame>}
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
          phone={<PhoneFrame tilt={-2}><ProScreenMock /></PhoneFrame>}
        />
      </section>

      {/* Feature grid */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-8 py-24 scroll-mt-20">
        <h2 className="text-3xl text-rally-black mb-3 text-center" style={{ fontFamily: 'CoFo Robert', letterSpacing: '-0.5px' }}>
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
            <p className="text-2xl text-white mb-6" style={{ fontFamily: 'CoFo Robert', letterSpacing: '-0.3px' }}>Ready to rally your street?</p>
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
