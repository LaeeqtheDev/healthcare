# CarePulse → multi-tenant healthcare SaaS

The full feature surface, ordered by what actually earns money rather than
by what is fun to build.

Read the "Four defects" section first. They are small, and until they are
fixed no demo survives contact with a prospect.

---

# Part 0 — Four defects visible in your screenshots

## 0.1 "Unknown patient" on every row (you did not mention this; it is the worst one)

Your worklist shows **Unknown patient** twice. Root cause:

```js
// scripts/setup-appwrite.mjs, appointment collection
["patient", "string", 255, true]   // a plain string
```

```ts
// types/appwrite.types.ts
patient: Patient;                   // declared as an expanded object
```

The `patient` field holds an **id string**, not a patient object. So
`appointment.patient?.name` is permanently `undefined`, and my patient-record
link (`appointment.patient?.$id`) never renders either.

**Fix, two options:**

- *Appwrite relationships:* change the attribute to a relationship to the
  patient collection, and Appwrite expands it on read. Cleanest.
- *Manual join:* fetch the appointments, collect the unique patient ids,
  fetch those patients in one `Query.equal("$id", [...ids])`, and stitch.
  Works on the current schema with no migration.

I would take the manual join, because it works today on data you already
have and does not require anyone to touch a live collection.

## 0.2 "Confirm" shown on an already-scheduled appointment

Row one is **Scheduled** and still offers **Confirm**. The actions are
hard-coded per row rather than derived from status. A staff member cannot
tell what state anything is in from the buttons, which is the entire job of
a worklist.

**Correct behaviour, driven by status:**

| Status | Actions |
| --- | --- |
| Pending | Confirm · Propose new time · Decline |
| Scheduled | Reschedule · Cancel · Mark arrived · Mark no-show |
| Cancelled | Reinstate (nothing else) |
| Completed | View notes only |

Note `Completed`, `Arrived` and `No-show` do not exist yet. Without them
you can never compute a no-show rate, which is the single number the whole
product is sold on.

## 0.3 Returning patients start from scratch

Entering the same name/email/phone creates a fresh journey with an empty
form every time. There is no "is this you?" step, no prefill, no history.

**What it should do:** match on email or phone → send a one-time code →
on verify, load the existing record → show *Your details (last updated
12 March)* with an Edit toggle → skip straight to choosing a time. New
patient, returning patient, and "same email, different person" (a family
sharing one address is extremely common) all need distinct handling.

## 0.4 Physicians cannot be added or removed

They live in `lib/directory.ts`, a source file. Adding a doctor is a code
change and a deploy. This is fine for a demo and fatal for a product: it
means you cannot onboard a customer without an engineer.

Everything in that file has to become tenant-scoped database records with a
management UI. That is Part 2 below and it is the true starting point of
the SaaS.

---

# Part 1 — Multi-tenancy (the foundation everything else needs)

Nothing below matters until this exists. Retro-fitting tenancy into a
single-tenant schema is the most expensive mistake available here, and it
gets more expensive every week.

## 1.1 Tenant model

- **Organisation** — the billing entity. A hospital group, a dental chain,
  a single private clinic, a government health department.
- **Location** — a physical site under an organisation. Own address,
  timezone, opening hours, phone, services, room count.
- **Department / service line** — Cardiology, Orthodontics, Physiotherapy,
  Diabetes clinic. Scopes providers, appointment types and reporting.
- **Provider** — a clinician, who may work at several locations on
  different days.
- **Staff user** — a human with a login and a role.
- **Patient** — belongs to an organisation, *not* to the platform. Two
  organisations must never see each other's patients.

## 1.2 Tenant isolation, non-negotiable

- Every record carries `orgId`. Every query filters on it, enforced at the
  data-access layer rather than remembered per query.
- Row-level security at the database, not only in application code. Assume
  application code will one day forget.
- A tenant-scoped session: the signed-in user's `orgId` comes from the
  session, never from a URL or request body. Otherwise changing a number in
  the address bar reads another practice's charts.
- Separate storage prefixes per tenant for documents.
- **Cross-tenant test suite.** Every endpoint gets one test that signs in as
  Org A and tries to read an Org B record. This is what a security
  questionnaire asks about, and it is the thing that ends a deal if it
  fails.

## 1.3 Tenant addressing

- Subdomain per tenant: `smilecare.carepulse.app`.
- Custom domain with automatic TLS: `book.smilecaredental.com`.
- Reserved-subdomain list, so nobody registers `admin`, `api`, `www`.

## 1.4 Onboarding, self-serve

The moment a signup needs you on a call, growth stops.

