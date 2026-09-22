import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Avatar, Button } from '@/design/components'
import { AGE_BAND_META } from '@/domain/ageBands'
import { useStore } from '@/domain/store'
import { AGE_BANDS, type AgeBand } from '@/domain/types'
import s from '../Wizard.module.css'
import type { StepProps } from './StepFind'

export function StepKid({ draft, patch, next }: StepProps) {
  const kids = useStore((st) => st.kids)
  const [creating, setCreating] = useState(kids.length === 0)

  const canContinue = creating ? true : !!draft.kidId

  return (
    <>
      <div className={s.heading}>
        <h1 className={s.title}>Who’s it for?</h1>
        <p className={s.sub}>The age band shapes the words, jokes and pace. You can change it anytime.</p>
      </div>

      {kids.length > 0 && (
        <div className={s.avatarRow}>
          {kids.map((k) => (
            <button
              key={k.id}
              type="button"
              className={s.kidPick}
              aria-pressed={!creating && draft.kidId === k.id}
              onClick={() => {
                setCreating(false)
                patch({ kidId: k.id })
              }}
            >
              <Avatar name={k.displayName} seed={k.id} size={48} />
              <span>{k.displayName || AGE_BAND_META[k.ageBand].label}</span>
              <span className={s.kidBand}>{AGE_BAND_META[k.ageBand].range}</span>
            </button>
          ))}
          <button
            type="button"
            className={`${s.kidPick} ${s.newKid}`}
            aria-pressed={creating}
            onClick={() => {
              setCreating(true)
              patch({ kidId: undefined })
            }}
          >
            <Plus size={26} aria-hidden="true" />
            <span>New kid</span>
          </button>
        </div>
      )}

      {creating && (
        <>
          <div className={s.field}>
            <label className={s.label} htmlFor="kid-name">
              First name (optional)
            </label>
            <input
              id="kid-name"
              className={s.input}
              value={draft.newKidName}
              maxLength={24}
              autoComplete="off"
              placeholder="Leave blank if you’d rather not"
              onChange={(e) => patch({ newKidName: e.target.value })}
            />
            <p className={s.hint}>Stored only on this phone. The tag never receives a name as text.</p>
          </div>

          <div className={s.cards}>
            {AGE_BANDS.map((band: AgeBand) => {
              const meta = AGE_BAND_META[band]
              return (
                <button
                  key={band}
                  type="button"
                  className={s.bandCard}
                  aria-pressed={draft.newKidBand === band}
                  onClick={() => patch({ newKidBand: band })}
                >
                  <div className={s.bandText}>
                    <span className={s.bandLabel}>{meta.label}</span>
                    <span className={s.bandRange}>
                      {meta.range} · {meta.blurb}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className={s.footer}>
        <Button size="lg" block disabled={!canContinue} onClick={next}>
          Continue
        </Button>
      </div>
    </>
  )
}
