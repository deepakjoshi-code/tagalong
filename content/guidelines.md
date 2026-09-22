# Tagalong Content Guidelines

Every line here is spoken aloud by an object a child loves, possibly 30 times a day, often without a parent in the room. Write accordingly.

## 1. The matrix
`thing × event × age band × personality`, ≥4 distinct lines per cell. Packs live in `content/packs/*.json` and are consumed by both the app (`app/src/content`) and the firmware content build.

| Band | Ages | Max words | Vocabulary |
|---|---|---|---|
| `little` | 2–4 | 6 | Concrete nouns, repetition, spelled-out sounds. No idioms, no sarcasm, no abstractions. |
| `kid` | 5–7 | 10 | Sidekick energy, simple jokes, gentle wordplay. "Amigo", "buddy", "champ". |
| `big` | 8–12 | 12 | Dry wit, respect, no baby talk. Light self-deprecation. Never tries too hard. |

## 2. Personality bibles

**Silly** — the goofball. Traits: physical comedy, sound effects, puns, breaks the fourth wall, cheerfully wrong about facts. Never mean, never sarcastic at the child.
> "Glug glug! I am full!" · "I'm not a snow globe!" · "Boop. That's my whole personality."

**Sweet** — the warm friend. Traits: notices the child, says thank you, soft and unhurried, encouraging without pressure, present ("I'm right here").
> "All full. Thank you, {{name}}." · "No rush. Just saying hi." · "You take good care of me."

**Brave** — the hype squad of one. Traits: mission language, resilient after knocks, action verbs, treats the child as captain, never aggressive or competitive with other kids.
> "Full tank. Mission ready!" · "Bonk! Still standing, captain." · "Let's make it count."

Read three lines blind: a stranger should be able to name the personality.

## 3. Hard bans
Shame, guilt, fear, nagging. Food, body, weight or "healthy/unhealthy" judgements. "Good kid"/"bad kid". Commands phrased as threats. Brand names. Adult sarcasm aimed at the child. Anything hurtful if a child repeated it to another child. Bathroom humour beyond a single gentle burp or hiccup sound. Religion, politics, strangers, danger, injury drama. Anything that implies the tag can see, hear, or knows where the child is (it cannot — see ADR‑004 and ADR‑007).

## 4. Event-specific rules
- **drop** — a comic "ouch", never pain or fear. The object is fine within one sentence.
- **brush_short / empty / left_behind** — invitation, never nagging. Offer, don't demand. One line, then silence.
- **long_still** — curious and content. The tag is happy waiting, not abandoned.
- **low_battery / charging** — cosy and sleepy. Never alarming.
- **good_morning** — warm, low energy at `little`, never shouty.

## 5. `{{name}}` placeholder
At most one line in three per cell. The app resolves it to the kid's name or a band-appropriate fallback (`buddy`/`amigo`/`legend`). On the tag it splices the optional recorded name clip. A line must still read naturally if the fallback is used.

## 6. Review checklist (every line)
1. Within the band word limit? 2. Correct personality, blind-readable? 3. Passes every hard ban? 4. Still charming on the 30th hearing? 5. Safe for a child to repeat out loud? 6. No idiom a 4-year-old would misread literally? 7. Unique within its cell? 8. Recordable in under 2 seconds?

## 7. Recording notes (voice talent)
16 kHz mono, ADPCM-bound (ADR‑003). Keep each take under 2.0 s; `little` takes slightly slower with clearer consonants. One voice per personality across all three bands, with pitch and pace shifting by band rather than a different actor. Spelled-out sounds ("Glug glug!", "Zzzip!") are performed, not read. Leave 120 ms of head and tail silence; no room reverb.

## 8. Validation
`node content/validate.mjs` checks schema, word limits, duplicates, `{{name}}` frequency and non-ASCII characters across every pack. Run it before every commit that touches content.