1. Sign up, verify email.
2. Pick a vertical (dental, GP, physio, diabetes, multi-specialty, lab,
   hospital). This preselects appointment types, intake form fields and
   terminology.
3. Add the first location: address, phone, hours, timezone.
4. Add providers, or invite them by email to complete their own profile.
5. Set opening hours and slot lengths.
6. Choose a template, upload a logo, set brand colours.
7. Publish. Booking page is live on a subdomain immediately.

Add an **import wizard**: CSV of patients and providers, plus mapping for
the common incumbents. Migration friction is the number one reason a
practice stays on software it hates.

---

# Part 2 — Practice configuration (what you asked for: add/remove everything)

Everything here is a screen a practice administrator uses. None of it
should require a deploy.

## 2.1 Locations

- Add, edit, archive. Never hard delete: appointment history references it.
- Address with **map pin**, set by geocoding the address and draggable to
  correct it, because geocoders get clinic entrances wrong constantly.
- Timezone per location. A group with sites in two timezones will break any
  system that assumes one.
- Opening hours, including split shifts (09:00–13:00, 16:00–20:00, which is
  the norm in much of Asia and southern Europe).
- Holiday calendar and one-off closures.
- Rooms and resources: chairs, imaging machines, physio beds. An
  appointment can need a room as well as a person.
- Parking, accessibility, public transport notes, entrance photo.
- Per-location phone, email, emergency flag.

## 2.2 Providers

- Add, edit, deactivate, reactivate.
- Profile: photo, credentials, specialty, sub-specialties, languages, bio,
  years practising, registration number (NPI, GMC, PMDC, AHPRA, PMC).
- Per-location schedule: which site, which days, which hours.
- Slot length **per appointment type** — a dental check-up is 20 minutes, a
  root canal is 90.
- Buffer time between appointments, and daily caps.
- Accepting new patients, on or off.
- Insurance panels accepted.
- Leave and absence, blocking their calendar.
- Optional NPI Registry verification for US tenants (already built).

## 2.3 Services and appointment types

- Name, duration, price, colour, description.
- Which providers can deliver it, which rooms it needs.
- Prep instructions sent to the patient on confirmation ("fasting required",
  "bring previous X-rays").
- Online-bookable or staff-only.
- Deposit required, yes or no.
- Follow-up rules: auto-suggest a review in 6 months.

## 2.4 Intake forms, per vertical

A form builder, because a dentist and a physiotherapist need different
questions and neither wants the other's.

- Field types: text, number, date, select, multi-select, checkbox, file,
  signature, body diagram, pain scale.
- Conditional logic: show pregnancy questions only where relevant.
- Required, optional, staff-only fields.
- Assign a form to an appointment type.
- Versioning: a form can change, but a completed submission must keep the
  version that was answered.
- Consent documents with e-signature and a timestamp.

## 2.5 Staff and roles

- Invite by email, with role.
- Suggested roles: Owner, Administrator, Clinician, Front desk, Billing,
  Read-only auditor.
- Granular permissions: view charts, edit charts, view financials, manage
  staff, export data.
- Per-location scoping: front desk at one site should not see another's
  patients.
- **Per-user login, MFA, session timeout, forced re-auth for sensitive
  actions.** This replaces the shared passkey and is what makes the audit
  log meaningful.

## 2.6 Branding and the tenant landing page

- Logo, favicon, brand colour, typeface pairing.
- Template picker with vertical-appropriate layouts.
- Editable sections: hero, services, team, locations with an embedded map,
  opening hours, insurance accepted, FAQ, testimonials, gallery, blog.
- Per-location landing pages, which is how you rank for "dentist in
  <suburb>" rather than competing with yourself.
- SEO fields, Open Graph image, `LocalBusiness` / `MedicalClinic` /
  `Physician` schema.org markup, auto-generated sitemap.
- Multi-language toggle.
- Embeddable booking widget for a practice that already has a website and
  will not move.

---

# Part 3 — Scheduling (the actual product)

Today the system accepts a request for any time and cannot prevent a double
booking. This is the largest functional gap in the whole application.

- Real availability from provider schedules minus existing appointments,
  leave and closures.
- Slot generation per appointment type and per resource.
- Double-booking prevention with an atomic hold, plus a short reservation
  while the patient completes the form.
- Timezone-correct display; show the patient their own timezone.
- Reschedule and cancel by the patient, inside a configurable window.
- **Waitlist with auto-fill.** When a cancellation lands, offer it to the
  waitlist by SMS, first to accept takes it. This is the highest-ROI
  feature in the entire document: it converts cancellations, which are pure
  loss, into revenue, with no extra staff time.
