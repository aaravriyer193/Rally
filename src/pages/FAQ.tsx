import { useState } from 'react'
import { Icon } from '../components/Icon'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'

const FAQS = [
  {
    q: 'Is Rally free?',
    a: 'Yes. Volunteering is always free — no fees, no subscriptions. Professional listings are contact-only; any payment you agree with a pro happens directly between you, outside the app.',
  },
  {
    q: 'How does random selection work?',
    a: "When you post a task, anyone nearby can apply. Once you're ready, you select randomly from applicants right on the task page — one person is chosen fairly, and the rest are notified they weren't picked this time.",
  },
  {
    q: 'Who can see my phone number?',
    a: "Nobody, until you're matched. Your number is only revealed to the other side of a confirmed match — a selected volunteer and the task poster, or you and a professional you've chosen to contact.",
  },
  {
    q: 'How do certificates work?',
    a: "Once a task poster marks a task complete, the volunteer who did it can request a certificate with their name, hours, and the task details — useful for DofE, CAS, or any programme that needs proof of service.",
  },
  {
    q: 'Are professionals vetted?',
    a: "Not yet — the directory is contact-only discovery, similar to a community noticeboard. Always use your own judgement before hiring someone, the same way you would from a recommendation.",
  },
  {
    q: 'Can I both volunteer and post tasks?',
    a: 'Yes. Onboarding just sets your starting view — you can post a task one day and apply to volunteer for someone else the next.',
  },
]

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-colors ${open ? 'border-rally-black' : 'border-rally-border'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-rally-black text-sm sm:text-base" style={{ fontFamily: 'Circular' }}>{q}</span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${open ? 'bg-rally-black text-white rotate-180' : 'bg-rally-cream text-gray-400'}`}>
          <Icon name="caret-down" weight="bold" size={13} />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 -mt-1">
          <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export function FAQ() {
  return (
    <div className="min-h-screen bg-rally-cream flex flex-col">
      <MarketingNav />

      <section className="relative max-w-2xl mx-auto px-8 pt-20 pb-20 w-full overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
        />
        <div className="relative">
          <p className="text-xs text-rally-amber uppercase tracking-wide mb-4 text-center flex items-center justify-center gap-1.5">
            <Icon name="question" weight="fill" size={14} /> FAQ
          </p>
          <h1 className="text-3xl text-rally-black mb-12 text-center" style={{ fontFamily: 'Circular', letterSpacing: '-0.5px' }}>
            Questions, answered
          </h1>
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => <Item key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
