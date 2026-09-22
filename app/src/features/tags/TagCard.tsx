import { BellOff } from 'lucide-react'
import { BatteryPill, Card, ThingIcon } from '@/design/components'
import { AGE_BAND_META } from '@/domain/ageBands'
import { EVENT_META } from '@/domain/events'
import { PERSONALITY_META } from '@/domain/personalities'
import { isTagMuted } from '@/domain/selectors'
import type { Kid, Tag, TagEvent } from '@/domain/types'
import { formatRelative } from '@/lib/time'
import s from './TagCard.module.css'

export interface TagCardProps {
  tag: Tag
  kid?: Kid
  lastEvent?: TagEvent
  now?: number
}

export function TagCard({ tag, kid, lastEvent, now = Date.now() }: TagCardProps) {
  const muted = isTagMuted(tag, now)
  const mood = lastEvent && now - lastEvent.at < 10 * 60_000 ? EVENT_META[lastEvent.type].mood : 'neutral'
  const who = kid?.displayName || (kid ? `${AGE_BAND_META[kid.ageBand].label} kid` : 'Unassigned')
  return (
    <Card to={`/tags/${tag.id}`} className={s.card} aria-label={`${tag.nickname}, ${who}`}>
      <ThingIcon thing={tag.thing} size={60} mood={muted ? 'sleepy' : mood} />
      <div className={s.text}>
        <div className={s.name}>{tag.nickname}</div>
        <div className={s.meta}>
          <span>{who}</span>
          <span className={s.dot} aria-hidden="true" />
          <span>{PERSONALITY_META[tag.personality].label}</span>
        </div>
        <div className={s.event}>
          {lastEvent ? (
            <>
              <span className={s.eventWord}>{EVENT_META[lastEvent.type].kidWords}</span>
              <span>· {formatRelative(lastEvent.at, now)}</span>
            </>
          ) : (
            <span>{tag.simulated ? 'Demo tag · try it in the playground' : 'No activity yet'}</span>
          )}
        </div>
      </div>
      <div className={s.side}>
        <BatteryPill percent={tag.info?.battery} charging={tag.info?.charging} />
        {muted && <BellOff size={16} className={s.muted} aria-label="Muted" />}
      </div>
    </Card>
  )
}