- Recurring appointments (physio blocks of six, antenatal schedules).
- Group appointments and classes.
- Family and dependant booking from one account.
- Overbooking rules for clinics that deliberately overbook.
- Queue and walk-in management, with a live "now serving" screen. Essential
  for government and high-volume clinics where booking is not how patients
  arrive.
- Drag-and-drop day and week calendar for staff.
- Room and equipment scheduling alongside people.
- Provider calendar sync, two-way, with Google and Outlook.
- ICS invite on confirmation.

---

# Part 4 — Clinical records

- Patient chart: demographics, allergies, medications, conditions, history.
- **Append-only clinical notes** (built) with templates per vertical: SOAP,
  dental charting, physio assessment.
- Document management: labs, imaging, referrals, discharge summaries, with
  categories, versioning and preview. Today the bucket takes one ID file.
- **Dental charting**: tooth-by-tooth odontogram, treatment plan, perio
  chart. Without this you cannot sell to a single dentist.
- **Physio**: body-map pain marking, range-of-motion tracking, exercise
  prescription, progress charts.
- **Chronic disease (diabetes, hypertension)**: BP log, blood-glucose and
  HbA1c trend charts, weight and BMI, medication adherence, target ranges
  with out-of-range alerting. You named "sugar" and "BP" specifically, and
  this is the module that serves them; it is also the one that keeps
  patients engaged between visits, which is what makes a patient app worth
  shipping.
- Vitals at check-in.
- Vaccination register with due dates.
- Prescriptions, with a printable and, where legal, e-prescribing.
- Lab ordering and results, ideally HL7 or FHIR.
- Referral letters in and out.
- Growth charts for paediatrics.
- Care plans with review dates.
- Problem list and ICD-10 coding.

---

# Part 5 — Patient experience

- Returning-patient recognition and prefill (defect 0.3).
- Patient portal: upcoming and past appointments, documents, notes shared
  with them, invoices.
- Patient mobile app, or a well-built PWA first.
- Self-service reschedule and cancel.
- Reminders by SMS, email, WhatsApp and push, on a cadence the practice
  sets. **WhatsApp matters enormously outside North America** and is often
  the deciding feature in South Asia, the Middle East and Latin America.
- Digital check-in, including QR code on arrival.
- Pre-visit forms completed at home.
- Post-visit summary and aftercare instructions.
- Review requests, routed to Google for happy patients and to a private
  form for unhappy ones.
- Family accounts and dependants.
- Multi-language, including right-to-left layout for Arabic and Urdu.
- Accessibility to WCAG 2.2 AA, which is a hard requirement for government
  contracts, not a nice-to-have.
- Telehealth: video consultation, waiting room, screen share, recording
  with consent.

---

# Part 6 — Billing and revenue

This is what turns the product from a utility into something with pricing
power, because it touches money the practice can measure.

- Invoicing, receipts, part payments.
- Online payment at booking, deposits, no-show fees.
- Card on file, with the practice's own payment provider.
- Insurance claim submission and tracking.
- **Real-time eligibility checking** (X12 270/271 via a clearing house).
  Stops a patient arriving with expired cover, which is a bill nobody pays.
- Co-pay calculation at booking.
- Government scheme billing: Medicare, NHS, provincial schemes, state
  insurance. Required for the public-sector market you mentioned.
- Treatment plans with staged payments, the norm in dentistry.
- Packages and memberships, the norm in physio and aesthetics.
- Outstanding-balance reminders.
- Refunds and credit notes.
- Daily reconciliation and end-of-day cash-up.
- Revenue per provider, per service, per location.

---

# Part 7 — Operations and analytics

- Dashboard: today at a glance, per location.
- **No-show rate**, by provider, service and time of day. Needs the
  `Arrived` / `No-show` statuses from defect 0.2.
- Utilisation: how much of each provider's available time was booked.
- Lead time from request to appointment.
- Cancellation reasons.
- New versus returning patients.
- Revenue and outstanding balances.
- Waitlist conversion.
- Channel attribution: which bookings came from the landing page, search,
  or a walk-in.
- Exportable reports, scheduled by email.
- Government reporting formats where mandated.

---

# Part 8 — Compliance and trust

This section is what closes enterprise and public-sector deals. It is also
the least visible work, so it gets skipped and then blocks a contract.

- **Per-user accounts** (prerequisite for everything else here).
- **Full audit log**: who viewed, created, changed or exported which record,
  when, from what IP. Immutable and exportable.
- Break-glass emergency access, heavily logged.
- Consent management with versioned documents.
- Data retention policies and automated purge.
- Right to erasure and data export, per patient.
- Encryption at rest and in transit, documented key management.
- **BAAs with every subprocessor.** Without these, PHI on your platform is
  a contractual breach no matter how good the code is.
