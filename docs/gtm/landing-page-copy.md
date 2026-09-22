# Tagalong — Landing Page Copy

| | |
|---|---|
| **Status** | v1 copy deck · 2026‑09‑22 · claims lock at **G2 (Apr 2027)** |
| **Owner** | VP Marketing (copy) · Compliance (claims) · Design (layout) |
| **Voice** | `docs/gtm/positioning-and-messaging.md` §6 — the **brand** voice, not the tag's voice. Quoted tag lines are the only place exclamation marks appear |
| **Claims** | Every sentence here is Green in `positioning-and-messaging.md` §9, or is marked **[AMBER]** with its gate. No Amber sentence ships before its gate |
| **Sources** | Sample lines are taken verbatim from the shipped content packs and `app/src/domain/personalities.ts`, so the site and the app never disagree |

**Conventions.** `### [MODULE]` is a page section in order. Copy is set as **Headline / Subhead / Body / CTA / Microcopy**. Lines beginning *Note —* are instructions to design or engineering and do not ship. The product name appears as *Tagalong* for readability; the build substitutes `{BRAND}` so a naming decision on 15 Nov 2026 is a find‑and‑replace, not a rewrite. `{APP_URL}`, `{SUPPORT_EMAIL}`, `{PRIVACY_EMAIL}` are filled at the naming decision.

§1–§9 are the **launch page** (live from GA, May 2027). §10 is the **waitlist variant** that ships in October 2026. §11 is the copy‑deck discipline.

---

## 1. Hero

### [HERO]

**Headline**
> Give anything a voice.

**Subhead**
> Strap Tagalong to a water bottle, lunchbox, backpack or toothbrush, and the thing comes alive. It giggles when it's filled. It says "ouch" when it's dropped. It thanks the kid who picks it up.

**Primary CTA** — Buy · $29.99
**Secondary CTA** — Hear it first

**Microcopy under the buttons**
> No account. No cloud. No microphone. Pairs with Android phones today; the iPhone app arrives in the 1.1 update. The demo works on any phone.

*Note — the hero visual is an eight‑second muted loop of a real phone speaking a real line, with a tap‑to‑hear control. Not a render. Not a stock family. The demo is the product; show the product.*

### [PROOF STRIP]

*Note — six icons, four words each, directly under the hero. This is the claim a gift buyer sees in two seconds.*

> No microphone · No camera · No location · No account · No cloud · No subscription

---

## 2. How it works

### [HOW IT WORKS]

**Headline**
> Three steps, about a minute.

**Step 1 — Press the button**
> Take it out of the box and press its button. It giggles. That part needs no phone, no app and no grown‑up.

**Step 2 — Tell it who and what**
> Open the app and add your tag. Pick your child's age group, what you're attaching it to, and a personality. Tap a preview to hear it.

**Step 3 — Strap it on**
> Click the tag into its mount and strap it to the bottle, the bag or the brush. Then put your phone away. It works on its own.

**Closing line**
> There's nothing to sign up for. Nothing to subscribe to. Nothing to remember.

### [WHAT IT NOTICES]

**Headline**
> It reacts to what actually just happened.

**Subhead**
> Tagalong feels movement, touch, light and time. That's all it can feel — and it turns out that's plenty.

*Note — four columns, one per full content pack. Each event word is a hover/tap that plays a real line.*

| Water bottle | Lunchbox | Backpack | Toothbrush |
|---|---|---|---|
| Filled up | Opened | Zipped up | Started brushing |
| Had a sip | Closed | Left behind | Two whole minutes |
| Ran empty | Packed | Picked up | Stopped early |
| Took a tumble | Took a tumble | Took a tumble | Took a tumble |

**Body**
> Every tag also knows the everyday things: picked up, put down, dropped, shaken, tapped, waiting patiently, good morning, and getting sleepy when the battery is low.
>
> It speaks when something happens — never on a timer, and never more than a dozen times an hour unless you say otherwise.

**Pull quote**
> "Bonk! Still standing, captain."
> — a bottle, after a two‑metre trip down the stairs

