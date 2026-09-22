import { ChevronLeft, X } from 'lucide-react'
import { IconButton } from './IconButton'
import s from './Stepper.module.css'

export interface StepperProps {
  steps: number
  index: number
  label?: string
  onBack?: () => void
  onClose: () => void
}

export function Stepper({ steps, index, label, onBack, onClose }: StepperProps) {
  return (
    <div className={s.bar}>
      <div>
        {onBack ? (
          <IconButton label="Back" variant="plain" onClick={onBack}>
            <ChevronLeft size={26} strokeWidth={2.25} />
          </IconButton>
        ) : null}
      </div>
      <div>
        <div className={s.track} role="progressbar" aria-valuemin={1} aria-valuemax={steps} aria-valuenow={index + 1} aria-label={label ?? 'Step'}>
          {Array.from({ length: steps }, (_, i) => (
            <span key={i} className={s.seg}>
              <span className={s.fill} style={{ transform: `scaleX(${i <= index ? 1 : 0})` }} />
            </span>
          ))}
        </div>
        {label && <div className={s.label}>{label}</div>}
      </div>
      <IconButton label="Close" variant="plain" onClick={onClose}>
        <X size={24} strokeWidth={2.25} />
      </IconButton>
    </div>
  )
}
