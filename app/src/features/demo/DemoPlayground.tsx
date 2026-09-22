import { ArrowDownToLine, ArrowUpFromLine, Droplet, Hand, Package, Sparkles, Waves } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  ListGroup,
  NavBar,
  Screen,
  Segmented,
  ThingIcon,
  toast,
} from '@/design/components'
import { pickPhrase } from '@/content/pickPhrase'
import { AGE_BAND_META } from '@/domain/ageBands'
import { EVENT_META, type FaceMood } from '@/domain/events'
import { PERSONALITY_META } from '@/domain/personalities'
import { THING_META } from '@/domain/things'
import {
  AGE_BANDS,
  PERSONALITIES,
  THING_TYPES,
  type AgeBand,
  type Personality,
  type TagEventType,
  type ThingType,
} from '@/domain/types'
import { haptics } from '@/lib/haptics'
import { canSpeak, speak, stopSpeaking } from '@/lib/speech'
import { formatTime } from '@/lib/time'
import s from './DemoPlayground.module.css'

interface LogEntry {
  id: number
  type: TagEventType
  text: string
  at: number
}

const CONTROLS: { event: TagEventType; label: string; Icon: typeof Droplet }[] = [
  { event: 'filled', label: 'Fill', Icon: Droplet },
  { event: 'sip', label: 'Sip', Icon: Waves },
  { event: 'drop', label: 'Drop', Icon: ArrowDownToLine },
  { event: 'pickup', label: 'Pick up', Icon: ArrowUpFromLine },
  { event: 'shake', label: 'Shake', Icon: Hand },
  { event: 'tap', label: 'Tap', Icon: Sparkles },
]

export function DemoPlayground() {
  const [thing, setThing] = useState<ThingType>('bottle')
  const [ageBand, setAgeBand] = useState<AgeBand>('kid')
  const [personality, setPersonality] = useState<Personality>('silly')
  const [said, setSaid] = useState<string | null>(null)
  const [mood, setMood] = useState<FaceMood>('neutral')
  const [log, setLog] = useState<LogEntry[]>([])
  const recent = useRef<string[]>([])
  const seq = useRef(0)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    stopSpeaking()
    if (resetTimer.current) clearTimeout(resetTimer.current)
  }, [])

  const controls = useMemo(() => {
    const available = new Set(THING_META[thing].events)
    const base = CONTROLS.filter((c) => available.has(c.event))
    const extras: { event: TagEventType; label: string; Icon: typeof Droplet }[] = []
    if (available.has('opened')) extras.push({ event: 'opened', label: 'Open', Icon: Package })
    if (available.has('brush_done')) extras.push({ event: 'brush_done', label: 'Brush 2 min', Icon: Sparkles })
    if (available.has('left_behind')) extras.push({ event: 'left_behind', label: 'Left behind', Icon: Package })
    return [...extras, ...base]
  }, [thing])

  const fire = (event: TagEventType) => {
    const picked = pickPhrase({ thing, event, ageBand, personality, recent: recent.current })
    if (!picked) return
    recent.current = [...recent.current, picked.raw].slice(-4)
    seq.current += 1
    haptics.tap()
    setSaid(picked.text)
    setMood(EVENT_META[event].mood)
    setLog((l) => [{ id: seq.current, type: event, text: picked.text, at: Date.now() }, ...l].slice(0, 20))
    if (canSpeak()) void speak(picked.text, { ageBand, personality })
    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setMood('neutral'), 3200)
  }

  return (
    <Screen
      noTabBar
      top={<NavBar backTo="/tags" backLabel="Tags" />}
      subtitle="No tag needed. This phone plays the part."
      title="Playground"
    >
      <div className={s.stage} style={{ ['--thing-tint-soft' as string]: THING_META[thing].tintSoft }}>
        <ThingIcon thing={thing} size={148} mood={mood} bounce={mood === 'excited'} />
        <div className={s.bubble} role="status" aria-live="polite" data-testid="speech-bubble">
          {said ? `“${said}”` : <span className={s.placeholder}>Tap something below and listen.</span>}
        </div>
      </div>

      <div className={s.controls}>
        {controls.map(({ event, label, Icon }) => (
          <button key={event} type="button" className={s.control} onClick={() => fire(event)}>
            <Icon size={24} className={s.controlIcon} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className={s.pickers}>
        <div>
          <span className={s.pickerLabel}>Attached to</span>
          <div className={s.thingRow}>
            {THING_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={s.thingPick}
                aria-pressed={thing === t}
                aria-label={THING_META[t].label}
                onClick={() => {
                  setThing(t)
                  setSaid(null)
                  recent.current = []
                }}
              >
                <ThingIcon thing={t} size={48} soft={thing !== t} mood={thing === t ? 'happy' : null} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={s.pickerLabel}>Age · {AGE_BAND_META[ageBand].range}</span>
          <Segmented
            label="Age band"
            value={ageBand}
            onChange={(v) => {
              setAgeBand(v)
              recent.current = []
            }}
            options={AGE_BANDS.map((b) => ({ value: b, label: AGE_BAND_META[b].label }))}
          />
        </div>

        <div>
          <span className={s.pickerLabel}>Personality</span>
          <Segmented
            label="Personality"
            value={personality}
            onChange={(v) => {
              setPersonality(v)
              recent.current = []
            }}
            options={PERSONALITIES.map((p) => ({ value: p, label: PERSONALITY_META[p].label }))}
          />
        </div>
      </div>

      <ListGroup header="What happened" footer="Nothing here leaves your phone.">
        {log.length === 0 ? (
          <div className={s.empty}>Nothing yet.</div>
        ) : (
          <div className={s.log}>
            {log.map((e) => (
              <div key={e.id} className={s.logRow}>
                <span className={s.logDot} aria-hidden="true" />
                <span className={s.logText}>{EVENT_META[e.type].kidWords}</span>
                <span className={s.logTime}>{formatTime(e.at)}</span>
              </div>
            ))}
          </div>
        )}
      </ListGroup>

      {!canSpeak() && (
        <Button
          variant="tertiary"
          size="lg"
          block
          onClick={() => toast.show('This browser can’t speak, but the lines still show above.')}
        >
          Why can’t I hear anything?
        </Button>
      )}
    </Screen>
  )
}