---

## 3. Personalities

### [PERSONALITIES]

**Headline**
> Three personalities. Your kid picks.

**Subhead**
> Same tag, same events, completely different friend. Switching feels like a new toy, which is the point.

*Note — three cards, each with a play button that speaks the line for the selected age group. Age group selector sits above the cards and changes all three lines at once. Lines below are the app's own strings.*

**Silly** — *Goofball. Sound effects. Puns.*
> Little (2–4): "Glug glug! I'm full! Wheee!"
> Kid (5–7): "Full tank, amigo! Blast off!"
> Big kid (8–12): "Hydration: complete. Autographs later."

**Sweet** — *Warm, cosy, always cheering you on.*
> Little: "All full. Thank you, friend."
> Kid: "Filled up with love. Thanks, Maya!"
> Big kid: "Refilled. You take good care of me."

**Brave** — *Adventurer. Hero. Hype squad of one.*
> Little: "Water power! Let's go!"
> Kid: "Fuel loaded. Adventure awaits, captain!"
> Big kid: "Tank full. Mission: conquer today."

*Note — the Sweet/Kid line is the app's string `"Filled up with love. Thanks, {{name}}!"` with the placeholder shown resolved. On the page it resolves to a name the visitor can type, or to the band's own fallback vocative (`buddy` / `amigo` / `legend`). Never print the raw `{{name}}` token.*

**CTA** — Try all nine in the demo

### [IT GROWS WITH THEM]

**Headline**
> A three‑year‑old and a ten‑year‑old do not find the same things funny.

**Body**
> So they don't hear the same lines. Tagalong has three age groups, and they change the words, the pace and the jokes.
>
> **Little, 2–4.** Six words at most. Concrete, repetitive, full of sound effects. "Slurp! Tickles!"
> **Kid, 5–7.** Ten words at most. Sidekick energy and simple jokes. "One sip closer to being a fish."
> **Big kid, 8–12.** Twelve words at most. Dry, never babyish, never trying too hard. "I'm just a decorative object now."
>
> Change the age group in the app whenever you like. The tag updates in a second, and it never repeats its last three lines.

**Body — the promise behind the lines**
> There are 2,052 written lines across five content packs, at least four for every situation, and every one was written to a rule book: no shame, no guilt, no fear, no nagging, nothing about food or bodies, and nothing a child could repeat to hurt another child.

**CTA** — Read the content rules we wrote for ourselves

---

## 4. The privacy promise

### [PRIVACY]

**Headline**
> We can't see your data. Not because we promise — because there's nowhere for it to go.

**Body**
> Most connected kids' products ask you to trust a policy. Tagalong asks you to check the hardware.
>
> There is **no microphone and no camera** in the tag. There is no audio input in it at all, so it cannot hear anything, ever. There is **no GPS and no finding network**, so it cannot tell us, you, or a stranger where your child is. There is **no account** to create and **no server of ours** to store anything. The app is a web app that makes no network requests once it's installed. There are no analytics, no crash reports, and no other company's code in it.

**Sub‑block — What lives where**

> **On your phone, and only there:** your child's first name if you type one (it's optional), their age group, the things you tagged, your sound settings, and a seven‑day list of what each tag noticed. That list deletes itself.
>
> **On the tag:** its settings. Age group, what it's attached to, personality, volume, quiet hours. Never a name as text. Never a place.
>
> **On our servers:** nothing. We don't have any.

**Sub‑block — You're in control**
> Settings → Privacy Center shows you everything that is stored, saves a copy as a file, or deletes all of it. One tap. No email to write, no form to fill in.

**Sub‑block — Why we built it this way**
> We published the decisions, so you don't have to take our word for it: no microphone in version 1, no backend, and a Bluetooth address that changes every fifteen minutes so nobody can follow your child's bottle around town.

**CTA** — Read the decision records · Read the privacy notice

**Microcopy**
> One honest note: this website is a website. It uses no advertising trackers and no third‑party pixels, and it is a separate thing from the app. The tag and the app collect nothing. [Site notice]

