# CarePulse: business audit

What the product was, what it is now, and what is still missing before a
practice could run on it.

---

## The finding that matters most

**The application was collecting a full medical history and displaying it
nowhere.**

The registration form asks a patient for allergies, current medication,
past medical history, family medical history, insurance provider, policy
number, identification type, identification number, and an uploaded ID
document. All of it saved correctly.

**None of it was readable anywhere in the application.** There was no
patient screen. The only view was a flat list of appointments by date.
A clinician could not see a patient's allergies before a visit. Staff could
not check an insurance policy. Nobody could look at the ID that was
uploaded.

That is not an incomplete feature. It is a product that asks patients for
sensitive health information it then has no way to use, which is both
useless and, under most data-protection regimes, the wrong side of
data-minimisation: you should not collect what you cannot act on.

This is also the answer to "where can one see reports, history, or doctor's
comments". Nowhere. There was no patient record, no visit history, and no
place for a clinician to write anything.

---

## What was added

### 1. Patient record — `/admin/patients/[patientId]`

The screen that was missing.

- **Allergy banner at the top, in red.** In every real EHR this is the
  first thing on a chart, because it is the field with the worst
  consequence for being missed.
- Clinical summary: current medication, past and family history.
- **Visit history**: every appointment for that patient, with status,
  reason and cancellation reason. Nothing queried appointments by patient
  before; the data existed and was unreachable.
- Care team, resolved against the provider directory, with the site and its
  phone number.
- Demographics, emergency contact, insurance, identification, and a link to
  the uploaded ID document.
- Empty fields read **"Not recorded"** rather than rendering blank.
  "No known allergies" and "nobody asked" are different facts, and a blank
  cell conflates them.

Patient names in the worklist now link here. Previously they were inert
text.

### 2. Clinical notes — the "doctor's comments" layer

Append-only notes per patient, with author, category (consultation,
follow-up, test result, referral, phone call, administrative) and an
immutable timestamp.

**There is no edit and no delete, deliberately.** A clinical record that
can be quietly rewritten after the fact is worthless as evidence, and
altering one is a serious matter in most jurisdictions. Corrections are
made by adding a superseding note, which is how paper charts have always
worked.

Degrades gracefully: if `NOTE_COLLECTION_ID` is not configured, the panel
explains how to enable it instead of taking down the patient record.

### 3. Provider and facility directory

**Public — `/providers`:** physicians filterable by specialty, each with
credential, focus areas, site, languages, clinic days, whether they are
accepting new patients, and a realistic next-available. Plus hospitals and
clinics with address, phone, hours, service lines, and which site has a
24-hour emergency department.

Two business reasons this earns its place:

**It prevents mis-routing.** The booking form previously offered nine bare
names. A patient with a thyroid problem had no way to know which of them is
an endocrinologist, so they pick the first name or the friendliest photo,
and staff spend their time re-routing people. Specialty, location and
"accepting new patients" are the four facts that let someone self-route.

**It is the only page that can earn search traffic.** "Endocrinologist near
me" and "who treats diabetes in <town>" is how patients actually search. A
booking form ranks for none of that. `/providers` is now the one indexable
page besides the home page; `/admin` and `/patients` are explicitly
no-indexed.

Service lines include diabetes and endocrinology across three sites, plus
HbA1c and blood work at the diagnostic centre.

**Staff — `/admin/directory`:** the same directory plus an NPI Registry
lookup.

### 4. NPI Registry integration

Live integration with the CMS **National Plan and Provider Enumeration
System** — free, public, no API key:

```
https://npiregistry.cms.hhs.gov/api/?version=2.1&last_name=...
```

Staff search by name and get back NPI, credential, official taxonomy and
practice location, rather than typing a specialty from memory.

**Why it matters commercially:** the NPI is the identifier tying a
clinician to claims, e-prescribing and payer directories. Provider data
that drifts away from what payers hold is a routine cause of claim
rejections. Looking it up once, when a provider is added, keeps the
directory aligned.

