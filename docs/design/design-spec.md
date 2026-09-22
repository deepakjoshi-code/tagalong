# Tagalong App — Design Specification

Design intent: **feels like it shipped with the phone.** Calm surfaces, one warm accent, illustrated "things" that carry the personality, springy motion, generous whitespace. Kids see it over a parent's shoulder and want to touch it; parents trust it instantly.

## 1. Foundations

### 1.1 Typography (system fonts only — no web font requests)
```
--font-display: ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-text:    -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```
| Token | Size/Line | Weight | Use |
|---|---|---|---|
| `--text-large-title` | 34/41 | 700 display | Screen titles |
| `--text-title-1` | 28/34 | 700 display | Hero headings |
| `--text-title-2` | 22/28 | 700 display | Section heads, card titles |
| `--text-headline` | 17/22 | 600 | Row titles, buttons |
| `--text-body` | 17/22 | 400 | Body |
| `--text-callout` | 16/21 | 400 | Secondary body |
| `--text-subhead` | 15/20 | 400 | Row subtitles |
| `--text-footnote` | 13/18 | 400 | Captions, legal |
| `--text-caption` | 12/16 | 500 | Tab labels, badges |
Sizes are `rem`‑based so user font scaling works. Letter‑spacing −0.01em on display sizes.

### 1.2 Color
Light:
```
--bg:          #F6F5F2   (warm paper)
--surface:     #FFFFFF
--surface-2:   #F1F0EC   (grouped list bg, pressed)
--text:        #141414
--text-2:      #6E6E73
--text-3:      #A1A1A6
--separator:   rgba(0,0,0,0.08)
--accent:      #FF6A3D   (tangerine)  --accent-ink: #FFFFFF
--accent-soft: #FFE9E1
--success:     #34C759   --warning: #FFB020   --danger: #FF3B30
```
Dark:
```
--bg: #0F0F12  --surface: #1C1C21  --surface-2: #26262C  --text: #F5F5F7  --text-2: #9A9AA3  --text-3: #6A6A72
--separator: rgba(255,255,255,0.10)  --accent: #FF7A50  --accent-soft: #3A2119
```
Thing tints (used for ThingIcon backgrounds, card accents, hero gradients). Each has `--tint-*` and `--tint-*-soft`:
```
bottle     #3DBBD9 / #E2F5FA     lunchbox  #FFB020 / #FFF3DB
backpack   #8B5CF6 / #EEE8FD     toothbrush #34C79A / #E0F7EF
shoes      #FF6B8A / #FFE6EC     plush     #FF9F6B / #FFEDE2
helmet     #4F8BFF / #E4EDFF     jacket    #8FB339 / #EEF5DF
other      #8E8E93 / #ECECEF
```
Contrast: all text on surfaces ≥ 4.5:1; tints are backgrounds for white glyphs only when ≥ 3:1.

### 1.3 Spacing, radius, elevation
- 4‑pt grid: `--space-1..12` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Screen gutter 20 px (`--gutter`). Safe‑area insets always honoured (`env(safe-area-inset-*)`).
- Radius: `--r-control: 12px`, `--r-card: 20px`, `--r-sheet: 28px`, `--r-pill: 999px`.
- Elevation: cards `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`; sheets `0 -8px 40px rgba(0,0,0,.18)`.
- Tap targets ≥ 44 × 44.

### 1.4 Motion
- Springs: sheets/pages `stiffness 420, damping 34`; micro `stiffness 600, damping 40`.
- Press: scale 0.97, 120 ms. Appear: fade+rise 8 px, 220 ms ease‑out. Stagger lists 30 ms.
- Respect `prefers-reduced-motion` (crossfade only).
- Haptics via `navigator.vibrate` where available: tap 8 ms, success [10, 40, 10].

### 1.5 Iconography & illustration
- UI icons: `lucide-react`, 1.75 px stroke, 20/24 px.
- **ThingIcon**: a large rounded glyph (emoji‑free, inline SVG) per thing on its tint circle. Sizes 32/48/72/120. These are the brand: simple, chunky, friendly line art with a filled highlight.
- **Face**: each tag card shows a tiny animated face (two dots + mouth) that blinks and reacts to the last event (surprised on drop, happy on pickup). The face lives on the ThingIcon.

## 2. Information architecture
```
/welcome                 Onboarding (3 slides, skippable after first)
/tags                    Home · "Tags"
/tags/new                Add‑tag wizard (full‑screen modal)
/tags/:id                Tag detail
/kids  /kids/new  /kids/:id
/settings  /settings/privacy  /settings/about
/demo                    Demo playground (simulated tag)
```
Tab bar (3): **Tags** (lucide `tag`), **Kids** (`smile`), **Settings** (`settings-2`). Hidden inside modals/wizard.

## 3. Screens

