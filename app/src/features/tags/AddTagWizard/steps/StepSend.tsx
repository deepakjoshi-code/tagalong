import { PartyPopper } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Confetti, ThingIcon } from '@/design/components'
import { samplePhrases } from '@/content/pickPhrase'
import { AGE_BAND_META } from '@/domain/ageBands'
import { useStore } from '@/domain/store'
import type { AgeBand, Kid } from '@/domain/types'
import { haptics } from '@/lib/haptics'
import { buildTagConfig, connectTag } from '@/transport/manager'
import { describeTransportError } from '@/transport'
import s from '../Wizard.module.css'
import type { WizardDraft } from '../types'

type Phase = 'sending' | 'done' | 'failed'

export function StepSend({
  draft,
  patch,
  back,
}: {
  draft: WizardDraft
  patch: (p: Partial<WizardDraft>) => void
  back: () => void
}) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('sending')
  const [tagId, setTagId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  const kids = useStore((st) => st.kids)
  const kid = draft.kidId ? kids.find((k) => k.id === draft.kidId) : undefined
  const ageBand: AgeBand = kid?.ageBand ?? draft.newKidBand
  const kidName = kid?.displayName ?? (draft.newKidName.trim() || undefined)

  useEffect(() => {
    if (started.current) return
    started.current = true
    void (async () => {
      const store = useStore.getState()
      let targetKid: Kid | undefined = draft.kidId ? store.kids.find((k) => k.id === draft.kidId) : undefined
      if (!targetKid) {
        const name = draft.newKidName.trim()
        targetKid = store.addKid(name ? { ageBand: draft.newKidBand, displayName: name } : { ageBand: draft.newKidBand })
        // Remember it on the draft so a retry reuses this kid instead of making another.
        patch({ kidId: targetKid.id })
      }

      // Same for the tag: a retry must not add a second tag for the same device.
      const existing = draft.deviceId ? store.tags.find((t) => t.deviceId === draft.deviceId) : undefined
      const tag = existing ?? store.addTag({
        deviceId: draft.deviceId ?? 'sim-unknown',
        nickname: draft.nickname.trim(),
        thing: draft.thing,
        kidId: targetKid.id,
        personality: draft.personality,
        volume: draft.volume,
        quiet: draft.quiet,
        nudges: draft.nudges,
        language: 'en',
        simulated: draft.simulated,
      })
      setTagId(tag.id)
      if (existing) {
        store.updateTag(existing.id, {
          nickname: draft.nickname.trim(),
          thing: draft.thing,
          kidId: targetKid.id,
          personality: draft.personality,
          volume: draft.volume,
          quiet: draft.quiet,
          nudges: draft.nudges,
        })
      }
      try {
        const conn = await connectTag(tag)
        await conn.writeConfig(buildTagConfig(tag, targetKid))
        useStore.getState().updateTag(tag.id, { lastSyncAt: Date.now() })
        haptics.success()
        setPhase('done')
      } catch (e) {
        // The tag is saved either way; settings sync again on the next connection.
        setError(describeTransportError(e))
        setPhase('failed')
      }
    })()
    // Runs once per mount; a retry remounts this step deliberately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lines = samplePhrases(
    {
      thing: draft.thing,
      event: draft.thing === 'bottle' ? 'filled' : draft.thing === 'toothbrush' ? 'brush_done' : 'pickup',
      ageBand,
      personality: draft.personality,
      kidName,
    },
    3,
  )

  if (phase === 'sending') {
    return (
      <div className={s.progressWrap}>
        <div className={s.ring} role="status" aria-label="Sending settings to the tag" />
        <p className={s.sub}>Sending to {draft.nickname.trim() || 'your tag'}…</p>
      </div>
    )
  }

  return (
    <>
      {phase === 'done' && <Confetti />}
      <div className={s.center}>
        <ThingIcon thing={draft.thing} size={132} mood="excited" bounce />
        <h1 className={s.title}>
          {phase === 'done' ? `${draft.nickname.trim()} is ready!` : `${draft.nickname.trim()} is saved`}
        </h1>
        <p className={s.sub}>
          {phase === 'done'
            ? `Tuned for ages ${AGE_BAND_META[ageBand].range}. Give it a shake and see what happens.`
            : error ?? 'We couldn’t reach the tag, but your settings are saved and will sync next time.'}
        </p>
      </div>

      <div className={s.lines}>
        <span className={s.label}>Says things like…</span>
        {lines.map((l) => (
          <div key={l.raw} className={s.line}>
            <span className={s.lineText}>“{l.text}”</span>
          </div>
        ))}
      </div>

      <div className={s.footer}>
        <Button
          size="lg"
          block
          leading={<PartyPopper size={20} />}
          onClick={() => {
            if (draft.simulated) navigate('/demo', { replace: true })
            else navigate(tagId ? `/tags/${tagId}` : '/tags', { replace: true })
          }}
        >
          {draft.simulated ? 'Try it in the playground' : 'Done'}
        </Button>
        {phase === 'failed' && (
          <Button size="lg" block variant="tertiary" onClick={back}>
            Try sending again
          </Button>
        )}
        {draft.simulated && (
          <Button size="lg" block variant="tertiary" onClick={() => navigate('/tags', { replace: true })}>
            Go to my tags
          </Button>
        )}
      </div>
    </>
  )
}
