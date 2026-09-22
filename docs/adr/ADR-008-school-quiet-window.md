# ADR‑008: A second quiet window for the school day
**Status:** accepted · 2026‑09‑22 · supersedes the single-window `TagConfig` layout in ADR‑007's era

## Context
Market research surfaced that US school districts began banning disruptive water
bottles during 2025. For Tagalong this is not a support problem, it is an
existential one: a product banned from the classroom loses the place where a
child spends most of the day, and the ban spreads by policy rather than by
individual choice.

The v1 `TagConfig` carried one quiet window. A parent could set "silent at
night" **or** "silent during school", never both. Quiet hours that wrap past
midnight cannot also express 08:30–15:30, and asking a parent to re-set the
window twice a day is not a product.

## Decision
`TagConfig` grows from 13 to 16 bytes and carries a **second, independent**
quiet window:

| Byte | Field |
|---|---|
| 12 | `schoolStart`, minutes/10, `255` = disabled |
| 13 | `schoolEnd`, same encoding |
| 14 | `schoolDays`, bitmask, bit0 = Monday … bit6 = Sunday, `0` = every day |

The tag is silent if the current time falls inside **either** window. The school
window is separate rather than a generalised list because:
- it needs its own weekday mask, which the night window does not;
- a parent should be able to switch it off in the holidays without losing
  bedtime quiet;
- two fixed windows cost 3 bytes, a variable-length list costs complexity in the
  firmware for a case no parent has asked for.

`ControlOp 0x04` (set time) gains an optional third byte carrying the weekday, so
the tag can apply the mask. When the tag does not know the weekday it applies the
school window anyway: being quiet on a Saturday is a small disappointment,
talking in a classroom is what gets the product banned.

Defaults: off, 08:30–15:30, Monday to Friday. The wizard offers it; the parent
chooses.

## Consequences
- The wire format changed before any firmware shipped, which is the only time
  this is cheap. Both codecs, both test suites and the parity vectors changed
  together.
- Marketing gains a concrete answer to the strongest objection a school has:
  *"It is silent in class, and you do not have to trust us — the parent sets the
  hours and the tag has no way to be turned back on remotely."*
- Tags stored by an older app version have no `school` field; it is optional in
  the app's schema and treated as disabled, so no parent loses a tag.