### 3.1 Welcome
Three swipeable slides with a large ThingIcon hero and a one‑line promise:
1. "Give anything a voice." — bottle icon with face, subtle bounce.
2. "Made for kids. Private by design." — lock glyph; sub‑copy: *No account. No cloud. No microphone. Everything stays on your phone.*
3. "Set up your first tag in 60 seconds." — CTA **Get started**; secondary **Try the demo**.
Progress dots, skip in the top‑right.

### 3.2 Tags (Home)
- Large title "Tags". Trailing `+` button.
- Tag cards (one per tag): ThingIcon with face, nickname ("Bottle Buddy"), line 2 = kid + personality chip, line 3 = last event in kid‑friendly words with relative time ("Took a tumble · 2 min ago"), battery pill (top‑right). Tap → detail. Long‑press → mute 1 h / forget.
- Empty state: centered ThingIcon trio, "No tags yet", **Add a tag**, tertiary **Try the demo**.
- Install banner (dismissible) if not installed and `beforeinstallprompt` fired.

### 3.3 Add‑tag wizard (full‑screen sheet, stepper header, back/close)
1. **Find your tag** — illustrated tag with pulsing ring: *Hold the button on the tag until it giggles.* Button **Search** → Web Bluetooth chooser (or list in demo). Fallback if no Bluetooth support: explainer + **Use demo tag**.
2. **Who's it for?** — kid avatars (existing) + **New kid**: first name (optional, "only shown on this phone") + age band picker (3 large cards: *Little* 2–4, *Kid* 5–7, *Big kid* 8–12).
3. **What's it attached to?** — 3‑column grid of ThingIcons; selected one gets a face.
4. **Pick a personality** — 3 cards: Silly / Sweet / Brave, each with a sample line and a ▶ preview (speaks it on the phone). Nickname auto‑suggested ("Bottle Buddy") and editable.
5. **Sound** — volume slider with live preview, quiet hours (default 8 pm–7 am), gentle nudges toggle (off by default).
6. **Sending to tag…** — progress → success confetti (respect reduced motion) → "Bottle Buddy is ready!" with 3 example lines and **Done**.

### 3.4 Tag detail
Hero (tinted gradient, big ThingIcon with face, nickname, kid · age band). Sections (inset grouped lists):
- **Personality** row (chip) · **Says things like…** (3 lines, ▶ to preview, shuffle).
- **Sound**: volume, quiet hours, nudges, **Mute for an hour**.
- **Today**: mini timeline of events (local only, 7‑day retention, clear button).
- **Tag**: battery, firmware, content pack, **Identify** (giggle + LED), **Update**.
- **Forget this tag** (destructive, confirm sheet).

### 3.5 Kids
List of kids with avatar (initial), age band, tags count. Detail: name, age band, **Name clip** (record ≤1.5 s, play, delete; explainer that it's stored only here and on tags), delete kid.

### 3.6 Settings
Groups: **App** (appearance: system/light/dark; haptics; install app) · **Privacy** → Privacy Center · **Demo mode** toggle · **About** (version, licenses, open source) · **Delete everything** (destructive, typed confirmation "DELETE").

### 3.7 Privacy Center
Plain‑language card: "What Tagalong knows" — a live inventory: N kids, N tags, N events (last 7 days), name clips: yes/no, **all stored on this phone**. Rows: *Export my data* (JSON download), *Clear activity*, *Delete everything*. Footer: "No servers. No accounts. No analytics. We literally can't see your data."

### 3.8 Demo playground
A big simulated tag (ThingIcon + face) with buttons: Fill · Sip · Drop · Pick up · Shake · Tap. Each fires the event through the simulated transport; the phone speaks the line, the face reacts, and the event appears in the log. Age band / thing / personality selectors above. This is the marketing demo — it must be gorgeous.

## 4. Components (in `src/design/components`)
`Screen`, `LargeTitle`, `NavBar`, `TabBar`, `Card`, `Button` (primary/secondary/tertiary/destructive; lg/md/sm), `IconButton`, `Sheet` (bottom, drag‑to‑dismiss, focus‑trapped), `ListGroup`/`ListRow` (iOS inset‑grouped), `Toggle`, `Segmented`, `Slider`, `Chip`, `ThingIcon` (+`Face`), `Avatar`, `EmptyState`, `Toast`, `ProgressDots`, `Stepper`, `BatteryPill`, `Confetti`.
All components: keyboard accessible, ARIA‑labelled, forwardRef, no external UI library.

## 5. Copywriting rules (UI)
Sentence case. Verbs first. No jargon ("Bluetooth" is fine; "GATT" is not). Kid‑friendly event words: drop → "Took a tumble", pickup → "Picked up", filled → "Filled up", sip → "Had a sip", long_still → "Waiting patiently".
