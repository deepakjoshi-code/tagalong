# Tagalong — Privacy Notice

| | |
|---|---|
| **Version** | 1.0 · 22 September 2026 |
| **Owner** | Privacy engineering drafts · Legal approves · Design owns the in‑app presentation |
| **Where it appears** | In the app under **Settings → About → Privacy notice** (bundled, works offline) · at `{APP_URL}/privacy` · condensed on the in‑box privacy card (`docs/03-unboxing-and-packaging.md` §6) |
| **Reading level** | Grade 6 (PRD A11Y‑11). Sentence case, verbs first, no jargon |
| **Truth check** | Every sentence is traceable to `data-inventory.md`. Before changing the product, change this notice first — the product may not get ahead of what parents were told (ADR‑002) |
| **Placeholders** | `{APP_URL}` and `{PRIVACY_EMAIL}` are filled in at the naming decision (G0) |

---

## The notice (this is the part a parent reads — about two minutes)

# Your privacy

**Tagalong has no account and no cloud. What you set up stays on your phone and on your tags. We never see it. We could not see it if we wanted to.**

## What we do not do

- No server of ours stores anything about you or your child.
- No account, ever.
- No analytics, no crash reports, no ads, no other company's code.
- No location. Your tag has no GPS and cannot be used to find your child.
- No microphone and no camera on the tag. There is nothing on it that can listen or watch.
- We sell and share nothing, to anyone. There is nothing to sell.

## What is kept, and where

All of this lives in the app's own storage, on your phone.

| What | Why | How long |
|---|---|---|
| Your child's first name, if you type one | So you can tell whose tag is whose. Optional — leave it blank | Until you change or delete it |
| Their age group (2–4, 5–7, 8–12) | It sets the words, jokes and pace | Until you change or delete it |
| A recording of the name, if you make one | So a tag can say it out loud. Up to 1.5 seconds | Until you delete it |
| Which things you tagged, their nicknames, your sound settings | So your tags behave as you set them | Until you delete them |
| A short list of what each tag noticed — filled up, dropped, picked up | So you can see the tag's day in the app | **7 days, then it deletes itself** |

The tag holds less: the age group, what it is attached to, the personality, your sound settings, and the name recording if you made one. **It never holds your child's name as text, and never holds a location.**

## Your phone's microphone

If you choose to record the name, the app asks your phone for its microphone for those few seconds. The recording is saved on your phone — not uploaded, not analysed, not sent to us. Delete it whenever you like, or never make one.

Phrase previews use your phone's own offline voice. If your phone has no offline voice, the app says so and stays quiet rather than sending the words anywhere.

## Bluetooth

The app talks to your tags directly, phone to tag. You start it by holding the button on the tag and picking it from your phone's list. The app never connects to a tag you did not pair yourself, and it lets go shortly after you put your phone down.

## You are in control

**Settings → Privacy Center** shows a live list of everything stored, and three buttons: **Export my data**, **Clear activity**, and **Delete everything**. None of them asks us for permission — they cannot, and that is the point.

To wipe a tag too, put it on its charger and hold the button for 10 seconds, until the light blinks red.

## Two honest details

**Getting the app is a web visit.** It is a web app, so your phone fetches its files from our host the first time and when it updates. Like any website, the host records that request — your IP address, the time, the file. We keep those records briefly, to keep the site working and safe, and never link them to anything in the app. After that, the app works offline and asks for nothing.

**Your phone is the safe.** Your data is protected by your phone's own lock and encryption. Anyone who can unlock your phone can open the app and read it. Worth knowing if you share a phone.

## Children

Tagalong is for children and is built to collect no personal information from a child at all: no sign‑up, no profile, no tracking, nothing transmitted. Parents set it up and can see and delete everything, any time. If you think a child's information has somehow reached us, write to `{PRIVACY_EMAIL}` — though in this design there is nowhere for it to have gone.

## For your child, in their words

*"I tell your grown‑up when I get filled, dropped or picked up. That's all I know. I can't see you, I can't hear you, and I don't know where you are."*

## Changes, and how to reach us

If we ever change what the product does with data, we change this notice first, raise its version, and show you what changed next time you open the app. Questions: `{PRIVACY_EMAIL}`.

---

## Regional notes (for the parents who want them)

These do not change anything above. They translate it into the language particular laws use.

**United Kingdom and Europe.** We aim to be a controller with as little to control as possible. Data minimisation, privacy by design and privacy by default are the architecture, not a policy: the app stores the least it can, on your device, for the shortest time it can, and transmits none of it. Your rights of access, portability and erasure are exercised directly in the Privacy Center rather than by writing to us, because we hold no copy to give you or delete. The app stores data on your device only to provide the service you asked for, so it sets no cookies and shows no consent banner. There are no international transfers, because nothing travels.

