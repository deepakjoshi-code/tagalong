import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Sheet, Stepper } from '@/design/components'
import { DEFAULT_QUIET_HOURS } from '@/domain/types'
import { useStore } from '@/domain/store'
import { suggestNickname } from '@/domain/nicknames'
import s from './Wizard.module.css'
import { StepFind } from './steps/StepFind'
import { StepKid } from './steps/StepKid'
import { StepPersonality } from './steps/StepPersonality'
import { StepSend } from './steps/StepSend'
import { StepSound } from './steps/StepSound'
import { StepThing } from './steps/StepThing'
import { STEP_LABELS, WIZARD_STEPS, type WizardDraft } from './types'

const initialDraft = (): WizardDraft => ({
  simulated: false,
  newKidName: '',
  newKidBand: 'kid',
  thing: 'bottle',
  personality: 'silly',
  nickname: suggestNickname('bottle', 'silly'),
  volume: 70,
  quiet: { ...DEFAULT_QUIET_HOURS },
  nudges: false,
})

export function AddTagWizard() {
  const navigate = useNavigate()
  const kids = useStore((st) => st.kids)
  const [index, setIndex] = useState(0)
  const [draft, setDraft] = useState<WizardDraft>(initialDraft)
  const [confirmClose, setConfirmClose] = useState(false)

  const step = WIZARD_STEPS[index]!
  const patch = (p: Partial<WizardDraft>) => setDraft((d) => ({ ...d, ...p }))
  const next = () => setIndex((i) => Math.min(WIZARD_STEPS.length - 1, i + 1))
  const back = () => setIndex((i) => Math.max(0, i - 1))

  const kid = draft.kidId ? kids.find((k) => k.id === draft.kidId) : undefined
  const ageBand = kid?.ageBand ?? draft.newKidBand
  const kidName = kid?.displayName ?? (draft.newKidName.trim() || undefined)

  const close = () => {
    if (step === 'send' || index === 0) navigate('/tags', { replace: true })
    else setConfirmClose(true)
  }

  const body = useMemo(() => {
    switch (step) {
      case 'find':
        return <StepFind draft={draft} patch={patch} next={next} />
      case 'kid':
        return <StepKid draft={draft} patch={patch} next={next} />
      case 'thing':
        return <StepThing draft={draft} patch={patch} next={next} />
      case 'personality':
        return <StepPersonality draft={draft} patch={patch} next={next} ageBand={ageBand} kidName={kidName} />
      case 'sound':
        return <StepSound draft={draft} patch={patch} next={next} />
      case 'send':
        return <StepSend draft={draft} back={back} />
    }
  }, [step, draft, ageBand, kidName])

  return (
    <div className={s.screen}>
      <Stepper
        steps={WIZARD_STEPS.length}
        index={index}
        label={STEP_LABELS[step]}
        onBack={index > 0 && step !== 'send' ? back : undefined}
        onClose={close}
      />
      <div className={s.body}>{body}</div>
      <Sheet
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Leave setup?"
        subtitle="Your tag won’t be added. You can start again anytime."
        footer={
          <>
            <Button size="lg" block variant="destructive" onClick={() => navigate('/tags', { replace: true })}>
              Leave setup
            </Button>
            <Button size="lg" block variant="tertiary" onClick={() => setConfirmClose(false)}>
              Keep going
            </Button>
          </>
        }
      />
    </div>
  )
}
