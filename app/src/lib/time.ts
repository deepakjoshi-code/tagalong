export const MINUTE = 60_000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export function nowMinutesOfDay(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** "8:00 PM" style, honouring the user's locale. */
export function formatMinutesOfDay(min: number, locale?: string): string {
  const d = new Date(2000, 0, 1, Math.floor(min / 60) % 24, min % 60)
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(d)
}

/** "just now", "2 min ago", "3 hr ago", "yesterday", "Mon". */
export function formatRelative(ts: number, now = Date.now(), locale?: string): string {
  const diff = now - ts
  if (diff < 45_000) return 'just now'
  if (diff < HOUR) return `${Math.round(diff / MINUTE)} min ago`
  if (diff < DAY) return `${Math.round(diff / HOUR)} hr ago`
  if (diff < 2 * DAY) return 'yesterday'
  if (diff < 7 * DAY) return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(ts))
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date(ts))
}

export function formatTime(ts: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(ts))
}

export function isSameDay(a: number, b: number): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}
