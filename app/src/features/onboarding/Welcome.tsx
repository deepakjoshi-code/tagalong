import { ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Chip, ProgressDots, ThingIcon } from '@/design/components'
import { useStore } from '@/domain/store'
import { haptics } from '@/lib/haptics'
import s from './Welcome.module.css'

const SLIDES = 3

export function Welcome() {
  const navigate = useNavigate()
  const completeOnboarding = useStore((st) => st.completeOnboarding)
  const updateSettings = useStore((st) => st.updateSettings)
  const trackRef = useRef<HTMLDivElement>(null)
  const programmatic = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [index, setIndex] = useState(0)

  // Swipes update the index from scroll position; button-driven scrolls are ignored
  // until they settle so the two never fight.
  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el || programmatic.current) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setIndex(Math.max(0, Math.min(SLIDES - 1, i)))
  }, [])

  const goTo = (i: number) => {
    const el = trackRef.current
    if (!el) return
    setIndex(i)
    if (programmatic.current) clearTimeout(programmatic.current)
    programmatic.current = setTimeout(() => {
      programmatic.current = null
    }, 700)
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  const finish = (to: string, demo = false) => {
    haptics.success()
    completeOnboarding()
    if (demo) updateSettings({ demoMode: true })
    navigate(to, { replace: true })
  }

  const last = index === SLIDES - 1

  return (
    <div className={s.screen}>
      <h1 className="visually-hidden">Welcome to Tagalong</h1>
      <div className={s.top}>
        {!last && (
          <button type="button" className={s.skip} onClick={() => finish('/tags')}>
            Skip
          </button>
        )}
      </div>

      <div ref={trackRef} className={s.track} aria-roledescription="carousel" aria-label="Welcome">
        <section className={s.slide} aria-label="Give anything a voice">
          <div className={s.hero}>
            <div className={s.trio}>
              <ThingIcon thing="lunchbox" size={84} mood="happy" />
              <ThingIcon thing="bottle" size={132} mood="excited" bounce />
              <ThingIcon thing="backpack" size={84} mood="curious" />
            </div>
          </div>
          <h2 className={s.title}>Give anything a voice.</h2>
          <p className={s.text}>
            Tagalong turns a water bottle, lunchbox or backpack into a friend who giggles, cheers and says
            “ouch” when it takes a tumble.
          </p>
        </section>

        <section className={s.slide} aria-label="Private by design">
          <div className={s.hero}>
            <div className={s.shield}>
              <ShieldCheck size={84} strokeWidth={1.6} aria-hidden="true" />
            </div>
          </div>
          <h2 className={s.title}>Made for kids. Private by design.</h2>
          <p className={s.text}>Everything stays on this phone and on the tag. We literally can’t see your data.</p>
          <div className={s.pillars}>
            <Chip>No account</Chip>
            <Chip>No cloud</Chip>
            <Chip>No microphone</Chip>
            <Chip>No tracking</Chip>
          </div>
        </section>

        <section className={s.slide} aria-label="Set up in 60 seconds">
          <div className={s.hero}>
            <img className={s.tagArt} src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" width={176} height={176} />
          </div>
          <h2 className={s.title}>Set up your first tag in 60 seconds.</h2>
          <p className={s.text}>Pick who it’s for, what it’s attached to, and a personality. That’s it.</p>
        </section>
      </div>

      <div className={s.bottom}>
        <ProgressDots count={SLIDES} index={index} label="Welcome step" />
        <div className={s.actions}>
          {last ? (
            <>
              <Button size="lg" block onClick={() => finish('/tags/new')}>
                Get started
              </Button>
              <Button size="lg" block variant="tertiary" onClick={() => finish('/demo', true)}>
                Try the demo
              </Button>
            </>
          ) : (
            <Button size="lg" block onClick={() => goTo(index + 1)}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
