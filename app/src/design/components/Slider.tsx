import type { ReactNode } from 'react'
import s from './Slider.module.css'

export interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  onCommit?: (v: number) => void
  label: string
  leading?: ReactNode
  trailing?: ReactNode
  minLabel?: string
  maxLabel?: string
}

export function Slider({ value, min = 0, max = 100, step = 1, onChange, onCommit, label, leading, trailing, minLabel, maxLabel }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className={s.wrap}>
      <div className={s.row}>
        {leading}
        <input
          type="range"
          className={s.input}
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          aria-valuetext={`${value}`}
          style={{ ['--pct' as string]: `${pct}%` }}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
          onKeyUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
        />
        {trailing}
      </div>
      {(minLabel || maxLabel) && (
        <div className={s.labels}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}
