import type { AgeBand, Personality, TagEventType, ThingType } from '@/domain/types'

export type WireLanguage = 'en' | 'es' | 'hi'

export interface TagConfig {
  version: 1
  ageBand: AgeBand
  thing: ThingType
  personality: Personality
  /** 0–100; the tag maps this onto a hard SPL cap. */
  volume: number
  quiet: { enabled: boolean; startMin: number; endMin: number }
  school: { enabled: boolean; startMin: number; endMin: number; days: number }
  language: WireLanguage
  flags: { nudges: boolean; eventBuffer: boolean; nameClipPresent: boolean; led: boolean }
  /** utterances per hour, 1–30 */
  maxPerHour: number
  /** app's local minutes since midnight at write time */
  timeOfDayMin: number
}

export interface TagInfoFrame {
  fw: { major: number; minor: number; patch: number }
  hwRev: number
  packId: number
  packVersion: number
  battery: number
  uptimeMin: number
  charging: boolean
  muted: boolean
  nameClipPresent: boolean
}

export interface TagEventFrame {
  version: 1
  type: TagEventType
  uptimeSec: number
  battery: number
  aux: number
}

export type ControlOp =
  | { op: 'identify' }
  | { op: 'preview'; event: TagEventType }
  | { op: 'mute'; minutes: number }
  | { op: 'setTime'; minutes: number; dayOfWeek?: number }
  | { op: 'factoryReset' }
  | { op: 'enterDfu' }

export interface DiscoveredTag {
  deviceId: string
  name: string
  simulated?: boolean
}

export type TransportKind = 'web-bluetooth' | 'simulated' | 'capacitor'

export interface TagConnection {
  readonly deviceId: string
  readonly connected: boolean
  readInfo(): Promise<TagInfoFrame>
  readConfig(): Promise<TagConfig | null>
  writeConfig(cfg: TagConfig): Promise<void>
  control(op: ControlOp): Promise<void>
  onEvent(cb: (frame: TagEventFrame) => void): () => void
  onBattery(cb: (percent: number) => void): () => void
  onDisconnect(cb: () => void): () => void
  disconnect(): Promise<void>
}

export interface TagTransport {
  readonly kind: TransportKind
  isAvailable(): boolean
  /** Must be called from a user gesture. Shows the platform chooser (or the demo list). */
  requestTag(): Promise<DiscoveredTag>
  /** Reconnect to a previously paired tag by id. */
  connect(deviceId: string): Promise<TagConnection>
}
