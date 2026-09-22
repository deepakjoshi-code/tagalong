import { Volume1, Volume2 } from 'lucide-react'
import { Button, DayPicker, ListGroup, ListRow, Slider, Toggle } from '@/design/components'
import { QUIET_STEP_MINUTES, formatMinutesOfDay, snapToQuietStep } from '@/lib/time'
import s from '../Wizard.module.css'
import type { StepProps } from './StepFind'

const timeValue = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
const parseTime = (v: string) => {
  const [h = '0', m = '0'] = v.split(':')
  return snapToQuietStep(Number(h) * 60 + Number(m))
}

export function StepSound({ draft, patch, next }: StepProps) {
  return (
    <>
      <div className={s.heading}>
        <h1 className={s.title}>Sound</h1>
        <p className={s.sub}>The tag never goes above a gentle indoor volume, whatever you choose here.</p>
      </div>

      <ListGroup header="Volume" footer="Hard-capped in the tag at 75 decibels, well under the toy safety limit.">
        <ListRow
          title={
            <Slider
              label="Volume"
              value={draft.volume}
              onChange={(volume) => patch({ volume })}
              leading={<Volume1 size={20} aria-hidden="true" />}
              trailing={<Volume2 size={20} aria-hidden="true" />}
              minLabel="Quiet"
              maxLabel="Lively"
            />
          }
        />
      </ListGroup>

      <ListGroup header="Quiet hours" footer="During quiet hours the tag stays silent but still remembers what happened.">
        <ListRow
          title="Quiet hours"
          subtitle={
            draft.quiet.enabled
              ? `${formatMinutesOfDay(draft.quiet.startMin)} – ${formatMinutesOfDay(draft.quiet.endMin)}`
              : 'Off'
          }
          trailing={
            <Toggle
              label="Quiet hours"
              checked={draft.quiet.enabled}
              onChange={(enabled) => patch({ quiet: { ...draft.quiet, enabled } })}
            />
          }
        />
        {draft.quiet.enabled && (
          <>
            <ListRow
              title="Starts"
              trailing={
                <input
                  type="time"
                  step={QUIET_STEP_MINUTES * 60}
                  className={s.input}
                  style={{ width: 140, minHeight: 40 }}
                  aria-label="Quiet hours start"
                  value={timeValue(draft.quiet.startMin)}
                  onChange={(e) => patch({ quiet: { ...draft.quiet, startMin: parseTime(e.target.value) } })}
                />
              }
            />
            <ListRow
              title="Ends"
              trailing={
                <input
                  type="time"
                  step={QUIET_STEP_MINUTES * 60}
                  className={s.input}
                  style={{ width: 140, minHeight: 40 }}
                  aria-label="Quiet hours end"
                  value={timeValue(draft.quiet.endMin)}
                  onChange={(e) => patch({ quiet: { ...draft.quiet, endMin: parseTime(e.target.value) } })}
                />
              }
            />
          </>
        )}
      </ListGroup>

      <ListGroup
        header="School hours"
        footer="Some schools ban noisy bottles. During school hours the tag stays completely silent, then picks up where it left off."
      >
        <ListRow
          title="Silent at school"
          subtitle={
            draft.school.enabled
              ? `${formatMinutesOfDay(draft.school.startMin)} – ${formatMinutesOfDay(draft.school.endMin)}`
              : 'Off'
          }
          trailing={
            <Toggle
              label="Silent at school"
              checked={draft.school.enabled}
              onChange={(enabled) => patch({ school: { ...draft.school, enabled } })}
            />
          }
        />
        {draft.school.enabled && (
          <>
            <ListRow
              title="From"
              trailing={
                <input
                  type="time"
                  step={QUIET_STEP_MINUTES * 60}
                  className={s.input}
                  style={{ width: 140, minHeight: 44 }}
                  aria-label="School hours start"
                  value={timeValue(draft.school.startMin)}
                  onChange={(e) => patch({ school: { ...draft.school, startMin: parseTime(e.target.value) } })}
                />
              }
            />
            <ListRow
              title="Until"
              trailing={
                <input
                  type="time"
                  step={QUIET_STEP_MINUTES * 60}
                  className={s.input}
                  style={{ width: 140, minHeight: 44 }}
                  aria-label="School hours end"
                  value={timeValue(draft.school.endMin)}
                  onChange={(e) => patch({ school: { ...draft.school, endMin: parseTime(e.target.value) } })}
                />
              }
            />
            <ListRow
              title={
                <DayPicker
                  label="School days"
                  value={draft.school.days}
                  onChange={(days) => patch({ school: { ...draft.school, days } })}
                />
              }
            />
          </>
        )}
      </ListGroup>

      <ListGroup header="Nudges" footer="Off by default. When on, the tag may offer one gentle reminder, like asking for a refill.">
        <ListRow
          title="Gentle nudges"
          subtitle="Never nagging, never more than once an hour"
          trailing={<Toggle label="Gentle nudges" checked={draft.nudges} onChange={(nudges) => patch({ nudges })} />}
        />
      </ListGroup>

      <div className={s.footer}>
        <Button size="lg" block onClick={next}>
          Send to tag
        </Button>
      </div>
    </>
  )
}
