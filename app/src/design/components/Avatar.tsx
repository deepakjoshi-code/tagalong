import { initialOf } from '@/lib/format'
import s from './Avatar.module.css'

const PALETTE = ['#FF6A3D', '#3DBBD9', '#8B5CF6', '#34C79A', '#FFB020', '#FF6B8A', '#4F8BFF']

function hue(seed: string): string {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length] ?? PALETTE[0]!
}

export interface AvatarProps {
  name?: string
  seed: string
  size?: number
  className?: string
}

export function Avatar({ name, seed, size = 40, className }: AvatarProps) {
  return (
    <span
      className={[s.avatar, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, fontSize: size * 0.42, ['--avatar-bg' as string]: hue(seed) }}
      aria-hidden="true"
    >
      {initialOf(name)}
    </span>
  )
}
