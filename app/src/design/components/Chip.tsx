import type { ReactNode } from 'react'
import s from './Chip.module.css'

export interface ChipProps {
  children: ReactNode
  /** Background/foreground override, e.g. a thing tint. */
  bg?: string
  fg?: string
  icon?: ReactNode
  className?: string
}

export function Chip({ children, bg, fg, icon, className }: ChipProps) {
  const tinted = !!(bg || fg)
  return (
    <span
      className={[s.chip, tinted && s.tinted, className].filter(Boolean).join(' ')}
      style={tinted ? ({ '--chip-bg': bg, '--chip-fg': fg } as React.CSSProperties) : undefined}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}

export interface ChoiceChipProps {
  selected: boolean
  onSelect: () => void
  children: ReactNode
}

export function ChoiceChip({ selected, onSelect, children }: ChoiceChipProps) {
  return (
    <button type="button" className={`${s.chip} ${s.selectable}`} aria-pressed={selected} onClick={onSelect}>
      {children}
    </button>
  )
}