**Honest limits:** US only. NPPES has no equivalent elsewhere; the
analogues (GMC in the UK, PMDC in Pakistan, AHPRA in Australia) mostly have
no open API, so manual verification is the realistic substitute. The
lookup also fails soft: a registry outage never blocks adding a provider.

I could not reach the live API from this environment to test a real
response, so the parser is written against the documented v2.1 shape and
every failure path returns a usable message rather than throwing. Worth one
manual search after deploy to confirm.

### 5. Booking confirmation, rebuilt

The screen you flagged. Three problems, all fixed:

- **Dead space.** `PatientShell` kept the content column at 58% width even
  when no side image was passed, leaving 42% of the viewport as empty
  canvas. It now goes full width when there is no aside.
- **No sense of what happens next.** Added a three-step timeline, so the
  patient does not phone the practice anyway to check — which is the exact
  call this product exists to prevent.
- **No reference number.** Added, so a patient who does call has something
  to quote.
- Added an explicit "if you cannot wait, do not wait for this request" line
  pointing at clinic phone numbers and emergency sites. A booking
  confirmation that does not say this is a genuine safety gap.

---

## Still missing before enterprise use

Listed honestly, roughly in order of how much each one blocks a real sale.

### Blocking

**Per-user staff accounts.** One shared passkey means an access log can
only say "someone with the passkey opened this record". Every serious
healthcare procurement asks who viewed a chart and when. This is the single
biggest gap and it invalidates the audit trail below until it is fixed.

**Audit log.** Who viewed, created or changed which record, when, from
where. Legally required in most healthcare regimes and the first thing a
compliance reviewer asks for.

**A signed BAA with each subprocessor.** Appwrite, the SMS provider, the
host. Without these, PHI on the platform is a contractual breach regardless
of how well the software is engineered.

**Data retention and deletion.** No policy, no mechanism. Patients have a
right to erasure in most jurisdictions and there is currently no way to
honour it.

### High value, not blocking

**Real availability and slot management.** The system accepts a request for
any time. It does not know the physician is in clinic Tuesdays and
Thursdays, has no concept of slot length, and cannot prevent double
booking. This is the largest functional gap: everything else is admin, this
is the actual scheduling problem.

**Document management beyond one ID.** Lab results, imaging reports,
referral letters, discharge summaries. The storage bucket exists and takes
exactly one file per patient. "Where do I upload a report" currently has no
answer, and the ID-document field is the only hook.

**Patient-facing record access.** A patient cannot see their own upcoming
appointments, history, or documents without phoning. A patient portal is
usually the second thing a practice asks for.

**Reminders that actually run.** SMS sends on status change, but there is
no scheduled job for "24 hours before". That is the feature that moves the
no-show number, which is the number the product is sold on.

**Insurance eligibility checking.** Policy number is collected and never
verified. Real-time eligibility (X12 270/271 via a clearing house) is what
stops a patient arriving with expired cover.

**Reporting.** No utilisation, no no-show rate, no revenue per clinic, no
provider load. A practice manager cannot answer "is this working" from
inside the product.

### Worth doing

- Waitlist and automatic fill when a slot is cancelled.
- Recurring and follow-up appointments booked from the record.
- Multi-language patient flow: the directory already records clinician
  languages, but the forms are English only.
- Calendar sync (ICS invite, Google/Outlook) on confirmation.
- Telehealth link on the appointment.
- Consolidate the two duplicate `CustomFormField.tsx` files that both
  currently exist and are both imported.

---

## Honest scoring

| Area | Before | Now |
| --- | --- | --- |
| Security | Patient data publicly readable | Server-side gate, verified |
| Clinical record | None | Full record, history, notes |
| Provider data | Nine names | Specialty, site, availability, NPI |
| Facilities | None | Four sites with service lines |
| Patient journey | Ends in a 404 | Confirmation with next steps |
| Audit trail | None | Still none — needs per-user accounts |
| Scheduling | Request-only | Still request-only |
| Reporting | None | Still none |

It is now a credible patient-access and front-desk product. It is not yet
a scheduling system, and it is not yet compliant-by-default. Those two are
the next real pieces of work, and neither is a weekend.
