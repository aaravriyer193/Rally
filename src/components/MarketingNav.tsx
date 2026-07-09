import { Link } from 'react-router-dom'
import { RallyIcon } from './Logo'

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-20 backdrop-blur-md bg-rally-cream/80 border-b border-rally-border/70">
      <div className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-rally-black">
          <RallyIcon size={26} />
          <span className="text-xl" style={{ fontFamily: 'Circular' }}>Rally</span>
        </Link>
        <Link
          to="/sign-in"
          className="text-sm text-rally-black border border-rally-border bg-white rounded-full px-5 py-2 hover:bg-rally-black hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </div>
    </nav>
  )
}
