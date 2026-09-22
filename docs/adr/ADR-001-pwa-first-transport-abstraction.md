# ADR‑001: PWA first, with a transport abstraction; iOS via Capacitor at v1.1
**Status:** accepted · 2026‑09‑22

## Context
The founder wants the mobile app as a PWA first. The tag talks BLE. Web Bluetooth is available in Chrome/Edge on Android, ChromeOS, Windows, macOS — **but not in iOS Safari** (WebKit does not ship it). iOS is roughly half of the US parent market.

## Decision
1. Build the app as an installable, offline‑first PWA.
2. Put every tag interaction behind `TagTransport` (`app/src/transport/types.ts`). Ship `WebBluetoothTransport` and `SimulatedTransport` (demo mode) in v1.0.
3. For iOS, wrap the **same** codebase in Capacitor with `@capacitor-community/bluetooth-le` (`CapacitorTransport`) at v1.1 and publish to the App Store (Kids Category rules: no third‑party analytics/ads — we already comply). Android also gets a Play listing via the PWA (TWA) or Capacitor.
4. iOS Safari users of the web app get Demo mode plus a clear "get the app" path; nothing is hidden or broken.

## Consequences
- One UI codebase, three transports. Features never import a concrete transport.
- We accept that iOS pairing is not possible from Safari in v1.0 and plan v1.1 immediately after.
- Alternative rejected: audio/optical provisioning (needs mic/photodiode, fragile, no path for events back to the app).
