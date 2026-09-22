import { Button, ThingIcon } from '@/design/components'
import { THING_META } from '@/domain/things'
import { THING_TYPES, type ThingType } from '@/domain/types'
import { suggestNickname } from '@/domain/nicknames'
import { haptics } from '@/lib/haptics'
import s from '../Wizard.module.css'
import type { StepProps } from './StepFind'

export function StepThing({ draft, patch, next }: StepProps) {
  return (
    <>
      <div className={s.heading}>
        <h1 className={s.title}>What’s it attached to?</h1>
        <p className={s.sub}>The tag reacts differently depending on what it’s riding on.</p>
      </div>

      <div className={s.grid}>
        {THING_TYPES.map((thing: ThingType) => (
          <button
            key={thing}
            type="button"
            className={s.tile}
            aria-pressed={draft.thing === thing}
            onClick={() => {
              haptics.select()
              // Only re-suggest while the nickname is still a suggestion; never
              // overwrite a name the parent typed on a later step.
              const untouched = THING_TYPES.some((t) =>
                THING_META[t].nicknames.includes(draft.nickname.trim()),
              )
              patch(untouched ? { thing, nickname: suggestNickname(thing, draft.personality) } : { thing })
            }}
          >
            <ThingIcon thing={thing} size={56} mood={draft.thing === thing ? 'happy' : null} />
            <span>{THING_META[thing].label}</span>
          </button>
        ))}
      </div>

      <p className={s.hint}>{THING_META[draft.thing].mountHint}</p>

      <div className={s.footer}>
        <Button size="lg" block onClick={next}>
          Continue
        </Button>
      </div>
    </>
  )
}
