import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const subscribers = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    subscribers.forEach((s) => s())
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    subscribers.forEach((s) => s())
  })
}

export const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true)

export function useInstallPrompt() {
  const [, bump] = useState(0)
  useEffect(() => {
    const cb = () => bump((n) => n + 1)
    subscribers.add(cb)
    return () => {
      subscribers.delete(cb)
    }
  }, [])
  return {
    canInstall: !!deferred && !isStandalone(),
    installed: isStandalone(),
    install: async (): Promise<boolean> => {
      if (!deferred) return false
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') deferred = null
      subscribers.forEach((s) => s())
      return outcome === 'accepted'
    },
  }
}
