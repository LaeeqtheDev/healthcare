# CarePulse: security fix and clinical redesign

Everything below is applied. `tsc --noEmit` is clean, `next lint` reports no
warnings or errors, and `next build` succeeds.

---

## 1. The critical one: patient data was publicly readable

**This was not a design problem. `/admin` was effectively public.**

The old gate was `<PasskeyModal />`: a client component comparing
`NEXT_PUBLIC_ADMIN_PASSKEY` in the browser. Two independent failures, and
in an application holding patient data either alone is disqualifying.

**The passkey was not secret.** Anything prefixed `NEXT_PUBLIC_` is inlined
into the JavaScript bundle at build time. It was readable by anyone who
opened devtools and searched the source.

**The check ran after the data was sent.** `/admin` is a server component
that fetched every appointment and rendered it into the HTML *before* the
modal appeared. Disabling JavaScript, or simply reading the network
response, showed every patient name, email, physician and appointment time.
The modal was a curtain, not a lock.

### What replaces it

- `lib/auth.ts` — HMAC-signed, httpOnly, sameSite session cookie. Secret is
  `ADMIN_PASSKEY` (no `NEXT_PUBLIC_` prefix, so it never reaches the
  browser). Timing-safe comparison. 8-hour expiry, one clinic shift.
- `lib/actions/auth.actions.ts` — login and logout as server actions. The
  comparison happens on the server; a wrong attempt returns only "not
  recognised".
- `middleware.ts` — Edge gate on `/admin/:path*`, verifying the same HMAC
  with Web Crypto. Returns a hard 307 **with a zero-byte body** before any
  rendering happens.
- `app/admin/page.tsx` — checks auth again *before* the data fetch, as
  defence in depth. Deleting the middleware weakens the response but still
  does not expose data.
- `app/admin/login/page.tsx` — a real sign-in screen.

### Verified against the running production build

| Test | Result |
| --- | --- |
| Unauthenticated `GET /admin` | `307 -> /admin/login`, body **0 bytes** |
| Forged session cookie | `307 -> /admin/login` |
| Expired session | `307 -> /admin/login` |
| Valid signature, one byte flipped | `307 -> /admin/login` |
| Valid session | `200`, worklist renders |
| Passkey value in any client asset | **absent** (only the variable *name* appears, in setup-warning copy) |

### Known limitation, stated deliberately

This is one shared staff passkey. That is reasonable for a single practice
and **not** sufficient for real multi-user clinical use, where you need
per-user accounts so an access log can name a person. It is documented in
`lib/auth.ts` and listed on the marketing page under "what it does not do"
rather than quietly omitted.

---

## 2. Why the design changed from dark to light

The original near-black theme is the single strongest signal that an
interface was built for a portfolio screenshot rather than for a shift.

Clinical software is read in bright rooms, on mediocre monitors, often next
to a window, frequently by people over 40. Every real EHR ships dark-on-
light for that reason. The redesign moves to a light clinical palette where
every foreground/background pair clears WCAG AA, with an institutional blue
rather than a startup gradient.

**Status colour no longer carries meaning alone.** Roughly 1 in 12 men has
some colour vision deficiency, and "which row needs attention" is not a
question to answer in hue. Each status pill now has an icon *and* a text
label. The previous badges used the same dot shape for every state.

**Typeface:** IBM Plex Sans, drawn for dense institutional interfaces, with
real tabular figures and distinguishable `1/l/I` — which matters when the
thing on screen is a policy number or a date of birth. `tabular-nums` is on
globally so times and counts stop shifting width as they change.

---

## 3. Admin: from a table to a worklist

- Counters lead with the figure at a size readable across a desk, each with
  one line of interpretation. The old cards used decorative background
  images that made the number itself low-contrast.
- Status filter tabs with live counts, plus patient/physician search.
  **Filter state lives in the URL**, so staff can bookmark "pending only",
  send that link to a colleague, and refresh without losing their place.
  Search is debounced; without it every keystroke pushed a navigation.
- Proper table semantics: `<caption>`, `<th scope="col">`, `<th scope="row">`
  for the patient cell, `<time dateTime>` on schedules.
- **Cards below `md`, not a squashed table.** Five columns on a phone is a
  horizontal-scroll trap, and staff do check this between rooms.