- Regional data residency: EU, UK, US, Gulf, India. Several markets legally
  require in-country storage.
- Backups with a stated RPO/RTO and a tested restore. "We take backups" is
  not an answer; "we restore in under four hours and tested it last month"
  is.
- Penetration test report and a security whitepaper you can hand over.
- SOC 2 Type II, eventually. Enterprise buyers ask on the first call.
- HIPAA, GDPR, and local equivalents.
- Status page and incident communication policy.

---

# Part 9 — Integrations

- Google Calendar, Outlook, Apple Calendar.
- Google Business Profile: sync hours, enable Reserve with Google.
- WhatsApp Business API, Twilio, local SMS gateways.
- Stripe, plus regional processors (Razorpay, Paystack, HBL, JazzCash,
  Mada). Payment coverage decides which markets you can even sell into.
- Accounting: Xero, QuickBooks, Zoho.
- Labs and imaging via HL7 v2 or FHIR.
- **FHIR API for the platform itself.** Increasingly a procurement
  requirement, and it is how you integrate with hospital systems rather
  than replacing them.
- Zapier and webhooks.
- Public REST API with keys and rate limits.
- SSO: SAML and OIDC, for hospital and government IT.
- Pharmacy and e-prescribing networks.

---

# Part 10 — Platform and go-to-market

- Plan tiers and per-location or per-provider pricing.
- Free trial, in-app upgrade, self-serve billing.
- Usage metering for SMS and storage overages.
- **White-label and reseller tiers.** A distributor in one country reselling
  under their own brand is often faster than direct sales in a market you
  do not know.
- Marketplace of templates and form packs per vertical.
- In-app onboarding checklist and product tours.
- Help centre and in-app support chat.
- Feature flags for staged rollout.
- Multi-region deployment.
- Uptime SLA and a status page.

---

# Vertical packs

Same platform, different defaults. This is how one product sells to every
segment you listed without becoming generic.

| Vertical | What ships turned on |
| --- | --- |
| **Dental** | Odontogram, treatment plans with staged payments, recall reminders, perio charting, imaging attachments |
| **General practice** | Chronic disease register, vaccination register, referrals, repeat prescriptions |
| **Physiotherapy** | Body map, ROM tracking, exercise prescription, block bookings, progress charts |
| **Diabetes / BP clinic** | Glucose and HbA1c logs, BP logs, target ranges, out-of-range alerts, dietitian referral, group education classes |
| **Private specialist** | Referral intake, insurance panels, secretary workflows, consultation letters |
| **Diagnostic lab** | Test catalogue, sample tracking, result upload, home collection routing |
| **Hospital** | Departments, bed and theatre scheduling, inpatient flow, multi-department referrals |
| **Government / public** | Queue and token management, walk-in flow, scheme billing, mandated reporting, data residency, accessibility compliance |

---

# Sequencing: what to build, in what order

A list this size is a way to build nothing for two years. This is the order
that gets to revenue.

## Phase 1 — Make it demoable (2 to 3 weeks)

Fix the four defects. Real availability and no double-booking. Status-aware
actions with Arrived and No-show. Returning-patient prefill.

Without these, a demo breaks in front of a prospect.

## Phase 2 — Make it sellable to one practice (6 to 10 weeks)

Per-user staff accounts with roles. Audit log. Provider, location and
service management in the UI. SMS reminders on a schedule. Payments at
booking. Basic dashboard with no-show rate.

Now one practice can pay you.

## Phase 3 — Make it multi-tenant (8 to 12 weeks)

Organisations, locations, tenant isolation with the cross-tenant test
suite. Subdomains. Self-serve onboarding. Tenant landing page builder with
maps. Plan tiers and billing.

Now it is a SaaS and can grow without you.

## Phase 4 — Make it defensible (ongoing)

Waitlist auto-fill. Patient portal. One vertical pack, chosen by whoever
signs first. Insurance eligibility. FHIR API. Compliance package.

---

# Honest view

The largest risk is not the feature list. It is that this is a market with
entrenched incumbents, and "another booking system" loses to them on
features while losing to Calendly on price.

What actually wins here is picking **one vertical and one geography** and
being unarguably the best option for it. A dental practice in Lahore has
different needs from a dental practice in Leeds, and both are underserved by
software built for California. The vertical packs above are the strategy;
the platform is just what makes them cheap to produce.

I would pick the vertical where you can get five real practices on the phone
this month, build Phase 1 and 2 against those five, and let them tell you
which of Parts 3 to 10 they will actually pay for. Most of this document is
correct and only some of it is urgent, and the five practices are the only
reliable way to tell which is which.
