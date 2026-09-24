import { BellOff, Play, RefreshCw, Shuffle, Sparkles, Trash2, Volume1, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  BatteryPill,
  Button,
  Chip,
  DayPicker,
  ListGroup,
  ListRow,
  NavBar,
  Screen,
  Sheet,
  Slider,
  ThingIcon,
  Toggle,
  toast,
} from '@/design/components'
import { samplePhrases } from '@/content/pickPhrase'
import { AGE_BAND_META } from '@/domain/ageBands'
import { EVENT_META } from '@/domain/events'
import { PERSONALITY_META } from '@/domain/personalities'
import { eventsForTag, isTagMuted, isWithinQuietHours } from '@/domain/selectors'
import { useStore } from '@/domain/store'
import { THING_META } from '@/domain/things'
import { DEFAULT_SCHOOL_HOURS, DEFAULT_SETTINGS, PERSONALITIES, type Personality } from '@/domain/types'
import { haptics } from '@/lib/haptics'
import { SPEECH_UNAVAILABLE_COPY, canSpeak, speak, speechUnavailableReason } from '@/lib/speech'
import { QUIET_STEP_MINUTES, formatMinutesOfDay, formatTime, mondayFirstDayOfWeek, nowMinutesOfDay, snapToQuietStep } from '@/lib/time'
import { describeTransportError } from '@/transport'
import { connectTag, disconnectTag, factoryResetTag, muteTagOnDevice, syncTagConfig } from '@/transport/manager'
import s from './TagDetail.module.css'

const timeValue = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
const parseTime = (v: string) => {
  const [h = '0', m = '0'] = v.split(':')
  return snapToQuietStep(Number(h) * 60 + Number(m))
}

