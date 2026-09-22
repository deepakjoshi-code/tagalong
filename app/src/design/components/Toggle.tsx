import s from './Toggle.module.css'

export interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean
  id?: string
}

export function Toggle({ checked, onChange, label, disabled, id }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={s.toggle}
      onClick={() => onChange(!checked)}
    >
      <span className={s.track} aria-hidden="true">
        <span className={s.knob} />
      </span>
    </button>
  )
}