### [NOT A TRACKER]

**Headline**
> It talks. It doesn't track.

**Body**
> Tagalong is a tag, and it is not a finder. It has no GPS, it is not on any finding network, and it cannot be used to locate a person or a thing. We designed it that way on purpose: a device that can find a child can also be used against one.
>
> What it does instead is speak up when a backpack has been sitting still all morning. Once, politely, and only on a weekday morning or afternoon. That is usually what you actually wanted.

*Note — this module is mandatory on the page and in the first three Amazon bullets. Never build a comparison table against item finders.*

### [CALM BY DESIGN]

**Headline**
> Classroom‑quiet, by default.

**Body**
> The volume is capped in the hardware at 75 dB at 25 cm. The toy standard allows 85; we stay ten decibels under it and test every unit on the line.
>
> Tagalong has **two quiet windows**. One for the night, on by default from 8 pm to 7 am. One for school hours, on the weekdays you choose — and you can switch that one off in the holidays without losing bedtime quiet. Both live on the tag itself, so it stays silent in class even if your phone is at home.
>
> A double tap mutes it for an hour. One tap in the app mutes it from anywhere in the house.

---

## 5. What's in the box

### [IN THE BOX]

**Headline**
> Paper, and one tag.

**Body**
> One tag, in your colour. A bottle strap and a zipper loop, both on the click‑in cradle ring. A magnetic charging puck with a one‑metre USB‑C cable. A quick‑start card and a privacy card.
>
> The box is FSC board and moulded paper pulp. No plastic window, no bag, no tie. There's no wall plug in the box — any certified 5 V USB source will do.

**Microcopy**
> Need the lace clip or the adhesive base? The Mount kit is $7.99 and holds every mount we make.

### [MOUNTS]

**Headline**
> One tag, four things, a quarter turn.

**Body**
> Every mount is the same rigid ring. The tag clicks in with a quarter turn and comes out when you squeeze two tabs — kid‑resistant, not kid‑proof. Move it from the bottle to the backpack in about two seconds, and the app changes its personality pack to match.

| Mount | Fits | In the box |
|---|---|---|
| Bottle strap | Bottles 55–95 mm across | 1‑pack, 2‑pack |
| Zipper loop | Backpack pulls, lunchbox handles, prams | 1‑pack, 2‑pack |
| Lace clip | Shoes, straps, jackets | Mount kit |
| Adhesive base | Lunchbox lids, helmets, bike frames | Mount kit |
| Large bottle strap | Bottles 75–110 mm across | Mount kit |

---

## 6. Specifications

### [SPECS]

*Note — a plain table, no marketing adjectives. Rows marked **[AMBER]** ship only after their gate; until then use the substitute wording given in `positioning-and-messaging.md` §9.*

| | |
|---|---|
| Size and weight | ⌀38 × 12 mm, about 14 g |
| Materials | Soft‑touch silicone over polycarbonate, food‑contact‑safe grade |
| Colours | Tangerine, Sky, Grape, Mint |
| Sound | Capped at 75 dB(A) at 25 cm at maximum volume; every unit tested on the production line |
| Quiet hours | Two independent windows — night, and school hours with a weekday mask — stored on the tag |
| Battery | 150 mAh rechargeable, sealed. **No coin cell.** Designed for about a month between charges at around 30 lines a day **[AMBER — G1]** |
| Charging | Magnetic two‑pin puck, 1 m USB‑C cable, about two hours. No port on the tag |
| Water and dust | IP67 rated **[AMBER — IP67 report, Mar 2027]**. Hand‑wash only. Not dishwasher safe |
| Durability | Tested to survive 100 drops from 1.5 m onto concrete **[AMBER — DVT reliability]** |
| Sensors | Motion, touch and liquid level, ambient light, temperature. **No microphone. No camera. No GPS** |
| Radio | Bluetooth 5. Pairs with one phone at a time |
| Storage | 16 MB of pre‑recorded speech, on the tag |
| Content | English at launch. Spanish and Hindi in the 1.1 update. 2,052 written lines across five packs |
| Controls | One button: tap to say hi, double tap to mute for an hour, hold three seconds to pair. One light ring |
| Works with | Android 10 or newer, using Chrome or Edge. The iPhone app arrives in the 1.1 update. The demo works on any phone |
| App | Installable web app. Works offline. No account |
| In the box | Tag, bottle strap, zipper loop, charging puck and cable, quick‑start card, privacy card, safety leaflet |
| Warranty | 1 year limited, worldwide. Two‑year legal guarantee in the UK and EU. 60‑day first‑laugh guarantee |
| Security updates | Five years from the last date of sale |
| Age | See the age groups above **[AMBER — age grade fixed at G0/G1]** |
| Approvals | *[final list at G3: ASTM F963, EN 71, CPSIA/CPC, FCC, ISED, CE‑RED, UKCA, RCM, IP67]* |

