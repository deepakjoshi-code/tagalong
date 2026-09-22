import { PERSONALITY_META } from '@/domain/personalities'
import type { AgeBand, Personality } from '@/domain/types'

/**
 * In-app phrase previews using the browser's own speech synthesis.
 *
 * PRIVACY: some platforms ship *network* voices, which would send the preview
 * text to the OS vendor's servers. Tagalong promises nothing leaves the device,
 * so we only ever speak through a voice whose `localService` is true. If the
 * device has no local English voice we stay silent and say why, rather than
 * quietly breaking the promise.
 */
export const hasSpeechApi = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

const PREFERRED = [
  'Samantha',
  'Karen',
  'Moira',
  'Daniel',
  'Google US English',
  'Google UK English Female',
  'Microsoft Aria',
  'Microsoft Zira',
]

let cached: SpeechSynthesisVoice | null | undefined

/** The best on-device English voice, or null if the device only offers network voices. */
export function pickLocalVoice(): SpeechSynthesisVoice | null {
  if (!hasSpeechApi()) return null
  if (cached !== undefined) return cached
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null // not loaded yet — leave the cache unset and retry later
  const local = voices.filter((v) => v.localService)
  const english = local.filter((v) => v.lang.toLowerCase().startsWith('en'))
  const pool = english.length > 0 ? english : local
  const preferred = PREFERRED.map((n) => pool.find((v) => v.name.includes(n))).find(Boolean)
  cached = preferred ?? pool.find((v) => v.default) ?? pool[0] ?? null
  return cached
}

if (hasSpeechApi()) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cached = undefined
  })
}

/** True when we can preview a line without any network voice being involved. */
export const canSpeak = (): boolean => hasSpeechApi() && pickLocalVoice() !== null

/** Why previews are unavailable, for UI copy. */
export function speechUnavailableReason(): 'none' | 'no-api' | 'no-local-voice' {
  if (!hasSpeechApi()) return 'no-api'
  if (pickLocalVoice() === null) return 'no-local-voice'
  return 'none'
}

export const SPEECH_UNAVAILABLE_COPY: Record<'no-api' | 'no-local-voice', string> = {
  'no-api': 'This browser can’t preview voices. Your tag still will.',
  'no-local-voice':
    'This device only has online voices, and Tagalong never sends text to the internet. Your tag still speaks.',
}

export interface SpeakOptions {
  ageBand: AgeBand
  personality: Personality
  volume?: number // 0–1
}

export function stopSpeaking() {
  if (hasSpeechApi()) window.speechSynthesis.cancel()
}

/** Resolves when the utterance finishes, or immediately when no local voice is available. */
export function speak(text: string, opts: SpeakOptions): Promise<void> {
  const voice = pickLocalVoice()
  if (!voice) return Promise.resolve()
  return new Promise((resolve) => {
    stopSpeaking()
    const u = new SpeechSynthesisUtterance(text)
    const tuning = PERSONALITY_META[opts.personality].speech
    const bandRate = opts.ageBand === 'little' ? 0.92 : opts.ageBand === 'big' ? 1.04 : 1
    u.rate = Math.min(2, Math.max(0.5, tuning.rate * bandRate))
    u.pitch = Math.min(2, Math.max(0, tuning.pitch))
    u.volume = opts.volume ?? 1
    u.voice = voice
    u.lang = voice.lang
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}
