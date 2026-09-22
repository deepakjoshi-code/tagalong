import type { StoreData } from '@/domain/store'

export interface ExportBundle {
  app: 'tagalong'
  format: 1
  exportedAt: string
  note: string
  data: Pick<StoreData, 'kids' | 'tags' | 'events' | 'settings'>
}

export function buildExport(s: StoreData, now = new Date()): ExportBundle {
  return {
    app: 'tagalong',
    format: 1,
    exportedAt: now.toISOString(),
    note: 'This file was created on your device by the Tagalong app. Name clips (audio) are not included.',
    data: { kids: s.kids, tags: s.tags, events: s.events, settings: s.settings },
  }
}

export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
