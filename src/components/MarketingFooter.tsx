import { Link } from 'react-router-dom'
import { RallyIcon } from './Logo'

function Column({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-rally-black hover:text-rally-amber transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-rally-border bg-white bg-grain overflow-hidden">
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[420px] rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #1A7A4A 0%, transparent 70%)' }}
      />
      <div className="relative max-w-6xl mx-auto px-8 pt-16 pb-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 pb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-rally-black mb-3">
              <RallyIcon size={24} />
              <span className="text-lg" style={{ fontFamily: 'CoFo Robert', fontWeight: 500 }}>Rally</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-[220px]">
              A little more neighbourly. Built for the street you actually live on.
            </p>
          </div>

          <Column
            title="Product"
            links={[
              { label: 'How it works', to: '/#how-it-works' },
              { label: 'Volunteer', to: '/#modules' },
              { label: 'Find a pro', to: '/#modules' },
            ]}
          />
          <Column
            title="Company"
            links={[
              { label: 'About', to: '/about' },
              { label: 'FAQ', to: '/faq' },
              { label: 'Contact', to: '/contact' },
            ]}
          />
          <Column
            title="Get started"
            links={[
              { label: 'Sign in', to: '/sign-in' },
            ]}
          />
        </div>

        <div className="border-t border-rally-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Rally. Made for neighbourhoods everywhere.</p>
          <p className="text-xs text-gray-400">No fees on volunteering. Ever.</p>
        </div>
      </div>
    </footer>
  )
}
