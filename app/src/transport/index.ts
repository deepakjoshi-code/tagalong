import { TransportError } from './errors'
import { SimulatedTransport, isSimulatedDeviceId } from './simulated'
import { WebBluetoothTransport, isWebBluetoothSupported } from './webBluetooth'
import type { TagTransport } from './types'

export type TransportReason = 'demo' | 'unsupported' | 'bluetooth'

const simulated = new SimulatedTransport()
let webBluetooth: WebBluetoothTransport | null = null

/**
 * Picks the transport for the current situation.
 * - Demo mode → simulated (always).
 * - No Web Bluetooth (iOS Safari, Firefox) → simulated, with `reason: 'unsupported'` so the UI explains.
 * - Otherwise → Web Bluetooth.
 */
export function getTransport(opts: { demoMode: boolean }): { transport: TagTransport; reason: TransportReason } {
  if (opts.demoMode) return { transport: simulated, reason: 'demo' }
  if (!isWebBluetoothSupported()) return { transport: simulated, reason: 'unsupported' }
  webBluetooth ??= new WebBluetoothTransport()
  return { transport: webBluetooth, reason: 'bluetooth' }
}

/**
 * Routes a reconnect by the kind of tag, never by the app's demo setting.
 *
 * Demo mode must never silently divert a real tag to the in-memory fake: the
 * parent would see settings "saved", a battery level and quiet hours that the
 * physical tag on their child's bottle knows nothing about.
 */
export function transportForDevice(deviceId: string, opts: { demoMode: boolean }): TagTransport {
  if (isSimulatedDeviceId(deviceId)) return simulated
  if (!isWebBluetoothSupported()) {
    throw new TransportError(
      'unsupported',
      'This browser cannot reach a real tag. Open Tagalong in Chrome on Android.',
    )
  }
  webBluetooth ??= new WebBluetoothTransport()
  void opts
  return webBluetooth
}

export { isWebBluetoothSupported, isSimulatedDeviceId }
export * from './types'
export * from './errors'
