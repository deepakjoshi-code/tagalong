import { useStore } from '@/domain/store'
import type { Kid, Tag } from '@/domain/types'
import { nowMinutesOfDay } from '@/lib/time'
import { formatFirmware } from './codec'
import { transportForDevice } from './index'
import type { TagConfig, TagConnection, TagEventFrame } from './types'

/**
 * Connection manager: one live connection per tag, events streamed into the store.
 * Features call these functions; they never touch a transport directly.
 */
const connections = new Map<string, TagConnection>()
const listeners = new Set<(tagId: string, frame: TagEventFrame) => void>()

export function buildTagConfig(tag: Pick<Tag, 'thing' | 'personality' | 'volume' | 'quiet' | 'nudges' | 'language'>, kid: Pick<Kid, 'ageBand' | 'nameClip'>): TagConfig {
  return {
    version: 1,
    ageBand: kid.ageBand,
    thing: tag.thing,
    personality: tag.personality,
    volume: tag.volume,
    quiet: { ...tag.quiet },
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
  attach(tag.id, conn)
  const info = await conn.readInfo()
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
  s.updateTag(tagId, { lastSyncAt: Date.now() })
}

export async function disconnectTag(tagId: string): Promise<void> {
  const c = connections.get(tagId)
  connections.delete(tagId)
  await c?.disconnect()
}

export async function disconnectAll(): Promise<void> {
  await Promise.all([...connections.keys()].map(disconnectTag))
}
