import { useEffect, type ReactNode } from 'react'
import { Toaster } from '@/design/components'
import { useHydrated, useStore } from '@/domain/store'
import { installBackgroundDisconnect } from '@/transport/manager'
import { Splash } from './Splash'
import { useLiveTagEvents } from './useLiveTagEvents'

export function Providers({ children }: { children: ReactNode }) {
  const hydrated = useHydrated()
  const appearance = useStore((s) => s.settings.appearance)

  useLiveTagEvents()

  useEffect(() => {
    const root = document.documentElement
    if (appearance === 'system') delete root.dataset.theme
    else root.dataset.theme = appearance
  }, [appearance])

  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && useStore.getState().pruneEvents()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => installBackgroundDisconnect(), [])

  if (!hydrated) return <Splash />
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