- Two genuinely different empty states. "No appointments yet" and "your
  filter matched nothing" need different wording; collapsing them is how
  people conclude the system is broken.
- Row actions read "Confirm" and "Cancel" with per-row aria-labels naming
  the patient, instead of two identical ghost links reading "schedule".
- `loading.tsx` skeleton mirroring the real layout, so nothing reflows.
- `error.tsx` that **deliberately does not print `error.message`**. Data-layer
  errors routinely contain collection names, IDs and sometimes record
  contents. The digest is enough to find it in the logs.

---

## 4. Patient flow

- **Fixed a real mobile trap.** All three screens used `h-screen max-h-screen`
  with an inner scroll area. On a phone, browser chrome makes `100vh` taller
  than the visible area, so the submit button sat below the fold with no
  page scroll to reach it. Now normal document flow.
- A three-step progress indicator. The registration form is very long; a
  patient three screens into a medical history with no idea how much is
  left is a patient who abandons and phones the practice instead, which
  defeats the product.
- A privacy line on every screen collecting health data, answering the
  question that costs completions.
- Side images no longer requested at 1000×1000 for a 390px slot.

---

## 5. Bugs fixed

| Bug | Effect |
| --- | --- |
| `.PhoneInputInput::placeholder` was `#1a1d21` | Identical to the input background. The placeholder was **invisible** and the phone field looked broken. |
| `.container` redefined in `@layer utilities` | Silently clobbered Tailwind's own `container` class everywhere. Renamed `.form-pane`. |
| `bg-black-800`, `bg-black-900`, `bg-light-rays` | Referenced colours that do not exist in the config, so those rules generated nothing. |
| `focus-visible:ring-0` on every input and dialog | Removed the focus ring application-wide, making it unusable by keyboard. Restored. |
| `useCallback(..., [])` in `FileUploader` | Omitted `onChange`, capturing the first render's callback forever. React Hook Form re-creates field callbacks, so an upload after any other field changed could write into a stale closure. |
| `convertFileToUrl` never revoked | Every file a patient selected leaked a blob for the page's lifetime. Now revoked on change and unmount. |
| `className="h10 w-fit"` (×2) | Typo for `h-10`; no class generated. |
| Copyright read 2026, 2024, "CarePluse", and "CarePulse by Laeeqthedev" across four files | Now one derived year. |
| No `loading`, `error` or `not-found` boundaries | A failed fetch showed the default framework error page. |
| No per-route metadata | Every tab read "CarePulse". |

### Also added

- `viewport` with **no `maximum-scale=1`**. Blocking pinch zoom on an app
  showing dates of birth to older patients is an accessibility failure, and
  it is the default people copy without thinking.
- Skip-to-content link.
- `frame-ancestors 'none'` on every route. Unlike a marketing site, this
  app shows patient data, so clickjacking (overlaying an invisible worklist
  and capturing clicks on real appointment actions) is a genuine risk.
- `X-Robots-Tag: noindex` and `Cache-Control: no-store` on `/admin` and
  `/patients`, plus `robots.ts` disallowing both.

---

## 6. What I did not do

**I did not rewrite the form internals.** `RegisterForm`, `AppointmentForm`
and `CustomFormField` are ~900 lines of field logic and validation wiring.
Instead the old palette names (`dark-400`, `light-200`, `green-500`) are
**remapped onto the new light theme in `tailwind.config.ts`**, so the forms
inherit the redesign without touching field behaviour. Those aliases are
commented as intended for deletion once the forms are rewritten.

Without that mapping the old classes would simply not be generated and
would render as nothing, which is how a redesign ends up with invisible
input borders.

**Still worth doing:** per-user staff accounts with an access log,
rate limiting on the login route at the edge, and consolidating the two
duplicate `CustomFormField.tsx` files (`components/` and
`components/ui/forms/`) that currently both exist and are both imported.

---

## Setup

```bash
npm install
# In .env, set the staff passkey. Note: no NEXT_PUBLIC_ prefix.
ADMIN_PASSKEY=choose-something-long
npm run dev
```

If `ADMIN_PASSKEY` is unset, `/admin` fails closed and the login screen
explains what to configure rather than failing silently.


---

# Appwrite errors: fixed

## The error you hit

