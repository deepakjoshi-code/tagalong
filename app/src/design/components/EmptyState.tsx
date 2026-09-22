import type { ReactNode } from 'react'
import s from './EmptyState.module.css'

export interface EmptyStateProps {
  art?: ReactNode
  title: string
  message?: string
  actions?: ReactNode
}

export function EmptyState({ art, title, message, actions }: EmptyStateProps) {
  return (
    <div className={s.wrap}>
      {art && <div className={s.art}>{art}</div>}
      <h2 className={s.title}>{title}</h2>
      {message && <p className={s.message}>{message}</p>}
      {actions && <div className={s.actions}>{actions}</div>}
    </div>
  )
}
