import { Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react'
import s from './BatteryPill.module.css'

export function BatteryPill({ percent, charging }: { percent?: number; charging?: boolean }) {
  if (percent === undefined) return null
  const Icon = charging ? BatteryCharging : percent <= 15 ? BatteryLow : percent <= 50 ? BatteryMedium : percent >= 90 ? BatteryFull : Battery
  const cls = [s.pill, charging && s.charging, !charging && percent <= 15 && s.low].filter(Boolean).join(' ')
  return (
    <span className={cls} aria-label={`Battery ${percent} percent${charging ? ', charging' : ''}`}>
      <Icon size={14} aria-hidden="true" />
      {percent}%
    </span>
  )
}
