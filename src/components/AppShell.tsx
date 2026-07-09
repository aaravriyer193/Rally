import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { RallyIcon } from './Logo'
import { Icon } from './Icon'
import { BottomNav } from './BottomNav'
import { signOut } from '../lib/auth'

const NAV = [
  { to: '/home', label: 'Home', icon: 'house' },
  { to: '/tasks/new', label: 'Post a task', icon: 'plus-circle' },
  { to: '/activity', label: 'Activity', icon: 'list-checks' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { to: '/profile', label: 'Profile', icon: 'user-circle' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-rally-cream">
      <aside className="hidden md:flex md:flex-col w-60 border-r border-rally-border bg-white fixed inset-y-0 left-0 px-5 py-7 z-30">
        <div className="flex items-center gap-2 text-rally-black px-2 mb-8">
          <RallyIcon size={26} />
          <span className="text-lg" style={{ fontFamily: 'Circular' }}>Rally</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive ? 'bg-rally-black text-white' : 'text-gray-500 hover:bg-rally-cream'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={icon} weight={isActive ? 'fill' : 'regular'} size={19} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={async () => { await signOut(); navigate('/', { replace: true }) }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-rally-cream transition-colors"
        >
          <Icon name="sign-out" size={19} />
          Sign out
        </button>
      </aside>

      <div className="md:ml-60">
        {children}
      </div>

      <BottomNav />
    </div>
  )
}