---

## 7. Buy

### [BUY]

**Headline**
> Buy once. It keeps working.

| | | |
|---|---|---|
| **1‑pack** | **$29.99** | One tag, two mounts, a charger. Four colours |
| **2‑pack** | **$49.99** | Two tags for two kids, or two things |
| **Family 4‑pack** | **$99.99** | One of each colour |
| **Mount kit** | **$7.99** | Every mount we make, on the click‑in ring |
| **Spare charging puck** | **$14.99** | For the second bedside table |

**Microcopy**
> No subscription, now or later. Free shipping over $60. 60 days to change your mind, and we pay the return postage.

**Gift line**
> Buying it as a gift? Add a free paper gift sleeve and a message card at checkout. The kid can press the button and hear it giggle before anyone finds a phone.

---

## 8. FAQ

### [FAQ]

*Note — 22 questions, ordered by what actually blocks a purchase. The first four are the ones that decide the sale.*

**Is it a tracker? Can I find my child's bottle with it?**
No. It has no GPS and it isn't on any finding network, so it cannot tell you or anyone else where anything is. We built it that way deliberately: a device that can find a child can be used against one. What it does instead is speak up when the backpack has been sitting still all morning.

**Does it listen to my child?**
There is no microphone in it. There is no audio input of any kind, so there is nothing to switch off and nothing to hack. It reacts to movement, touch, light and time.

**What data do you collect?**
None. There is no account and no server of ours. Your child's age group, the things you tagged, your settings and a seven‑day activity list live in the app on your phone. The tag holds its own settings and never your child's name as text. Settings → Privacy Center shows you all of it and deletes all of it in one tap.

**Do I need an account, Wi‑Fi or a subscription?**
No, no and no. The app installs like an app, works with no internet connection, and asks for no email address. There is no subscription now and there will not be one later.

**Does it work on iPhone?**
The demo works on any phone, including iPhone. Pairing a tag needs an Android phone (Android 10 or newer, using Chrome or Edge) until the iPhone app arrives in the 1.1 update. We say this before you buy rather than after, because Apple's browser does not allow Bluetooth pairing from a website.

**How long does the battery last, and how do I charge it?**
It's designed for about a month between charges at around thirty lines a day; a very chatty week is more like three. It warns you gently once a day when it's getting low, and it goes quiet rather than dying loudly. Drop it on the magnetic puck and it charges in about two hours. The battery is sealed inside, and there is no coin cell.

**Is it waterproof? Can it go in the dishwasher?**
It's sealed to IP67, which means sinks, rain, spills and a dropped bottle in a puddle. It is **not** dishwasher safe — the heat and the detergent will kill it. Wipe it or hand‑wash it.

**How loud is it? Our school is strict about noisy things.**
The volume is capped in the hardware at 75 dB at 25 cm, ten decibels under the toy standard. It has a separate school‑hours quiet window with a weekday mask, stored on the tag itself, so it stays silent in class even if your phone is at home. A double tap mutes it for an hour.

