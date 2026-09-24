import { useStore } from '@/domain/store'
import { DEFAULT_SCHOOL_HOURS, type Kid, type Tag } from '@/domain/types'
import { mondayFirstDayOfWeek, nowMinutesOfDay } from '@/lib/time'
import { formatFirmware } from './codec'
import { transportForDevice } from './index'
import type { TagConfig, TagConnection, TagEventFrame } from './types'

/**
 * Connection manager: one live connection per tag, events streamed into the store.
 * Features call these functions; they never touch a transport directly.
 */
const connections = new Map<string, TagConnection>()
const listeners = new Set<(tagId: string, frame: TagEventFrame) => void>()
/** Last uptime seen per tag, so a reboot (uptime going backwards) is detectable. */
const lastUptime = new Map<string, number>()

export function buildTagConfig(
  tag: Pick<Tag, 'thing' | 'personality' | 'volume' | 'quiet' | 'school' | 'nudges' | 'language'>,
  kid: Pick<Kid, 'ageBand' | 'nameClip'>,
): TagConfig {
  return {
    version: 1,
    ageBand: kid.ageBand,
    thing: tag.thing,
    personality: tag.personality,
    volume: tag.volume,
    quiet: { ...tag.quiet },
    school: tag.school ? { ...tag.school } : { ...DEFAULT_SCHOOL_HOURS },
    language: tag.language,
    flags: { nudges: tag.nudges, eventBuffer: true, nameClipPresent: !!kid.nameClip, led: true },
    maxPerHour: 12,
    timeOfDayMin: nowMinutesOfDay(),
  }
}

export function getConnection(tagId: string): TagConnection | undefined {
  const c = connections.get(tagId)
  return c?.connected ? c : undefined
}