```
AppwriteException: Invalid document structure: Missing required attribute "userId"
  at $$ACTION_2 (lib/actions/patient.actions.ts:62)
```

**Cause: one letter.** `RegisterForm.tsx` sent `userID`. The collection
declares `userId`. Appwrite attribute keys are case-sensitive, so the field
simply was not there, and a required attribute was missing on every write.

`scripts/setup-appwrite.mjs` creates the attribute as `userId`, and
`types/index.d.ts` declares `RegisterUserParams.userId`. The schema was
right the whole time; the form was wrong.

**It should have been a compile error.** There was a `// @ts-ignore`
directly above the `registerPatient(patient)` call. `RegisterUserParams`
declares `userId`, so passing `userID` would have failed typecheck. The
ignore comment silenced exactly the bug that reached you. It is removed,
with a comment saying why.

## Three more bugs that were queued behind it

**1. No ID upload meant no patient record, and no error.** The
`databases.createDocument` call lived *inside* `if (identificationDocument)`.
A patient who did not upload an ID got no document, no exception, and a
silent `undefined` return. The upload is now optional and separate from the
record, which is what it always should have been: an ID document is one
field on a patient, not a precondition for having one.

**2. Every failure was swallowed.** `catch (error) { console.log(error) }`
returned `undefined`, so the form could not tell failure from success. The
request returned 200, nothing navigated, and the patient re-submitted. That
is precisely the seven repeated `POST /patients/.../register 200` lines in
your log. Errors now throw, and the form renders a real alert.

Appwrite schema errors are passed through to that alert rather than
replaced with "something went wrong", because the message names an
attribute and is genuinely useful to whoever configured the collection. It
never contains patient data.

**3. `getPatient` had the same typo.** It queried
`Query.equal('userID', ...)`. Even once records existed, lookup would have
returned nothing, so the booking step would have failed next. Fixed before
you could hit it.

**4. The success page did not exist.** `AppointmentForm` has always
redirected to `/patients/[userId]/new-appointment/success?appointmentId=...`
and there was no route there. Every patient who completed the entire flow
landed on a 404 *after* their appointment was saved. The practice saw the
booking; the patient was certain it had failed. Route created.

Its wording is deliberately "request received", not "appointment
confirmed". The status at that point is `pending` and a staff member still
has to accept it. Telling a patient it is confirmed is how people turn up
to a clinic that is not expecting them.

## Preventing the next one

**`npm run check:appwrite`** compares every attribute the app writes against
what actually exists on your collections and reports:

- `CASE MISMATCH` — app writes `userID`, collection has `userId` (this bug)
- `MISSING` — the attribute does not exist
- `BLOCKING` — a **required** attribute the app never sends, which fails
  every write
- `unused` — exists but is never written

Run it after any schema change. A case-only difference is close to
invisible in review and costs an afternoon to find at runtime.

`lib/appwrite.config.ts` now also warns at startup, by name, about missing
environment variables, instead of letting them surface as a 400 from
Appwrite three screens into a patient form. It warns rather than throws so
`next build` still works without live credentials.

`scripts/setup-appwrite.mjs` printed `NEXT_PUBLIC_ADMIN_PASSKEY` at the
end; it now prints `ADMIN_PASSKEY` with a note explaining the prefix.


---

# MVP sales upgrade: landing page and maps

## Landing page, rebuilt to sell

Restructured around the buyer (a practice manager), not the patient.

- **Hero leads with the cost, not the feature.** "Your front desk spends
  half its day on the phone. Get that day back." A practice manager does
  not wake up wanting scheduling software; they wake up short-staffed.
- **Before/after for the three jobs** it takes off the front desk, each
  showing today's version and the replacement side by side. Far more
  persuasive than a feature list, because the reader recognises their own
  Tuesday in the "today" column.
- **Vertical packs** section: dental, general practice, physiotherapy,
  diabetes and BP clinics. This is what lets one page sell to every
  segment without going generic.
- **What it does / does not** kept and expanded. Naming the boundary in
  writing is what stops a cancellation in month two.
- **FAQ rewritten for the buyer**: setup time, existing website, staff
  booking on behalf of patients, cost, and a direct answer on HIPAA that
  says compliance is organisational and any vendor claiming their software
  is automatically compliant is selling something.
