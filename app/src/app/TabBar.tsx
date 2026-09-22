import { Settings2, Smile, Tag } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { haptics } from '@/lib/haptics'
import s from './TabBar.module.css'

const TABS = [
  { to: '/tags', label: 'Tags', Icon: Tag },
  { to: '/kids', label: 'Kids', Icon: Smile },
  { to: '/settings', label: 'Settings', Icon: Settings2 },
] as const

export function TabBar() {
  return (
    <nav className={s.bar} aria-label="Main">
      <div className={s.inner}>
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => [s.tab, isActive && s.active].filter(Boolean).join(' ')}
            onClick={() => haptics.tap()}
          >
            {({ isActive }) => (
              <>
                <Icon size={24} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

/** Layout route: screens that live under the tab bar. */
export function TabLayout() {
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  )
}
