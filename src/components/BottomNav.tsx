import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

const tabs = [
  { to: '/home', label: 'Home', icon: 'house' },
  { to: '/tasks/new', label: 'Post', icon: 'plus-circle' },
  { to: '/activity', label: 'Activity', icon: 'list-checks' },
  { to: '/profile', label: 'Profile', icon: 'user-circle' },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rally-border flex z-50">
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-3 text-[11px] transition-colors ${
              isActive ? 'text-rally-black' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={icon} weight={isActive ? 'fill' : 'regular'} size={22} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