**United States.** We collect no personal information from children through the app or the tag, we obtain nothing that would require parental consent to collect, and we disclose nothing to third parties. We publish our retention rule — activity logs delete themselves after seven days, and everything else stays until you remove it — and we keep a written security programme for the product.

**California.** We do not sell or share personal information, and we do not use it for cross‑context behavioural advertising. There is no sale, share or targeted advertising to opt out of.

**Australia and Canada.** The same design applies: no collection by us, no disclosure, no cross‑border transfer, and on‑device access and deletion.

**Our shop is a different thing.** If you buy from our online store, that store takes the details any shop needs — name, address, payment, email — and it has its own privacy notice. Nothing from the store ever reaches the app, and nothing from the app ever reaches the store.

---

## Privacy Center copy (the in‑app strings)

The Privacy Center is the notice parents actually read, so its words are part of this document and change with it. Strings marked **new** are required by `threat-model.md` §8 and are not in the build yet.

| Element | Copy |
|---|---|
| Screen title | Privacy Center |
| Card heading | What Tagalong knows |
| Card body | All of it lives on this phone. There is no Tagalong account and no Tagalong server, so none of this has ever been sent anywhere. |
| Group: On this phone | Kids · Names saved · Name recordings · Tags · Activity entries (last 7 days) |
| Group: Never collected | Location — Never · Audio or video — Never · Analytics or crash reports — Never · Third‑party services — None |
| Never‑collected footer | Tags have no microphone, no camera and no location hardware. They cannot be used to find a child. |
| Group: Keeping your data safe | Storage — Protected / Not guaranteed · Ask my browser to keep it |
| Storage footer (protected) | Your browser has been asked to keep this data and agreed. It stays until you delete it. |
| Storage footer (iPhone, not installed) | On iPhone, Safari deletes web‑app data after about 7 days without use. Add Tagalong to your Home Screen and it stays put. |
| Storage footer (other) | Your browser may clear this data if storage runs low or the app goes unused for a long time. |
| **Group: Your data footer** (**new**, PRV‑07) | Export gives you a readable file of everything except audio recordings. It is not password‑protected, so keep it somewhere you trust. |
| Export row | Export my data · Download a copy as JSON |
| Clear row | Clear activity · Removes the 7‑day event log |
| Delete row | Delete everything |
| **On‑phone security note** (**new**, PRV‑09) | Your data is protected by your phone's lock and encryption. Anyone who can unlock this phone can see it. |
| Delete sheet | **Delete everything?** Kids, tags, recordings and activity are permanently removed from this phone. Type DELETE to confirm. |
| **Delete sheet addition** (**new**, PRV‑62) | This does not reset your tags. To wipe a tag, put it on its charger and hold its button for 10 seconds. |
| Footer | No servers. No accounts. No analytics. We literally can't see your data. |

### Where the same promise appears elsewhere

| Surface | Copy | Owner |
|---|---|---|
| Welcome, slide 2 | Made for kids. Private by design. · No account. No cloud. No microphone. Everything stays on your phone. | Design |
| About → How it works | Tagalong talks to your tags over Bluetooth, directly from this phone. There is no Tagalong server, no account, and no analytics. Your tags have no microphone, no camera and no location. | App |
| Kid editor, name field | Shown only on this phone. Tags never receive a name as text. | App |
| Kid editor, recording footer | Optional. Record the name once and tags can say it. Stored on this phone and on your tags only, never uploaded. | App |
| Box sleeve, left side | No microphone. No camera. No account. | Design |
| In‑box privacy card | Full text in `docs/03-unboxing-and-packaging.md` §6 — it must stay word‑compatible with this notice | Design, Legal |
| **Kid card** (**new**, PRV‑61 / AADC‑11) | I tell your grown‑up when I get filled, dropped or picked up. I can't see you, hear you, or know where you are. | Design, Content |

### Rules for editing any of this copy

1. **No claim without a file entry.** Every promise here maps to a row in `compliance-matrix.md` §11. If you cannot point at the evidence, do not print the sentence.
2. **"Nothing leaves your phone" always carries the hosting qualification** somewhere a parent will meet it. The two‑sentence version in *Two honest details* is the shortest acceptable form (PRV‑52).
3. **The phone's microphone is disclosed wherever the tag's lack of one is claimed.** The box says "no microphone" about the tag; this notice explains the phone's. Never let one appear without the other nearby.
4. **If a feature would make a sentence here untrue, the sentence wins** until an ADR says otherwise (ADR‑002; roadmap §1 rule 3). Location, cloud sync and a microphone on the tag each require rewriting this page before any code is written.
