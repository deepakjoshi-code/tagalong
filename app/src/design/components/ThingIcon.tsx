import type { FaceMood } from '@/domain/events'
import { THING_META } from '@/domain/things'
import type { ThingType } from '@/domain/types'
import { Face } from './Face'
import s from './ThingIcon.module.css'
import { THING_GLYPHS } from './thingGlyphs'

export interface ThingIconProps {
  thing: ThingType
  size?: number
  /** Show the animated face on the glyph. */
  mood?: FaceMood | null
  /** Soft variant: tinted glyph on a pale disc (list rows). */
  soft?: boolean
  bounce?: boolean
  className?: string
  label?: string
}

export function ThingIcon({ thing, size = 48, mood = null, soft, bounce, className, label }: ThingIconProps) {
  const meta = THING_META[thing]
  return (
    <span
      className={[s.wrap, soft && s.soft, bounce && s.bounce, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, ['--thing-tint' as string]: meta.tint, ['--thing-tint-soft' as string]: meta.tintSoft }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 64 64" className={s.svg} fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
        {THING_GLYPHS[thing]}
        {mood && <Face mood={mood} x={meta.face.x} y={meta.face.y} scale={meta.face.scale * 0.85} color={soft ? meta.tint : '#fff'} />}
      </svg>
    </span>
  )
}
