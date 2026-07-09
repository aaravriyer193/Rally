import { Icon } from '../components/Icon'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'

export function About() {
  return (
    <div className="min-h-screen bg-rally-cream flex flex-col">
      <MarketingNav />

      <section className="relative max-w-3xl mx-auto px-8 pt-20 pb-20 overflow-hidden bg-grain">
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-40 -left-24 w-[300px] h-[300px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #1A7A4A 0%, transparent 70%)' }}
        />
        <div className="relative">
          <p className="text-xs text-rally-amber uppercase tracking-wide mb-4 flex items-center gap-1.5">
            <Icon name="compass" weight="fill" size={14} /> About Rally
          </p>
          <h1 className="text-[clamp(2.2rem,4.5vw,3.4rem)] text-rally-black leading-[1.08] mb-8"
            style={{ fontFamily: 'Circular', letterSpacing: '-1px' }}>
            The favour economy already exists.<br />It just lives in group chats.
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            Every neighbourhood already runs on borrowed ladders, shared babysitting, and someone's
            cousin who does electrical work on weekends. It happens in WhatsApp groups, school
            newsletters, and word of mouth — it's just slow, and it only reaches people already
            in the loop.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            Rally doesn't try to replace that. It gives it a front door: one place to post a task,
            find a volunteer, or reach a local tradesperson — without the awkwardness of knocking
            on a stranger's door, and without becoming another marketplace that takes a cut.
          </p>
          <p className="text-gray-500 text-base leading-relaxed">
            We built the volunteer side first because it solves a real, specific problem — DofE
            and CAS students need verifiable hours, and neighbours need small jobs done. From there,
            the same trust model — real profiles, fair selection, numbers shared only once you're
            matched — extends naturally to finding a local professional.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 pb-24 w-full">
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl border border-rally-border p-6 shadow-[0_1px_2px_rgba(17,17,16,0.04)] hover:shadow-[0_12px_32px_rgba(17,17,16,0.08)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-rally-amber-light flex items-center justify-center mb-4">
              <Icon name="heart" weight="fill" size={20} className="text-rally-amber" />
            </div>
            <p className="text-rally-black mb-2" style={{ fontFamily: 'Circular' }}>Neighbourly by default</p>
            <p className="text-sm text-gray-400 leading-relaxed">No bidding wars, no algorithmic feed — just people nearby who need or can give a hand.</p>
          </div>
          <div className="bg-white rounded-3xl border border-rally-border p-6 shadow-[0_1px_2px_rgba(17,17,16,0.04)] hover:shadow-[0_12px_32px_rgba(17,17,16,0.08)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-rally-green-light flex items-center justify-center mb-4">
              <Icon name="users-three" weight="fill" size={20} className="text-rally-green" />
            </div>
            <p className="text-rally-black mb-2" style={{ fontFamily: 'Circular' }}>Fair, not first-come</p>
            <p className="text-sm text-gray-400 leading-relaxed">When more people apply than there's room for, one is picked at random. No favourites.</p>
          </div>
          <div className="bg-rally-black rounded-3xl p-6 shadow-[0_1px_2px_rgba(17,17,16,0.04)] hover:shadow-[0_12px_32px_rgba(17,17,16,0.18)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Icon name="handshake" weight="fill" size={20} className="text-white" />
            </div>
            <p className="text-white mb-2" style={{ fontFamily: 'Circular' }}>Connection, not a cut</p>
            <p className="text-sm text-[#999] leading-relaxed">We don't process payments or take a fee. We just help you find each other.</p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
