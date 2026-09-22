import type { FaceMood } from '@/domain/events'
import s from './Face.module.css'

export interface FaceProps {
  mood?: FaceMood
  /** Centre of the face in the parent SVG's coordinate space. */
  x?: number
  y?: number
  scale?: number
  color?: string
}

/**
 * A tiny expressive face drawn in a 24×16 box, centred at (x, y).
 * Eyes blink on a slow loop; the mouth changes with mood.
 */
export function Face({ mood = 'neutral', x = 12, y = 8, scale = 1, color = 'currentColor' }: FaceProps) {
  const eyeY = mood === 'sleepy' ? -1 : -2
  const eyeR = mood === 'surprised' || mood === 'excited' ? 2.6 : mood === 'sleepy' ? 1.2 : 2.1
  const mouth = (() => {
    switch (mood) {
      case 'happy':
        return 'M -5 3 Q 0 8 5 3'
      case 'excited':
        return 'M -5 2 Q 0 10 5 2 Z'
      case 'surprised':
        return 'M -2.5 4 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0'
      case 'ouch':
        return 'M -4 5 Q 0 1 4 5'
      case 'sleepy':
        return 'M -3 4.5 Q 0 6 3 4.5'
      case 'curious':
        return 'M -3 4 Q 0 6 4 3'
      default:
        return 'M -4 4 Q 0 6 4 4'
    }
  })()
  const wink = mood === 'sleepy'
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={color} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {wink ? (
        <>
          <path d="M -9 -1.5 h 4" fill="none" />
          <path d="M 5 -1.5 h 4" fill="none" />
        </>
      ) : (
        <>
          <circle className={s.eye} cx={-7} cy={eyeY} r={eyeR} stroke="none" />
          <circle className={`${s.eye} ${s.second}`} cx={7} cy={eyeY} r={eyeR} stroke="none" />
        </>
      )}
      {mood === 'ouch' && (
        <>
          <path d="M -10 -5 l 3 2 M -4 -5 l -3 2" fill="none" strokeWidth={1.4} />
          <path d="M 4 -5 l 3 2 M 10 -5 l -3 2" fill="none" strokeWidth={1.4} />
        </>
      )}
      <path className={s.mouth} d={mouth} fill={mood === 'excited' || mood === 'surprised' ? color : 'none'} fillOpacity={0.9} />
    </g>
  )
}