export function TagDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  // Select raw slices only. Derived arrays must be memoised, never built inside a
  // selector, or useSyncExternalStore sees a new snapshot on every read.
  const tags = useStore((st) => st.tags)
  const kids = useStore((st) => st.kids)
  const allEvents = useStore((st) => st.events)
  const tag = useMemo(() => tags.find((t) => t.id === id), [tags, id])
  const kid = useMemo(() => (tag ? kids.find((k) => k.id === tag.kidId) : undefined), [kids, tag])
  const events = useMemo(
    () => (tag ? eventsForTag({ kids, tags, events: allEvents, settings: DEFAULT_SETTINGS }, tag.id) : []),
    [allEvents, kids, tags, tag],
  )
  const updateTag = useStore((st) => st.updateTag)
  const removeTag = useStore((st) => st.removeTag)
  const markTagDirty = useStore((st) => st.markTagDirty)
  const clearEvents = useStore((st) => st.clearEvents)

  const [shuffleKey, setShuffleKey] = useState(0)
  const [personalitySheet, setPersonalitySheet] = useState(false)
  const [forgetSheet, setForgetSheet] = useState(false)
  const [busy, setBusy] = useState(false)
  const [quietConfirm, setQuietConfirm] = useState<null | (() => Promise<void>)>(null)

  useEffect(() => {
    if (!tag) navigate('/tags', { replace: true })
  }, [tag, navigate])

  const lines = useMemo(() => {
    if (!tag || !kid) return []
    const meta = THING_META[tag.thing]
    const starEvent = meta.events.find((e) => EVENT_META[e].star) ?? 'pickup'
    return samplePhrases(
      { thing: tag.thing, event: starEvent, ageBand: kid.ageBand, personality: tag.personality, kidName: kid.displayName },
      3,
    )
    // shuffleKey deliberately re-rolls the sample
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, kid, shuffleKey])

  if (!tag || !kid) return null

  const meta = THING_META[tag.thing]
  const muted = isTagMuted(tag)
  const school = tag.school ?? DEFAULT_SCHOOL_HOURS

  const sync = async (label = 'Settings sent to the tag') => {
    setBusy(true)
    markTagDirty(tag.id)
    try {
      await syncTagConfig(tag.id)
      toast.success(label)
    } catch (e) {
      // The change stays saved as the parent's intent, but the tag has not
      // agreed to it, so say so rather than showing a success toast.
      toast.error(`${describeTransportError(e)} Saved here; it will reach the tag next time.`)
    } finally {
      setBusy(false)
    }
  }

  /**
   * Mute is the parent's emergency stop. It has to reach the tag, and if it
   * cannot, they have to be told rather than shown a reassuring toast.
   */
  const toggleMute = async () => {
    const minutes = muted ? 0 : 60
    setBusy(true)
    haptics.tap()
    try {
      await muteTagOnDevice(tag.id, minutes)
      toast.success(minutes === 0 ? `${tag.nickname} can talk again` : `${tag.nickname} is quiet for an hour`)
    } catch (e) {
      toast.error(`${tag.nickname} could not be reached, so it is still talking. ${describeTransportError(e)}`)
    } finally {
      setBusy(false)
    }
  }

  const identify = async () => {
    // Identify deliberately bypasses quiet hours on the tag, so the app is the
    // only thing standing between a sleeping child and a giggling bottle.
    if (isWithinQuietHours(tag, nowMinutesOfDay(), mondayFirstDayOfWeek())) {
      setQuietConfirm(() => identifyNow)
      return
    }
    await identifyNow()
  }

  const identifyNow = async () => {
    setQuietConfirm(null)
    setBusy(true)
    try {
      const conn = await connectTag(tag)
      await conn.control({ op: 'identify' })
      haptics.success()
      toast.success('Listen for a giggle')
    } catch (e) {
      toast.error(describeTransportError(e))
    } finally {
      setBusy(false)
    }
  }

  const sayNow = async (text: string) => {
    setQuietConfirm(null)
    await speak(text, { ageBand: kid.ageBand, personality: tag.personality, volume: tag.volume / 100 })
  }

  const say = async (text: string) => {
    if (!canSpeak()) {
      const reason = speechUnavailableReason()
      return reason === 'none' ? undefined : toast.show(SPEECH_UNAVAILABLE_COPY[reason])
    }
    if (isWithinQuietHours(tag, nowMinutesOfDay(), mondayFirstDayOfWeek())) {
      setQuietConfirm(() => () => sayNow(text))
      return
    }
    await sayNow(text)
  }

  const forget = async (alsoReset: boolean) => {
    if (alsoReset) {
      try {
        await factoryResetTag(tag.id)
      } catch {
        toast.show('Could not reach the tag to release it. Use the button instead.')
      }
    }
    await disconnectTag(tag.id)
    removeTag(tag.id)
    setForgetSheet(false)
    toast.show(`${tag.nickname} forgotten`)
    navigate('/tags', { replace: true })
  }

  return (
    <Screen noTabBar top={<NavBar title={tag.nickname} backTo="/tags" backLabel="Tags" />}>
      <div
        className={s.hero}
        style={{ ['--thing-tint-soft' as string]: meta.tintSoft }}
      >
        <ThingIcon thing={tag.thing} size={132} mood={muted ? 'sleepy' : 'happy'} />
        <h1 className={s.name}>{tag.nickname}</h1>
        <div className={s.meta}>
          <Chip>{kid.displayName || AGE_BAND_META[kid.ageBand].label}</Chip>
          <Chip>{AGE_BAND_META[kid.ageBand].range}</Chip>
          <Chip bg={meta.tintSoft} fg={meta.tint}>
            {meta.label}
          </Chip>
          <BatteryPill percent={tag.info?.battery} charging={tag.info?.charging} />
        </div>
      </div>

      <ListGroup header="Personality">
        <ListRow
          title="Personality"
          subtitle={PERSONALITY_META[tag.personality].blurb}
          value={PERSONALITY_META[tag.personality].label}
          onClick={() => setPersonalitySheet(true)}
          chevron
        />
      </ListGroup>

      <div className={s.lines}>
        <ListGroup
          header="Says things like…"
          footer="Tap a line to hear roughly how it sounds on this phone."
        >
          {lines.map((l) => (
            <ListRow
              key={l.raw}
              title={`“${l.text}”`}
              onClick={() => void say(l.text)}
              trailing={<Play size={18} className={s.play} aria-hidden="true" />}
              chevron={false}
              wrap
            />
          ))}
          <ListRow
            title="Show me others"
            icon={<Shuffle size={18} />}
            iconTint="var(--accent)"
            onClick={() => setShuffleKey((k) => k + 1)}
            chevron={false}
          />
        </ListGroup>
      </div>

      <ListGroup header="Sound" footer="Volume is hard-capped in the tag at a gentle indoor level.">
        <ListRow
          title={
            <div className={s.sliderRow}>
              <span className={s.sliderLabel}>Volume</span>
              <Slider
                label="Volume"
                value={tag.volume}
                onChange={(volume) => updateTag(tag.id, { volume })}
                onCommit={() => void sync('Volume updated')}
                leading={<Volume1 size={20} aria-hidden="true" />}
                trailing={<Volume2 size={20} aria-hidden="true" />}
              />
            </div>
          }
        />
        <ListRow
          title="Quiet hours"
          subtitle={
            tag.quiet.enabled
              ? `${formatMinutesOfDay(tag.quiet.startMin)} – ${formatMinutesOfDay(tag.quiet.endMin)}`
              : 'Off'
          }
          trailing={
            <Toggle
              label="Quiet hours"
              checked={tag.quiet.enabled}
              onChange={(enabled) => {
                updateTag(tag.id, { quiet: { ...tag.quiet, enabled } })
                void sync('Quiet hours updated')
              }}
            />
          }
        />
        {tag.quiet.enabled && (
          <>
            <ListRow
              title="Starts"
              trailing={
                <input
                  type="time"
                  step={QUIET_STEP_MINUTES * 60}
                  className={s.timeInput}
                  aria-label="Quiet hours start"
                  value={timeValue(tag.quiet.startMin)}
                  onChange={(e) => updateTag(tag.id, { quiet: { ...tag.quiet, startMin: parseTime(e.target.value) } })}
                  onBlur={() => void sync('Quiet hours updated')}
                />
              }
            />
            <ListRow
              title="Ends"
              trailing={
                <input
                  type="time"
                  step={QUIET_STEP_MINUTES * 60}
                  className={s.timeInput}
                  aria-label="Quiet hours end"
                  value={timeValue(tag.quiet.endMin)}
                  onChange={(e) => updateTag(tag.id, { quiet: { ...tag.quiet, endMin: parseTime(e.target.value) } })}
                  onBlur={() => void sync('Quiet hours updated')}
                />
              }
            />
          </>
        )}
        <ListRow
          title="Gentle nudges"
          subtitle="One soft reminder at most, never nagging"
          trailing={
            <Toggle
              label="Gentle nudges"
              checked={tag.nudges}
              onChange={(nudges) => {
                updateTag(tag.id, { nudges })
                void sync('Nudges updated')
              }}
            />
          }
        />
        <ListRow
          title={muted ? 'Unmute' : 'Mute for an hour'}
          subtitle={tag.pendingMuteMinutes !== undefined ? 'Waiting to reach the tag' : undefined}
          icon={<BellOff size={18} />}
          iconTint={muted ? 'var(--success)' : 'var(--text-3)'}
          onClick={() => void toggleMute()}
          disabled={busy}
          chevron={false}
        />
      </ListGroup>

      <ListGroup
        header="School hours"
        footer="During school hours the tag is completely silent. It still remembers what happened."
      >
        <ListRow
          title="Silent at school"
          subtitle={
            school.enabled
              ? `${formatMinutesOfDay(school.startMin)} – ${formatMinutesOfDay(school.endMin)}`
              : 'Off'
          }
          trailing={
            <Toggle
              label="Silent at school"
              checked={school.enabled}
              onChange={(enabled) => {
                updateTag(tag.id, { school: { ...school, enabled } })
                void sync('School hours updated')
              }}
            />
          }
        />
        {school.enabled && (
          <>
            <ListRow
              title="From"
              trailing={
                <input
                  type="time"
                  step={QUIET_STEP_MINUTES * 60}
                  className={s.timeInput}
                  aria-label="School hours start"
                  value={timeValue(school.startMin)}
                  onChange={(e) => updateTag(tag.id, { school: { ...school, startMin: parseTime(e.target.value) } })}
                  onBlur={() => void sync('School hours updated')}
                />
              }
            />
            <ListRow
              title="Until"
              trailing={
                <input
                  type="time"
                  step={QUIET_STEP_MINUTES * 60}
                  className={s.timeInput}
                  aria-label="School hours end"
                  value={timeValue(school.endMin)}
                  onChange={(e) => updateTag(tag.id, { school: { ...school, endMin: parseTime(e.target.value) } })}
                  onBlur={() => void sync('School hours updated')}
                />
              }
            />
            <ListRow
              title={
                <DayPicker
                  label="School days"
                  value={school.days}
                  onChange={(days) => {
                    updateTag(tag.id, { school: { ...school, days } })
                    void sync('School days updated')
                  }}
                />
              }
            />
          </>
        )}
      </ListGroup>

      <ListGroup
        header="Recent activity"
        footer="Kept on this phone for 7 days, then deleted automatically."
      >
        {events.length === 0 ? (
          <div className={s.empty}>Nothing yet. Give it a shake.</div>
        ) : (
          <div className={s.timeline}>
            {events.slice(0, 12).map((e) => (
              <div key={e.id} className={s.entry}>
                <span className={s.dot} aria-hidden="true" />
                <span className={s.entryText}>{EVENT_META[e.type].kidWords}</span>
                <span className={s.entryTime}>{formatTime(e.at)}</span>
              </div>
            ))}
          </div>
        )}
        {events.length > 0 && (
          <ListRow title="Clear activity" onClick={() => clearEvents(tag.id)} destructive center chevron={false} />
        )}
      </ListGroup>

      <ListGroup header="Tag">
        <ListRow title="Battery" value={tag.info ? `${tag.info.battery}%` : 'Unknown'} />
        <ListRow title="Firmware" value={tag.info?.fw ?? '—'} />
        <ListRow title="Content pack" value={tag.info ? `v${tag.info.packVersion}` : '—'} />
        <ListRow
          title="Make it giggle"
          subtitle="Finds the tag by sound and light"
          icon={<Sparkles size={18} />}
          onClick={() => void identify()}
          disabled={busy}
          chevron={false}
        />
        <ListRow
          title="Send settings again"
          icon={<RefreshCw size={18} />}
          iconTint="var(--text-3)"
          onClick={() => void sync()}
          disabled={busy}
          chevron={false}
        />
      </ListGroup>

      <ListGroup>
        <ListRow
          title="Forget this tag"
          icon={<Trash2 size={18} />}
          onClick={() => setForgetSheet(true)}
          destructive
          chevron={false}
        />
      </ListGroup>

      <Sheet
        open={personalitySheet}
        onClose={() => setPersonalitySheet(false)}
        title="Personality"
        subtitle="Changes what the tag says, straight away."
      >
        {PERSONALITIES.map((p: Personality) => (
          <ListRow
            key={p}
            title={PERSONALITY_META[p].label}
            subtitle={PERSONALITY_META[p].blurb}
            value={p === tag.personality ? '✓' : undefined}
            onClick={() => {
              updateTag(tag.id, { personality: p })
              setPersonalitySheet(false)
              setShuffleKey((k) => k + 1)
              void sync('Personality updated')
            }}
            chevron={false}
          />
        ))}
      </Sheet>

      <Sheet
        open={forgetSheet}
        onClose={() => setForgetSheet(false)}
        title={`Forget ${tag.nickname}?`}
        subtitle="Its settings and activity are deleted from this phone. This does not reset the tag: until it is released it stays paired to this phone and will not pair with another."
        footer={
          <>
            <Button size="lg" block variant="destructive" onClick={() => void forget(true)}>
              Forget and release the tag
            </Button>
            <Button size="lg" block variant="tertiary" onClick={() => void forget(false)}>
              Just forget it here
            </Button>
            <Button size="lg" block variant="ghost" onClick={() => setForgetSheet(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <p style={{ font: 'var(--text-footnote)', color: 'var(--text-2)' }}>
          If the tag is out of range, you can release it later: put it on the charger and hold its
          button for ten seconds.
        </p>
      </Sheet>

      <Sheet
        open={quietConfirm !== null}
        onClose={() => setQuietConfirm(null)}
        title="It’s quiet hours"
        subtitle={`${tag.nickname} is meant to be silent right now. Play anyway?`}
        footer={
          <>
            <Button size="lg" block onClick={() => void quietConfirm?.()}>
              Play anyway
            </Button>
            <Button size="lg" block variant="tertiary" onClick={() => setQuietConfirm(null)}>
              Not now
            </Button>
          </>
        }
      />
    </Screen>
  )
}