**Will it nag my child?**
No. That was the first thing we designed against. It speaks when something happens, at most a dozen times an hour by default, and never on a schedule. The "you left me behind" line needs four separate conditions to be true and can only happen once every three hours. Every line was written to invite, never to demand — and nothing it says mentions being good, being bad, or food.

**One of my kids is 3 and one is 9. Does the same tag work for both?**
The tag takes one age group at a time, because the words for a three‑year‑old are not the words for a nine‑year‑old. Give them a tag each — that's what the 2‑pack is for — or switch the age group in the app when it changes hands.

**Can I move it from the bottle to the backpack?**
Yes, and that's the point. Every mount uses the same click‑in ring, so it's a quarter turn. Tell the app what it's attached to and it loads that thing's lines.

**What if my kid gets bored of it?**
There are 2,052 written lines, at least four for every situation, and it never repeats its last three. Switching the personality is the closest thing to a new toy. New content packs arrive over Bluetooth from the 1.1 update, free. And if the laughing stops in the first sixty days, send it back and we'll refund the postage too.

**What happens if your company shuts down?**
Nothing happens. There is no server to switch off, no account to expire and no subscription to cancel. Your tags keep working exactly as they do today. We publish security updates for five years from the last date we sell a tag.

**What if it breaks, or we lose it?**
A defect in the first year is our problem — we replace it. After that, or if your dog gets to it, a replacement tag is $14.99, once a year, no questions. A lost tag can't be found by the tag, because it can't be found by anyone; that's the trade we made.

**How many tags can one phone look after?**
As many as you like. Add a child, add their tags, and the app keeps them straight. Each tag pairs with one phone at a time, which is why there's no way for someone else to connect to your child's tag.

**What languages does it speak?**
English at launch, in three personalities recorded by voice actors. Spanish and Hindi arrive in the 1.1 update. A tag speaks one language at a time.

**Is it safe for a two‑year‑old?**
It's sealed, there is no coin cell and no openable compartment, and the mounts are designed so nothing separates into a small part. It's independently tested to the toy safety standards for every country we sell in, and the age grading is printed on the box.

**Can my child pick the personality? Can I hear the lines before I buy?**
Yes to both. Let them choose — they take it more seriously than you'd expect. And you can hear all nine combinations right now in the demo, with no tag and no signup.

**Does my child need a phone?**
No. The child never needs a phone, an app or a screen. The app is for the grown‑up, once, at setup.

**How do I delete everything?**
Settings → Privacy Center → Delete everything, and type DELETE. It clears every name, setting, recording and activity entry from your phone. To wipe a tag, put it on the charger and hold its button for ten seconds until the light blinks red.

**What's in the box, and do I need a plug?**
A tag, a bottle strap, a zipper loop, a magnetic charging puck with a one‑metre USB‑C cable, a quick‑start card, a privacy card and a safety leaflet. No wall plug — any certified 5 V USB source works.

**Does it work on a metal or insulated bottle?**
It talks on any bottle. Sensing the water level through the wall works best on plastic bottles; on metal and vacuum‑insulated bottles it reacts to being filled, tipped and carried rather than to the level itself. **[AMBER — final wording set by the EVT bottle‑material test; box, site and app must use the same sentence]**

---

## 9. Footer

### [FOOTER]

**Column 1 — Product**
> What it is · How it works · Personalities · Mounts · Specifications · Try the demo

**Column 2 — Privacy**
> Our privacy promise · Privacy notice · What we store · Decision records · Report a security issue · security.txt

**Column 3 — Support**
> Help centre · Setting up your first tag · Charging and battery · Warranty and returns · Recycle a tag · {SUPPORT_EMAIL}

**Column 4 — Company**
> About · Press kit · What we cannot yet claim · Stockists · Contact

**Sign‑up strip**
> **Voice Notes.** One new line, one design decision, one privacy fact. Every other week. Unsubscribe in a tap.
> [email field] [Sign up]

