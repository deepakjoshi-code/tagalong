import { del, get, keys, set } from 'idb-keyval'

/**
 * Optional "name clip": a ≤1.5 s recording of the kid's name made on the parent's phone,
 * stored only in this device's IndexedDB (and later on the tag). Never uploaded anywhere.
 */
const PREFIX = 'clip:'
export const MAX_CLIP_MS = 1500

export const clipKey = (kidId: string) => `${PREFIX}${kidId}`

export async function saveClip(kidId: string, blob: Blob): Promise<string> {
  const key = clipKey(kidId)
  await set(key, blob)
  return key
}

export const loadClip = (blobKey: string) => get<Blob>(blobKey)
export const deleteClip = (blobKey: string) => del(blobKey)

export async function deleteAllClips(): Promise<void> {
  const all = await keys()
  await Promise.all(all.filter((k) => typeof k === 'string' && k.startsWith(PREFIX)).map((k) => del(k)))
}

export const canRecord = (): boolean =>
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== 'undefined'

/** Records from the phone microphone for up to `maxMs`. Resolves with the audio blob and duration. */
export async function recordClip(maxMs = MAX_CLIP_MS): Promise<{ blob: Blob; durationMs: number }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((m) => MediaRecorder.isTypeSupported(m))
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
  const chunks: BlobPart[] = []
  const started = Date.now()
  return new Promise((resolve, reject) => {
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    rec.onerror = () => {
      stream.getTracks().forEach((t) => t.stop())
      reject(new Error('Recording failed'))
    }
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      resolve({ blob: new Blob(chunks, { type: rec.mimeType || 'audio/webm' }), durationMs: Date.now() - started })
    }
    rec.start()
    setTimeout(() => rec.state !== 'inactive' && rec.stop(), maxMs)
  })
}
