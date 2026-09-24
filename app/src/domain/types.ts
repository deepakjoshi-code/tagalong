import { z } from 'zod'

/** Age bands map to developmental stages (ADR-006). */
export const AGE_BANDS = ['little', 'kid', 'big'] as const
export const AgeBandSchema = z.enum(AGE_BANDS)
export type AgeBand = z.infer<typeof AgeBandSchema>

export const PERSONALITIES = ['silly', 'sweet', 'brave'] as const
export const PersonalitySchema = z.enum(PERSONALITIES)
export type Personality = z.infer<typeof PersonalitySchema>

export const THING_TYPES = [
  'bottle',
  'lunchbox',
  'backpack',
  'toothbrush',
  'shoes',
  'plush',
  'helmet',
  'jacket',
  'other',
] as const
export const ThingTypeSchema = z.enum(THING_TYPES)
export type ThingType = z.infer<typeof ThingTypeSchema>

export const TAG_EVENT_TYPES = [
  // common
  'pickup',
  'putdown',
  'drop',
  'shake',
  'tap',
  'long_still',
  'good_morning',
  'low_battery',
  'charging',
  // bottle
  'filled',
  'sip',
  'empty',
  // lunchbox
  'opened',
  'closed',
  'packed',
  // backpack
  'left_behind',
  'zipped',
  // toothbrush
  'brush_start',
  'brush_done',
  'brush_short',
] as const
export const TagEventTypeSchema = z.enum(TAG_EVENT_TYPES)
export type TagEventType = z.infer<typeof TagEventTypeSchema>

export const LANGUAGES = ['en'] as const
export const LanguageSchema = z.enum(LANGUAGES)
export type Language = z.infer<typeof LanguageSchema>

export const NameClipSchema = z.object({
  blobKey: z.string().min(1),
  durationMs: z.number().int().nonnegative(),
})
export type NameClip = z.infer<typeof NameClipSchema>

export const KidSchema = z.object({
  id: z.string().min(1),
  /** Optional. Shown only on this phone; never sent to the tag as text. */
  displayName: z.string().trim().max(24).optional(),
  ageBand: AgeBandSchema,
  createdAt: z.number(),
  nameClip: NameClipSchema.optional(),
})
export type Kid = z.infer<typeof KidSchema>

export const QuietHoursSchema = z
  .object({
    enabled: z.boolean(),
    /** minutes since midnight, local time */
    startMin: z.number().int().min(0).max(1439),
    endMin: z.number().int().min(0).max(1439),
  })
  // A window whose start equals its end cannot express a duration. The tag
  // fails safe by treating it as "always quiet", which would silently mute a
  // family's tag, so it must never be storable in the first place.
  .refine((q) => !q.enabled || q.startMin !== q.endMin, {
    message: 'Quiet hours must start and end at different times',
  })
export type QuietHours = z.infer<typeof QuietHoursSchema>

/**
 * A second quiet window for the school day. Separate from night quiet hours so a
 * parent can switch it off in the holidays, and so it can carry its own weekday
 * mask. A bottle that chats in a classroom gets the product banned, not returned.
 */
export const SchoolHoursSchema = z
  .object({
    enabled: z.boolean(),
    startMin: z.number().int().min(0).max(1439),
    endMin: z.number().int().min(0).max(1439),
    /** bit0 = Monday … bit6 = Sunday. 0 means every day. */
    days: z.number().int().min(0).max(127),
  })
  .refine((s) => !s.enabled || s.startMin !== s.endMin, {
    message: 'School hours must start and end at different times',
  })
  // An empty mask reads as "every day" on both sides, which is the opposite of
  // what a parent who just unticked the last day intended.
  .refine((s) => !s.enabled || s.days !== 0, {
    message: 'Pick at least one school day',
  })
export type SchoolHours = z.infer<typeof SchoolHoursSchema>

export const WEEKDAYS_MASK = 0b0011111
export const ALL_DAYS_MASK = 0b1111111

export const TagInfoSchema = z.object({
  fw: z.string(),
  hw: z.number().int(),
  packId: z.number().int(),
  packVersion: z.number().int(),
  battery: z.number().int().min(0).max(100),
  charging: z.boolean().optional(),
})
export type TagInfo = z.infer<typeof TagInfoSchema>

export const TagSchema = z.object({
  id: z.string().min(1),
  /** Transport-level identifier (Web Bluetooth device id or simulated id). Not a serial number. */
  deviceId: z.string().min(1),
  nickname: z.string().trim().min(1).max(30),
  thing: ThingTypeSchema,
  kidId: z.string().min(1),
  personality: PersonalitySchema,
  volume: z.number().int().min(0).max(100),
  quiet: QuietHoursSchema,
  school: SchoolHoursSchema.optional(),
  nudges: z.boolean(),
  language: LanguageSchema,
  createdAt: z.number(),
  /** When the tag last accepted a config write. Absent means it never has. */
  lastSyncAt: z.number().optional(),
  /**
   * True when the parent has changed settings that have not reached the tag.
   * The store holds what the parent wants; this says whether the tag agrees.
   */
  pendingSync: z.boolean().optional(),
  /** A mute the parent asked for that has not been delivered to the tag yet. */
  pendingMuteMinutes: z.number().int().min(0).max(1440).optional(),
  info: TagInfoSchema.optional(),
  mutedUntil: z.number().optional(),
  simulated: z.boolean().optional(),
})
export type Tag = z.infer<typeof TagSchema>

export const TagEventSchema = z.object({
  id: z.string().min(1),
  tagId: z.string().min(1),
  type: TagEventTypeSchema,
  at: z.number(),
  intensity: z.number().optional(),
})
export type TagEvent = z.infer<typeof TagEventSchema>

export const AppearanceSchema = z.enum(['system', 'light', 'dark'])
export type Appearance = z.infer<typeof AppearanceSchema>

export const SettingsSchema = z.object({
  onboarded: z.boolean(),
  appearance: AppearanceSchema,
  haptics: z.boolean(),
  demoMode: z.boolean(),
  eventLogEnabled: z.boolean(),
  retentionDays: z.literal(7),
})
export type Settings = z.infer<typeof SettingsSchema>

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  appearance: 'system',
  haptics: true,
  demoMode: false,
  eventLogEnabled: true,
  retentionDays: 7,
}

export const DEFAULT_QUIET_HOURS: QuietHours = { enabled: true, startMin: 20 * 60, endMin: 7 * 60 }

/** Off by default; the wizard offers it, the parent chooses. */
export const DEFAULT_SCHOOL_HOURS: SchoolHours = {
  enabled: false,
  startMin: 8 * 60 + 30,
  endMin: 15 * 60 + 30,
  days: WEEKDAYS_MASK,
}

export const PersistedStateSchema = z.object({
  kids: z.array(KidSchema),
  tags: z.array(TagSchema),
  events: z.array(TagEventSchema),
  settings: SettingsSchema,
})
export type PersistedState = z.infer<typeof PersistedStateSchema>
