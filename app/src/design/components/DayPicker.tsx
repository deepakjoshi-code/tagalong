import s from './DayPicker.module.css'

/** Monday-first, matching the tag's school-day mask (bit0 = Monday). */
const DAYS = [
  { short: 'M', label: 'Monday' },
  { short: 'T', label: 'Tuesday' },
  { short: 'W', label: 'Wednesday' },
  { short: 'T', label: 'Thursday' },
  { short: 'F', label: 'Friday' },
  { short: 'S', label: 'Saturday' },
  { short: 'S', label: 'Sunday' },
] as const

export interface DayPickerProps {
  /** Bitmask, bit0 = Monday … bit6 = Sunday. */
  value: number
  onChange: (mask: number) => void
  label: string
}

export function DayPicker({ value, onChange, label }: DayPickerProps) {
  return (
    <div className={s.row} role="group" aria-label={label}>
      {DAYS.map((d, i) => {
        const on = (value & (1 << i)) !== 0
        return (
          <button
            key={d.label}
            type="button"
            className={s.day}
            aria-pressed={on}
            aria-label={d.label}
            onClick={() => onChange(on ? value & ~(1 << i) : value | (1 << i))}
          >
            {d.short}
          </button>
        )
      })}
    </div>
  )
}
