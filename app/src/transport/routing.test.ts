import { describe, expect, it, vi } from 'vitest'

// Pretend this browser has no Web Bluetooth, which is iOS Safari's situation.
vi.mock('./webBluetooth', () => ({
  isWebBluetoothSupported: () => false,
  WebBluetoothTransport: class {
    readonly kind = 'web-bluetooth' as const
    isAvailable() {
      return false
    }
    requestTag() {
      return Promise.reject(new Error('unreachable'))
    }
    connect() {
      return Promise.reject(new Error('unreachable'))
    }
  },
}))

import { getTransport, transportForDevice } from './index'
import { isTransportError } from './errors'

describe('a real tag is never routed to the pretend one', () => {
  it('refuses to reconnect a real tag through the simulator, even in demo mode', () => {
    // Otherwise a parent sees settings "saved", a battery level and quiet hours
    // that the tag on their child's bottle knows nothing about.
    let thrown: unknown
    try {
      transportForDevice('real-device-abc', { demoMode: true })
    } catch (e) {
      thrown = e
    }
    expect(isTransportError(thrown)).toBe(true)
  })

  it('still routes a simulated tag to the simulator', () => {
    expect(transportForDevice('sim-abc', { demoMode: false }).kind).toBe('simulated')
  })

  it('reports why a search would not reach real hardware', () => {
    expect(getTransport({ demoMode: false }).reason).toBe('unsupported')
    expect(getTransport({ demoMode: true }).reason).toBe('demo')
  })
})
