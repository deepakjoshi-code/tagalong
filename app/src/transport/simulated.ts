import type { TagEventType } from '@/domain/types'
import { TransportError } from './errors'
import type {
  ControlOp,
  DiscoveredTag,
  TagConfig,
  TagConnection,
  TagEventFrame,
  TagInfoFrame,
  TagTransport,
} from './types'

/**
 * A fully in-memory "tag" used for Demo mode and for browsers without Web Bluetooth.
 * It behaves like real firmware from the app's point of view: config round-trips,
 * events arrive as frames, battery drifts down, mute/identify work.
 */
export interface SimulatedControlEvent {
  deviceId: string
  op: ControlOp
}

type Listener<T> = (v: T) => void

export class SimulatedTagDevice {
  readonly deviceId: string
  readonly name: string
  config: TagConfig | null = null
  battery = 86
  charging = false
  mutedUntilUptimeSec = 0
  readonly bootedAt: number
  private eventListeners = new Set<Listener<TagEventFrame>>()
  private batteryListeners = new Set<Listener<number>>()
  private controlListeners = new Set<Listener<ControlOp>>()

  constructor(deviceId: string, name: string, now: number) {
    this.deviceId = deviceId
    this.name = name
    this.bootedAt = now
  }

  uptimeSec(now = Date.now()): number {
    return Math.max(0, Math.floor((now - this.bootedAt) / 1000))
  }

  info(now = Date.now()): TagInfoFrame {
    return {
      fw: { major: 0, minor: 9, patch: 0 },
      hwRev: 1,
      packId: 1,
      packVersion: 1,
      battery: this.battery,
      uptimeMin: Math.floor(this.uptimeSec(now) / 60),
      charging: this.charging,
      muted: this.mutedUntilUptimeSec > this.uptimeSec(now),
      nameClipPresent: !!this.config?.flags.nameClipPresent,
    }
  }

  /** Fire a physical event as if the sensors detected it. */
  emit(type: TagEventType, aux = 0, now = Date.now()): TagEventFrame {
    this.battery = Math.max(3, this.battery - (type === 'drop' ? 0.2 : 0.05))
    const frame: TagEventFrame = {
      version: 1,
      type,
      uptimeSec: this.uptimeSec(now),
      battery: Math.round(this.battery),
      aux,
    }
    this.eventListeners.forEach((l) => l(frame))
    this.batteryListeners.forEach((l) => l(frame.battery))
    return frame
  }

  control(op: ControlOp, now = Date.now()) {
    if (op.op === 'mute') this.mutedUntilUptimeSec = op.minutes > 0 ? this.uptimeSec(now) + op.minutes * 60 : 0
    if (op.op === 'factoryReset') this.config = null
    this.controlListeners.forEach((l) => l(op))
  }

  onEvent(cb: Listener<TagEventFrame>) {
    this.eventListeners.add(cb)
    return () => this.eventListeners.delete(cb)
  }
  onBattery(cb: Listener<number>) {
    this.batteryListeners.add(cb)
    return () => this.batteryListeners.delete(cb)
  }
  onControl(cb: Listener<ControlOp>) {
    this.controlListeners.add(cb)
    return () => this.controlListeners.delete(cb)
  }
}

/** Module-level registry so the Demo playground can poke the same device the app paired. */
const registry = new Map<string, SimulatedTagDevice>()
let counter = 0

export function getOrCreateSimulatedDevice(deviceId?: string): SimulatedTagDevice {
  if (deviceId) {
    const existing = registry.get(deviceId)
    if (existing) return existing
    const revived = new SimulatedTagDevice(deviceId, 'Tagalong (demo)', Date.now())
    registry.set(deviceId, revived)
    return revived
  }
  counter += 1
  const id = `sim-${counter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const dev = new SimulatedTagDevice(id, 'Tagalong (demo)', Date.now())
  registry.set(id, dev)
  return dev
}

export const isSimulatedDeviceId = (id: string) => id.startsWith('sim-')

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

class SimulatedConnection implements TagConnection {
  connected = true
  private disconnectListeners = new Set<() => void>()
  constructor(private readonly dev: SimulatedTagDevice) {}

  get deviceId() {
    return this.dev.deviceId
  }
  private assertConnected() {
    if (!this.connected) throw new TransportError('disconnected', 'Simulated tag is disconnected')
  }
  async readInfo() {
    this.assertConnected()
    await wait(120)
    return this.dev.info()
  }
  async readConfig() {
    this.assertConnected()
    await wait(80)
    return this.dev.config
  }
  async writeConfig(cfg: TagConfig) {
    this.assertConnected()
    await wait(350)
    this.dev.config = cfg
  }
  async control(op: ControlOp) {
    this.assertConnected()
    await wait(60)
    this.dev.control(op)
  }
  onEvent(cb: (frame: TagEventFrame) => void) {
    return this.dev.onEvent(cb)
  }
  onBattery(cb: (p: number) => void) {
    return this.dev.onBattery(cb)
  }
  onDisconnect(cb: () => void) {
    this.disconnectListeners.add(cb)
    return () => this.disconnectListeners.delete(cb)
  }
  async disconnect() {
    if (!this.connected) return
    this.connected = false
    this.disconnectListeners.forEach((l) => l())
  }
}

export class SimulatedTransport implements TagTransport {
  readonly kind = 'simulated' as const
  isAvailable() {
    return true
  }
  async requestTag(): Promise<DiscoveredTag> {
    await wait(900) // feels like a scan
    const dev = getOrCreateSimulatedDevice()
    return { deviceId: dev.deviceId, name: dev.name, simulated: true }
  }
  async connect(deviceId: string): Promise<TagConnection> {
    await wait(250)
    return new SimulatedConnection(getOrCreateSimulatedDevice(deviceId))
  }
}
