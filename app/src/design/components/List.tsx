import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import s from './List.module.css'

export interface ListGroupProps {
  header?: string
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function ListGroup({ header, footer, children, className }: ListGroupProps) {
  return (
    <section className={[s.groupWrap, className].filter(Boolean).join(' ')}>
      {header && <h2 className={s.header}>{header}</h2>}
      <div className={s.group} role="list">
        {children}
      </div>
      {footer && <p className={s.footer}>{footer}</p>}
    </section>
  )
}

export interface ListRowProps {
  title: ReactNode
  subtitle?: ReactNode
  /** Leading icon; pass `iconTint` (a CSS colour/var) for the rounded square background. */
  icon?: ReactNode
  iconTint?: string
  value?: ReactNode
  trailing?: ReactNode
  chevron?: boolean
  to?: string
  onClick?: () => void
  destructive?: boolean
  center?: boolean
  disabled?: boolean
  'aria-label'?: string
}

export function ListRow({
  title,
  subtitle,
  icon,
  iconTint = 'var(--accent)',
  value,
  trailing,
  chevron,
  to,
  onClick,
  destructive,
  center,
  disabled,
  'aria-label': ariaLabel,
}: ListRowProps) {
  const pressable = !!(to || onClick)
  const className = [s.row, icon && s.withIcon, destructive && s.destructive, center && s.center]
    .filter(Boolean)
    .join(' ')
  const inner = (
    <>
      {icon && (
        <span className={s.icon} style={{ background: iconTint }} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={s.text}>
        <span className={s.title}>{title}</span>
        {subtitle && <span className={s.subtitle}>{subtitle}</span>}
      </span>
      {value !== undefined && <span className={s.value}>{value}</span>}
      {trailing}
      {(chevron ?? !!to) && <ChevronRight className={s.chevron} size={20} aria-hidden="true" />}
    </>
  )
  const hitClass = [s.hit, pressable && s.pressable].filter(Boolean).join(' ')
  let hit: React.ReactNode
  if (to) {
    hit = (
      <Link to={to} className={hitClass} aria-label={ariaLabel} aria-disabled={disabled || undefined}>
        {inner}
      </Link>
    )
  } else if (onClick) {
    hit = (
      <button type="button" onClick={onClick} className={hitClass} aria-label={ariaLabel} disabled={disabled}>
        {inner}
      </button>
    )
  } else {
    hit = <div className={hitClass}>{inner}</div>
  }
  return (
    <div role="listitem" className={className}>
      {hit}
    </div>
  )
}
