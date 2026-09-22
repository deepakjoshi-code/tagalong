import { Heart, PartyPopper, Play, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, toast } from '@/design/components'
import { AGE_BAND_META } from '@/domain/ageBands'
import { PERSONALITY_META } from '@/domain/personalities'
import { suggestNickname } from '@/domain/nicknames'
import { PERSONALITIES, type AgeBand, type Personality } from '@/domain/types'
import { samplePhrases } from '@/content/pickPhrase'
import { SPEECH_UNAVAILABLE_COPY, canSpeak, speak, speechUnavailableReason } from '@/lib/speech'
import { haptics } from '@/lib/haptics'
import s from '../Wizard.module.css'
import type { StepProps } from './StepFind'

const ICONS = { party: PartyPopper, heart: Heart, zap: Zap } as const

export function StepPersonality({ draft, patch, next, ageBand, kidName }: StepProps & { ageBand: AgeBand; kidName?: string }) {
  const [speaking, setSpeaking] = useState<string | null>(null)

  const preview = useMemo(() => {
    const star = draft.thing === 'bottle' ? 'filled' : draft.thing === 'toothbrush' ? 'brush_done' : 'pickup'
    return samplePhrases({ thing: draft.thing, event: star, ageBand, personality: draft.personality, kidName }, 3)
  }, [draft.thing, draft.personality, ageBand, kidName])

  const say = async (text: string) => {
    if (!canSpeak()) {
      const reason = speechUnavailableReason()
      if (reason !== 'none') toast.show(SPEECH_UNAVAILABLE_COPY[reason])
      return
    }
    setSpeaking(text)
    await speak(text, { ageBand, personality: draft.personality })
    setSpeaking(null)
  }

  return (
    <>
      <div className={s.heading}>
        <h1 className={s.title}>Pick a personality</h1>
        <p className={s.sub}>Tap a line to hear roughly how it will sound.</p>
      </div>

      <div className={s.cards}>
        {PERSONALITIES.map((p: Personality) => {
          const meta = PERSONALITY_META[p]
          const Icon = ICONS[meta.icon]
          return (
            <button
              key={p}
              type="button"
              className={s.personaCard}
              aria-pressed={draft.personality === p}
              onClick={() => {
                haptics.select()
                patch({ personality: p, nickname: draft.nickname || suggestNickname(draft.thing, p) })
              }}
            >
              <span className={s.personaIcon} aria-hidden="true">
                <Icon size={22} />
              </span>
              <span className={s.personaText}>
                <span className={s.bandLabel}>{meta.label}</span>
                <span className={s.personaSample}>“{meta.sample[ageBand].replace('{{name}}', kidName || AGE_BAND_META[ageBand].fallbackNames[0]!)}”</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className={s.lines}>
        <span className={s.label}>Says things like…</span>
        {preview.map((p) => (
          <button key={p.raw} type="button" className={s.line} onClick={() => void say(p.text)} aria-busy={speaking === p.text}>
            <span className={s.lineText}>“{p.text}”</span>
            <Play size={18} className={s.play} aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="nickname">
          Name this tag
        </label>
        <input
          id="nickname"
          className={s.input}
          value={draft.nickname}
          maxLength={30}
          onChange={(e) => patch({ nickname: e.target.value })}
        />
      </div>

      <div className={s.footer}>
        <Button size="lg" block disabled={!draft.nickname.trim()} onClick={next}>
          Continue
        </Button>
      </div>
    </>
  )
}
