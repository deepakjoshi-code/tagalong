/**
 * Asks the browser to keep our IndexedDB data instead of evicting it under
 * storage pressure. Must be called from a user gesture on some browsers.
 * Purely local — it grants no new access, it only protects what is already here.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false
  try {
    if (await navigator.storage.persisted?.()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function isStoragePersisted(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persisted) return false
  try {
    return await navigator.storage.persisted()
  } catch {
    return false
  }
}

/** iOS Safari evicts unused web-app data after ~7 days unless installed to the Home Screen. */
export const isIosSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  return iOS && /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}
