import { decodeConfig, decodeEvent, decodeInfo, encodeConfig, encodeControl } from './codec'
import { TransportError } from './errors'
import type { ControlOp, DiscoveredTag, TagConfig, TagConnection, TagEventFrame, TagInfoFrame, TagTransport } from './types'
import { CHAR_BATTERY, CHAR_CONFIG, CHAR_CONTROL, CHAR_EVENT, CHAR_INFO, TAGALONG_SERVICE } from './uuids'

export const isWebBluetoothSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'bluetooth' in navigator && !!navigator.bluetooth

function toTransportError(e: unknown, fallback: TransportError['code'] = 'gatt'): TransportError {
  if (e instanceof TransportError) return e
  if (e instanceof DOMException) {
    if (e.name === 'NotFoundError') return new TransportError('cancelled', 'No device chosen', { cause: e })
    if (e.name === 'SecurityError' || e.name === 'NotAllowedError')
      return new TransportError('permission', 'Bluetooth permission denied', { cause: e })
    if (e.name === 'NetworkError') return new TransportError('disconnected', 'GATT operation failed', { cause: e })
  }
  return new TransportError(fallback, e instanceof Error ? e.message : 'Bluetooth error', { cause: e })
}

class WebBluetoothConnection implements TagConnection {
  connected = true
  private eventListeners = new Set<(f: TagEventFrame) => void>()
  private batteryListeners = new Set<(p: number) => void>()
  private disconnectListeners = new Set<() => void>()

  private constructor(
    private readonly device: BluetoothDevice,
    private readonly chars: {
      config: BluetoothRemoteGATTCharacteristic
      info: BluetoothRemoteGATTCharacteristic
      event: BluetoothRemoteGATTCharacteristic
      battery: BluetoothRemoteGATTCharacteristic
      control: BluetoothRemoteGATTCharacteristic
    },
  ) {
    device.addEventListener('gattserverdisconnected', this.handleDisconnected)
    chars.event.addEventListener('characteristicvaluechanged', this.handleEvent)
    chars.battery.addEventListener('characteristicvaluechanged', this.handleBattery)
  }

  static async open(device: BluetoothDevice): Promise<WebBluetoothConnection> {
    try {
      const server = await device.gatt?.connect()
      if (!server) throw new TransportError('gatt', 'No GATT server')
      const service = await server.getPrimaryService(TAGALONG_SERVICE)
      const [config, info, event, battery, control] = await Promise.all([
        service.getCharacteristic(CHAR_CONFIG),
        service.getCharacteristic(CHAR_INFO),
        service.getCharacteristic(CHAR_EVENT),
        service.getCharacteristic(CHAR_BATTERY),
        service.getCharacteristic(CHAR_CONTROL),
      ])
      const conn = new WebBluetoothConnection(device, { config, info, event, battery, control })
      await event.startNotifications()
      await battery.startNotifications().catch(() => undefined)
      return conn
    } catch (e) {
      throw toTransportError(e)
    }
  }

  get deviceId() {
    return this.device.id
  }

  private handleDisconnected = () => {
    this.connected = false
    this.disconnectListeners.forEach((l) => l())
  }
  private handleEvent = (ev: Event) => {
    const value = (ev.target as BluetoothRemoteGATTCharacteristic).value
    if (!value) return
    try {
      const frame = decodeEvent(value)
      this.eventListeners.forEach((l) => l(frame))
    } catch {
      // A malformed frame is dropped; firmware bugs must not crash the app.
    }
  }
  private handleBattery = (ev: Event) => {
    const value = (ev.target as BluetoothRemoteGATTCharacteristic).value
    if (!value || value.byteLength < 1) return
    const pct = Math.min(100, value.getUint8(0))
    this.batteryListeners.forEach((l) => l(pct))
  }

  async readInfo(): Promise<TagInfoFrame> {
    try {
      return decodeInfo(await this.chars.info.readValue())
    } catch (e) {
      throw toTransportError(e)
    }
  }
  async readConfig(): Promise<TagConfig | null> {
    try {
      const v = await this.chars.config.readValue()
      if (v.byteLength === 0) return null
      return decodeConfig(v)
    } catch (e) {
      const te = toTransportError(e)
      if (te.code === 'bad-frame') return null
      throw te
    }
  }
  async writeConfig(cfg: TagConfig): Promise<void> {
    try {
      const bytes = encodeConfig(cfg)
      await this.chars.config.writeValueWithResponse(bytes.buffer as ArrayBuffer)
    } catch (e) {
      throw toTransportError(e)
    }
  }
  async control(op: ControlOp): Promise<void> {
    try {
      const bytes = encodeControl(op)
      await this.chars.control.writeValueWithResponse(bytes.buffer as ArrayBuffer)
    } catch (e) {
      throw toTransportError(e)
    }
  }
  onEvent(cb: (f: TagEventFrame) => void) {
    this.eventListeners.add(cb)
    return () => this.eventListeners.delete(cb)
  }
  onBattery(cb: (p: number) => void) {
    this.batteryListeners.add(cb)
    return () => this.batteryListeners.delete(cb)
  }
  onDisconnect(cb: () => void) {
    this.disconnectListeners.add(cb)
    return () => this.disconnectListeners.delete(cb)
  }
  async disconnect() {
    this.device.removeEventListener('gattserverdisconnected', this.handleDisconnected)
    this.chars.event.removeEventListener('characteristicvaluechanged', this.handleEvent)
    this.chars.battery.removeEventListener('characteristicvaluechanged', this.handleBattery)
    if (this.device.gatt?.connected) this.device.gatt.disconnect()
    this.connected = false
  }
}

export class WebBluetoothTransport implements TagTransport {
  readonly kind = 'web-bluetooth' as const
  /** Devices chosen in this page session, by id (Web Bluetooth ids are per-origin, not MACs). */
  private known = new Map<string, BluetoothDevice>()

  isAvailable() {
    return isWebBluetoothSupported()
  }

  async requestTag(): Promise<DiscoveredTag> {
    if (!this.isAvailable()) throw new TransportError('unsupported', 'Web Bluetooth unavailable')
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [TAGALONG_SERVICE] }],
        optionalServices: [TAGALONG_SERVICE, 'battery_service', 'device_information'],
      })
      this.known.set(device.id, device)
      return { deviceId: device.id, name: device.name ?? 'Tagalong' }
    } catch (e) {
      throw toTransportError(e, 'cancelled')
    }
  }

  private async findDevice(deviceId: string): Promise<BluetoothDevice> {
    const cached = this.known.get(deviceId)
    if (cached) return cached
    // Chrome exposes previously permitted devices via getDevices() (permissions backend).
    const getDevices = (navigator.bluetooth as { getDevices?: () => Promise<BluetoothDevice[]> }).getDevices
    if (typeof getDevices === 'function') {
      const devices = await getDevices.call(navigator.bluetooth)
      const match = devices.find((d) => d.id === deviceId)
      if (match) {
        this.known.set(match.id, match)
        return match
      }
    }
    throw new TransportError('not-found', 'Tag not available; pair it again from the chooser')
  }

  async connect(deviceId: string): Promise<TagConnection> {
    if (!this.isAvailable()) throw new TransportError('unsupported', 'Web Bluetooth unavailable')
    const device = await this.findDevice(deviceId)
    return WebBluetoothConnection.open(device)
  }
}
