import { useEffect, useMemo, useState } from 'react'
import s from './Confetti.module.css'

const COLORS = ['#FF6A3D', '#3DBBD9', '#8B5CF6', '#34C79A', '#FFB020', '#FF6B8A']

/** Lightweight celebratory confetti (DOM only). Renders nothing under reduced-motion. */
export function Confetti({ count = 36, durationMs = 2200 }: { count?: number; durationMs?: number }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [alive, setAlive] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setAlive(false), durationMs + 400)
    return () => clearTimeout(t)
  }, [durationMs])
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i / count) * 100 + Math.random() * 3}%`,
        dx: `${(Math.random() - 0.5) * 120}px`,
        rot: `${Math.random() * 720 - 360}deg`,
        delay: `${Math.random() * 400}ms`,
        color: COLORS[i % COLORS.length] ?? COLORS[0],
        dur: `${durationMs * (0.8 + Math.random() * 0.5)}ms`,
      })),
    [count, durationMs],
  )
  if (reduced || !alive) return null
  return (
    <div className={s.host} aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={s.piece}
          style={{ left: p.left, background: p.color, animationDelay: p.delay, ['--dx' as string]: p.dx, ['--rot' as string]: p.rot, ['--dur-fall' as string]: p.dur }}
        />
      ))}
    </div>
  )
}
