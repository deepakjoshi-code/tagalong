import { PERSONALITY_META } from '@/domain/personalities'
import type { AgeBand, Personality } from '@/domain/types'

/**
 * In-app phrase previews using the browser's own speech synthesis.
 * Runs entirely on the device — the text never leaves the phone.
 */
export const canSpeak = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

const PREFERRED = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Google UK English Female', 'Microsoft Aria', 'Microsoft Zira']

let cachedVoice: SpeechSynthesisVoice | null | undefined

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null // not loaded yet; leave cache unset
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  const preferred = PREFERRED.map((n) => english.find((v) => v.name.includes(n))).find(Boolean)
  cachedVoice = preferred ?? english.find((v) => v.default) ?? english[0] ?? voices[0] ?? null
  return cachedVoice
}

if (canSpeak()) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined
  })
}

export interface SpeakOptions {
  ageBand: AgeBand
  personality: Personality
  volume?: number // 0–1
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel()
}

/** Resolves when the utterance finishes (or immediately if speech is unsupported). */
export function speak(text: string, opts: SpeakOptions): Promise<void> {
  if (!canSpeak()) return Promise.resolve()
  return new Promise((resolve) => {
    stopSpeaking()
    const u = new SpeechSynthesisUtterance(text)
    const tuning = PERSONALITY_META[opts.personality].speech
    const bandRate = opts.ageBand === 'little' ? 0.92 : opts.ageBand === 'big' ? 1.04 : 1
    u.rate = Math.min(2, Math.max(0.5, tuning.rate * bandRate))
    u.pitch = Math.min(2, Math.max(0, tuning.pitch))
    u.volume = opts.volume ?? 1
    const voice = pickVoice()
    if (voice) {
      u.voice = voice
      u.lang = voice.lang
    } else {
      u.lang = 'en-US'
    }
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}