- All copy now lives in `lib/marketing.ts`, so it can be rewritten without
  touching JSX, and swapped for per-tenant content later with no layout
  change.

## Maps, with real nearby hospitals

**`components/clinical/FacilityMap.tsx`** — Leaflet with OpenStreetMap
tiles, on both the landing page and `/providers`.

**Why not Google Maps:** it needs a billable API key, its terms forbid
caching results, and it requires results be shown on a Google map. A
practice should not need a Google Cloud account to put a pin on their own
clinic. OSM needs no key and the licence permits showing the data on our
own map.

**Real nearby facilities.** "Hospitals near me" asks the browser for a
location, then queries the **Overpass API** (OpenStreetMap) for real
hospitals, clinics, doctors, dentists and pharmacies within a capped
radius, sorted by distance, with phone numbers and emergency flags.

Free, no API key. The call runs **server-side on purpose**: Overpass is
volunteer-funded and asks callers to identify themselves and be gentle.
Going through our server means one identifiable user agent, one cache, and
one place to back off, instead of thousands of browsers hitting it
independently. Results cache for 24 hours, the radius is capped at 25 km,
and there is a fallback mirror because Overpass instances go down for
maintenance fairly often.

**Accessibility:** every map is paired with a synced location list. A map
alone is unusable on a phone and invisible to a screen reader, and most
people scan the list first regardless.

**Not tested against the live Overpass or NPI endpoints** from the
environment this was written in, since outbound network is restricted
there. Both parsers are written against the documented response shapes and
every failure path returns a usable message rather than throwing. Worth one
manual check of each after deploy.

## Local SEO

`/providers` now emits **MedicalClinic / Hospital / Physician** JSON-LD
with addresses, geo coordinates, opening hours, phone numbers and service
lines.

This matters more than it looks: crawlers cannot read a Leaflet canvas, so
without explicit structured data a map page is invisible for "dentist near
me" and for the map pack. Verified that facility names, addresses, hours
and phone numbers all appear in the server-rendered HTML, not only in
client JavaScript.

## On imagery

The page deliberately leads with **product screenshots and generated
illustration rather than stock photography**, and the reasoning is recorded
in `lib/marketing.ts`:

1. Buyers of clinical software want to see the screen they will stare at
   for eight hours. A photo of a smiling clinician tells them nothing.
2. Every competitor uses the same handful of stock medical photos, which
   actively makes a product look generic.
3. A hardcoded remote photo URL is a hero image that breaks silently when
   the host changes a path, and a broken hero on a sales page costs more
   than no photo.

`next.config.mjs` now allows `images.unsplash.com` and `picsum.photos` as
remote hosts, so real photos can be dropped into the content without a
config change once a practice supplies their own. Nothing is fetched unless
a URL is actually used.

## Performance

The map is a dynamic import with `ssr: false` (Leaflet touches `window` at
module scope and cannot server-render). Leaflet therefore stays out of the
initial bundle: the landing page first load is 102 kB, unchanged, and the
map chunk arrives only when that section is reached.


---

# UI fixes + conversion elements

## The alignment bug (both screenshots, one cause)

Cards in a CSS grid row stretch to equal height automatically. What was
missing was anything telling the *contents* to fill that height, so every
element below a variable-length block sat at a different vertical position
in each card.

**Provider cards** — clinicians have one or two rows of focus tags, so the
divider, site/language/days rows, status pill and "Request an appointment"
button were all offset between neighbouring cards.

**Before/after cards** — the "Today" sentence wraps to two or three lines
depending on the sentence, so the blue "With CarePulse" panels started at
different heights across the row.

**Fix, one line in each case:** `flex-1` on the variable-length block, so it
absorbs the difference and everything below it bottom-aligns. Applied to
provider focus tags, facility service tags, vertical-pack bullet lists,
pricing feature lists, and the before/after panels.

## `size-13` was not a real class

`app/providers/page.tsx` used `className="size-13"` on the provider avatar.
Tailwind's default spacing scale has 12 and 14 but **not 13**, so no rule
was generated and the image silently fell back to its intrinsic size.
Replaced with the arbitrary value `size-[52px]`.

Worth knowing as a class of bug: an invalid Tailwind class fails silently.
There is no error, nothing in the console, and the element just renders
slightly wrong.

## Revenue calculator, on the landing page