**Legal foot**
> © 2027 {BRAND}. All prices in USD and include no sales tax.
>
> This website uses no advertising trackers and no third‑party pixels. It is separate from the app: the tag and the app collect nothing. [Site notice]
>
> Bluetooth® is a registered trademark of Bluetooth SIG, Inc. Android and Chrome are trademarks of Google LLC. iPhone and Safari are trademarks of Apple Inc. Use of them here does not imply endorsement.
>
> Tagalong is a toy, not a safety device, a medical device or a locator. It cannot find a person or an object.
>
> Security updates for five years from the last date of sale. Vulnerability disclosure: {PRIVACY_EMAIL}.
>
> Registered address · Importer details · WEEE and battery recycling · Accessibility statement · Terms of sale

---

## 10. Waitlist variant (live Oct 2026 → Mar 2027)

Same page, four swaps. Nothing else changes, so the launch page is a deletion, not a rebuild.

### [HERO — waitlist]

**Headline**
> Give anything a voice.

**Subhead**
> A small waterproof tag that makes a kid's water bottle, lunchbox, backpack or toothbrush talk. It giggles when it's filled and says "ouch" when it's dropped. No account, no cloud, no microphone. **Arriving May 2027.**

**Primary CTA** — Hear it now
**Secondary CTA** — Join the waitlist

**Signup module**
> **Be first.** We'll email you twice before launch and once when you can order. That's it.
> [email field] [Join]
> One optional question, because it genuinely changes what we build next: **which phone do you use?** [Android] [iPhone] [Rather not say]

**Microcopy**
> Pairing needs an Android phone at launch; the iPhone app follows in the 1.1 update. The demo works on any phone, right now.

**Referral module**
> **Bring two friends, move up the list.** Three sign‑ups from your link and we'll send you a set of printable "Hi, I'm yours" gift cards for the holidays.

### [SWAPS]

| Launch module | Waitlist replacement |
|---|---|
| §7 Buy | **Reserve yours** — a $5 refundable deposit holds the founding price of $24.99 for the first 3,000 tags. Card charged only when your tag is boxed and has a tracking number. Cancel in one click. *(Live from Mar 2027, not Oct 2026)* |
| §6 Specs | Same table, with every **[AMBER]** row replaced by its substitute wording and a line: *"We'll publish the measured numbers when the test reports are in. Until then we'd rather be vague than wrong."* |
| Reviews / social proof | **No fake proof.** Instead: "Line of the week" and a link to the content rules. We will not print a star rating before a customer has given us one |
| §5 In the box | Replaced by **"What we're making"** — the paper‑only box, the four colours, the mount system, and one sentence on what is not decided yet |

*Note — no countdown timers, no "join 10,000 parents" until it is true, and no stock photography of children. A privacy brand that borrows someone else's child has already lost the argument.*

---

## 11. Copy‑deck discipline

| Rule | Detail |
|---|---|
| Reading level | Grade 6 for the privacy and FAQ modules, matching the in‑app privacy notice |
| Sentence length | Under 20 words in body copy. If it needs a comma to survive, split it |
| Exclamation marks | Only inside a quoted tag line |
| Banned words on this page | find, locate, track, tracker, monitor, smart, AI, healthy, unhealthy, educational, developmental, nag, remind, alert, "bank‑grade", "we take privacy seriously" |
| Numbers | Always specific: 75 dB at 25 cm, 2,052 lines, seven days, five years. Never "ultra", "industry‑leading", "advanced" |
| The two voices | Body copy is calm and plain. Quoted tag lines are loud and funny. Never blend them in one sentence |
| Claim review | Compliance signs every module before publication, against `positioning-and-messaging.md` §9. One Amber sentence shipping early is a recall of the artwork, not a typo |
| Localisation | UK/AU/CA variants change spelling, currency, the statutory‑warranty line and the certification list only. ES/HI at v1.1 are transcreated, not translated — the tag lines especially |
| Accessibility | Every audio sample carries a visible transcript; the demo is keyboard operable; contrast ≥4.5:1; no motion without a reduced‑motion fallback |
| Consent | No image of a child is used without written parental consent, and none in paid media before launch |
