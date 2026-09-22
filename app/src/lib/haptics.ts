import { useStore } from '@/domain/store'

function vibrate(pattern: number | number[]) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  if (!useStore.getState().settings.haptics) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Some browsers throw when not triggered by a gesture; haptics are never essential.
  }
}

export const haptics = {
  tap: () => vibrate(8),
  select: () => vibrate(12),
  success: () => vibrate([10, 40, 10]),
  warning: () => vibrate([30, 40, 30]),
}