Three sliders — appointments per week, average appointment value, no-show
rate — returning annual revenue lost and a recovery range, in six
currencies.

This is the element that sells instantly, and the mechanism is structural:
it turns a generic claim into the reader's own number in about five
seconds. A practice manager who watches a five-figure sum appear against
their own volume has done the selling themselves and arrives at the demo
already arguing your case internally.

Two rules it keeps, both deliberate:

- **Their numbers, not an industry statistic.** Every competitor quotes a
  no-show percentage from a study nobody has read. Taking it as input means
  we are not publishing a claim we cannot source.
- **The recovery figure is a range**, labelled an estimate, with a line
  saying any vendor quoting one confident number is guessing. Being the
  only vendor who admits that reads as competence, and it stops the number
  being quoted back at you in month three.

Runs entirely client-side, and the card says so, because people are
reasonably wary of typing practice revenue into someone else's form.

## Published pricing

Three tiers: $79 single practice, $149 multi-clinician, talk-to-us for
groups and hospitals. Per location, monthly, no setup fee, no per-booking
charge.

**"Contact us for pricing" is the most common reason a practice manager
closes the tab.** It signals the number is negotiable, which signals it is
high, and it forces a call before they know whether you are even in range.
Publishing a figure disqualifies the wrong prospects before they cost you a
call and qualifies the right ones before they arrive.

Priced **per location rather than per user** on purpose: per-user pricing
punishes a practice for giving the receptionist a login, which is exactly
the behaviour you want.

All pricing lives in `lib/marketing.ts`, editable without touching JSX.


---

# Landing page rebuild + calculator correction

## You were right that something was wrong. It was not the direction.

Higher no-show rate correctly produces a larger loss. At 120 appointments a
week and $180 each, 1% gives $10,800 and 12% gives $129,600. Lower rate,
smaller number.

**But there was a real bug, and it is almost certainly what you saw.** The
old formula rounded the WEEKLY figure before multiplying by 50 weeks:

```js
Math.round(perWeek * rate / 100) * 50   // wrong
```

Two visible defects fell out of that:

- **Jumps.** At 120 a week, 2% showed 100 missed and 3% showed 200. The
  displayed loss *doubled* for a one-point move, which makes the whole
  calculator look invented.
- **Zero.** A 10-appointment-a-week practice at any rate under 5% rounded to
  0 missed per week, so the result read as a loss of nothing at all. The
  practices most likely to doubt the product got the least convincing
  number.

Now rounds at the annual level, and the output also shows the weekly figure
so the arithmetic is legible rather than taken on trust.

## Landing page, rebuilt

**Dark hero.** The single cheapest way to make a page read as a product
rather than a template: it gives the product screenshot somewhere to glow
against and creates one focal point instead of a wall of even-toned cards.
Layered radial gradients, a faint masked engineering grid, and a staggered
entrance animation that lands the eye on the headline first.

**Headline changed from a statement to an accusation.** "Your front desk
spends half its day on the phone" described a fact. "Half your front desk's
day **is the telephone**" is the reader's Tuesday.

**New sections, each doing a specific job:**

| Section | Job |
| --- | --- |
| Announcement bar | Removes the two biggest hesitations before the fold: free, live today |
| How it works, in 3 | A buyer understands the entire product before scrolling twice |
| Comparison table | Names the real competitors: the phone, and a generic booking tool |
| Security block | Answers the compliance question on the homepage, not in a policy |
| Proper footer | Four columns; the old one was two links |

**The comparison table is the most commercially useful addition.** The
competitor here is almost never another clinical system, it is the phone and
a paper diary, or a tool the practice already pays for. Naming both and
being fair about what they do well is more persuasive than pretending they
do not exist, and it pre-empts the objection the prospect is already
forming. Rows that cannot honestly be yes or no render a qualified answer
("Paper", "If someone checks", "Extra cost") rather than being forced into a
tick.

## One thing I did not add, deliberately

**No customer logos and no testimonials.** Those are the two strongest
elements on a landing page like this, and I will not fabricate them. Invented
social proof in healthcare is both a legal problem and the fastest way to
lose a practice manager who checks.

That is the highest-value thing you can add yourself, and it costs nothing:
after your first clinic is live, ask for two sentences and permission to use
their name. One real quote from a named practice outperforms every section
on this page.