/** Subscribe to live events from any connected tag (for the demo face, toasts, speech). */
export function onAnyTagEvent(cb: (tagId: string, frame: TagEventFrame) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function attach(tagId: string, conn: TagConnection) {
  connections.set(tagId, conn)
  const offEvent = conn.onEvent((frame) => {
    const store = useStore.getState()
    store.logEvent(tagId, frame.type, Date.now(), frame.aux)
    const tag = store.tags.find((t) => t.id === tagId)
    if (tag?.info && tag.info.battery !== frame.battery) {
      store.updateTag(tagId, { info: { ...tag.info, battery: frame.battery } })
    }
    listeners.forEach((l) => l(tagId, frame))
  })
  const offBattery = conn.onBattery((battery) => {
    const store = useStore.getState()
    const tag = store.tags.find((t) => t.id === tagId)
    if (tag?.info) store.updateTag(tagId, { info: { ...tag.info, battery } })
  })
  conn.onDisconnect(() => {
    offEvent()
    offBattery()
    if (connections.get(tagId) === conn) connections.delete(tagId)
  })
}

/** Connect (or reuse) and refresh the stored info snapshot. */
export async function connectTag(tag: Tag): Promise<TagConnection> {
  const existing = getConnection(tag.id)
  if (existing) return existing
  const { demoMode } = useStore.getState().settings
  const transport = transportForDevice(tag.deviceId, { demoMode })
  const conn = await transport.connect(tag.deviceId)

  // Only cache the connection once it has proven itself: a link that cannot be
  // read is worse than no link, because it would be reused forever.
  let info: Awaited<ReturnType<TagConnection['readInfo']>>
  try {
    info = await conn.readInfo()
  } catch (e) {
    await conn.disconnect().catch(() => undefined)
    throw e
  }
  attach(tag.id, conn)

  // The tag has no real-time clock, so hand it the time of day on every connection.
  await conn
    .control({ op: 'setTime', minutes: nowMinutesOfDay(), dayOfWeek: mondayFirstDayOfWeek() })
    .catch(() => undefined)

  // Uptime going backwards means the tag rebooted and lost its settings, so push them again.
  const seen = lastUptime.get(tag.id)
  const rebooted = seen !== undefined && info.uptimeMin < seen
  lastUptime.set(tag.id, info.uptimeMin)

  useStore.getState().updateTag(tag.id, {
    lastSyncAt: Date.now(),
    info: {
      fw: formatFirmware(info.fw),
      hw: info.hwRev,
      packId: info.packId,
      packVersion: info.packVersion,
      battery: info.battery,
      charging: info.charging,
    },
  })
  if (rebooted) {
    const s = useStore.getState()
    const kid = s.kids.find((k) => k.id === tag.kidId)
    if (kid) await conn.writeConfig(buildTagConfig(tag, kid)).catch(() => undefined)
  }
  return conn
}

/** Push the current settings for a tag to the device. */
export async function syncTagConfig(tagId: string): Promise<void> {
  const s = useStore.getState()
  const tag = s.tags.find((t) => t.id === tagId)
  const kid = tag && s.kids.find((k) => k.id === tag.kidId)
  if (!tag || !kid) return
  const conn = await connectTag(tag)
  await conn.writeConfig(buildTagConfig(tag, kid))

  // A mute the parent asked for while the tag was unreachable rides along now.
  const pendingMute = useStore.getState().tags.find((t) => t.id === tagId)?.pendingMuteMinutes
  if (pendingMute !== undefined) {
    await conn.control({ op: 'mute', minutes: pendingMute })
    useStore.getState().updateTag(tagId, { pendingMuteMinutes: undefined })
  }

  // Only a write the tag accepted clears the flag. Until then the app shows the
  // parent's intent as pending, not as the tag's state.
  useStore.getState().markTagSynced(tagId)
}

/**
 * Mutes or unmutes on the tag itself, not just in the app.
 *
 * Mute is the parent's emergency stop. Recording it locally and telling them it
 * worked, while the tag carries on talking, is the worst failure this app can
 * have. If the tag is unreachable the request is queued and the caller is told.
 */
export async function muteTagOnDevice(tagId: string, minutes: number): Promise<void> {
  const s = useStore.getState()
  const tag = s.tags.find((t) => t.id === tagId)
  if (!tag) return
  try {
    const conn = await connectTag(tag)
    await conn.control({ op: 'mute', minutes })
    useStore.getState().updateTag(tagId, {
      mutedUntil: minutes > 0 ? Date.now() + minutes * 60_000 : undefined,
      pendingMuteMinutes: undefined,
    })
  } catch (e) {
    // Remember the intent so it is delivered the moment the tag is reachable,
    // and let the caller tell the truth about what just happened.
    useStore.getState().updateTag(tagId, { pendingMuteMinutes: minutes })
    throw e
  }
}

/** Sends a factory reset so the tag can be paired with another phone. */
export async function factoryResetTag(tagId: string): Promise<void> {
  const s = useStore.getState()
  const tag = s.tags.find((t) => t.id === tagId)
  if (!tag) return
  const conn = await connectTag(tag)
  await conn.control({ op: 'factoryReset' })
}

/** Re-pushes config to every tag belonging to a kid, e.g. after an age change. */
export async function syncTagsForKid(kidId: string): Promise<{ ok: number; failed: number }> {
  const tags = useStore.getState().tags.filter((t) => t.kidId === kidId)
  let ok = 0
  let failed = 0
  for (const t of tags) {
    try {
      await syncTagConfig(t.id)
      ok++
    } catch {
      useStore.getState().markTagDirty(t.id)
      failed++
    }
  }
  return { ok, failed }
}

export async function disconnectTag(tagId: string): Promise<void> {
  const c = connections.get(tagId)
  connections.delete(tagId)
  lastUptime.delete(tagId)
  await c?.disconnect()
}

export async function disconnectAll(): Promise<void> {
  await Promise.all([...connections.keys()].map(disconnectTag))
}

/**
 * Drops every live connection shortly after the app is backgrounded, so a tag is
 * never held open by an app the parent isn't looking at. Reconnects happen on demand.
 */
export function installBackgroundDisconnect(delayMs = 10_000): () => void {
  if (typeof document === 'undefined') return () => undefined
  let timer: ReturnType<typeof setTimeout> | null = null
  const onChange = () => {
    if (document.visibilityState === 'hidden') {
      timer = setTimeout(() => void disconnectAll(), delayMs)
    } else if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  document.addEventListener('visibilitychange', onChange)
  return () => {
    if (timer) clearTimeout(timer)
    document.removeEventListener('visibilitychange', onChange)
  }
}
