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

/** Route a reconnect to the right transport based on the stored device id. */
export function transportForDevice(deviceId: string, opts: { demoMode: boolean }): TagTransport {
  if (isSimulatedDeviceId(deviceId)) return simulated
  return getTransport(opts).transport
}

export { isWebBluetoothSupported, isSimulatedDeviceId }
export * from './types'
export * from './errors'
