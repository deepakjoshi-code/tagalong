import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import s from './NavBar.module.css'

export interface NavBarProps {
  title?: string
  backLabel?: string
  /** Where "back" goes when there's no history (deep links). */
  backTo?: string
  onBack?: () => void
  trailing?: ReactNode
  hideBack?: boolean
}

export function NavBar({ title, backLabel = 'Back', backTo = '/tags', onBack, trailing, hideBack }: NavBarProps) {
  const navigate = useNavigate()
  const goBack = () => {
    if (onBack) return onBack()
    if (window.history.length > 1) navigate(-1)
    else navigate(backTo, { replace: true })
  }
  return (
    <nav className={s.bar} aria-label="Navigation">
      <div className={s.lead}>
        {!hideBack && (
          <button type="button" className={s.back} onClick={goBack}>
            <ChevronLeft size={24} strokeWidth={2.25} aria-hidden="true" />
            <span>{backLabel}</span>
          </button>
        )}
      </div>
      <div className={s.title}>{title}</div>
      <div className={s.trail}>{trailing}</div>
    </nav>
  )
}
