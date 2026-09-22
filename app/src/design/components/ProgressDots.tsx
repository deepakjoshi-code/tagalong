import s from './ProgressDots.module.css'

export function ProgressDots({ count, index, label = 'Progress' }: { count: number; index: number; label?: string }) {
  return (
    <div className={s.dots} role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={count} aria-valuenow={index + 1}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={[s.dot, i === index && s.active].filter(Boolean).join(' ')} />
      ))}
    </div>
  )
}
