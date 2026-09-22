import type { AgeBand, Personality, QuietHours, ThingType } from '@/domain/types'

export interface WizardDraft {
  deviceId?: string
  deviceName?: string
  simulated: boolean
  kidId?: string
  newKidName: string
  newKidBand: AgeBand
  thing: ThingType
  personality: Personality
  nickname: string
  volume: number
  quiet: QuietHours
  nudges: boolean
}

export const WIZARD_STEPS = ['find', 'kid', 'thing', 'personality', 'sound', 'send'] as const
export type WizardStep = (typeof WIZARD_STEPS)[number]

export const STEP_LABELS: Record<WizardStep, string> = {
  find: 'Find your tag',
  kid: "Who's it for?",
  thing: "What's it on?",
  personality: 'Pick a personality',
  sound: 'Sound',
  send: 'All set',
}
