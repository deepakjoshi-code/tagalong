import type { ReactNode } from 'react'
import s from './Screen.module.css'

export interface ScreenProps {
  title?: string
  subtitle?: string
  trailing?: ReactNode
  /** Set when the screen is presented outside the tab bar (modals, wizard, detail). */
  noTabBar?: boolean
  className?: string
  children: ReactNode
  /** Rendered above the header, e.g. a NavBar. */
  top?: ReactNode
}

export function Screen({ title, subtitle, trailing, noTabBar, className, children, top }: ScreenProps) {
  return (
    <main className={[s.screen, noTabBar && s.noTabBar, className].filter(Boolean).join(' ')}>
      {top}
      {(title || trailing) && (
        <header className={s.header}>
          <div>
            {title && <h1 className={s.title}>{title}</h1>}
            {subtitle && <p className={s.subtitle}>{subtitle}</p>}
          </div>
          {trailing && <div className={s.trailing}>{trailing}</div>}
        </header>
      )}
      <div className={s.body}>{children}</div>
    </main>
  )
}
