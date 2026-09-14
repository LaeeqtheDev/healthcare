/**
 * Landing page content.
 *
 * Kept as data so the sales copy can be rewritten without touching JSX,
 * and so a future multi-tenant build can swap this for per-practice
 * content from the database with no layout change.
 *
 * ON IMAGERY
 * ----------
 * This page deliberately leads with product screenshots and generated
 * illustration rather than stock photography of smiling clinicians. Three
 * reasons, in order of how much they matter:
 *
 *  1. Buyers of clinical software want to see the screen they will be
 *     staring at for eight hours. Stock photos tell them nothing.
 *  2. Every competitor uses the same handful of stock medical photos, so
 *     they actively make a product look generic.
 *  3. A hardcoded remote photo URL is a hero image that breaks silently
 *     when the host changes a path, and a broken hero on a sales page
 *     costs more than no photo at all.
 *
 * If you do want photography, the practice's own photos convert best, and
 * `next.config.mjs` already allows Unsplash and Lorem Picsum hosts so a URL
 * can be dropped into `image` fields without further config.
 */

export const hero = {
  eyebrow: "Now onboarding dental and medical practices",
  headline: "Half your front desk's day",
  headlineAccent: "is the telephone.",
  sub: "CarePulse gives it back. Patients book themselves in about two minutes, reminders send on their own, and your team runs the whole day from one screen. Live the same afternoon you sign up.",
  primaryCta: "See the 2-minute booking",
  secondaryCta: "Open the staff worklist",
};

/** Three steps, above the fold. A buyer should understand the whole
 * product before they scroll twice. */
export const howItWorks = [
  {
    step: "01",
    title: "Patient books themselves",
    detail:
      "They pick a clinician, a time and a reason. No account, no password, no phone queue. Two minutes on a phone in a waiting room or at 11pm on a sofa.",
  },
  {
    step: "02",
    title: "It lands on your worklist",
    detail:
      "Pending, with their details and history attached. Your team confirms, reschedules or declines in one click, and the patient is texted automatically.",
  },
  {
    step: "03",
    title: "Nobody chases anyone",
    detail:
      "Confirmations and reminders send on a schedule you set, each with a one-tap reschedule link. Missed appointments become moved appointments.",
  },
];

/**
 * Comparison table.
 *
 * The competitor is almost never another clinical system. It is the phone
 * and a paper diary, or a generic booking tool the practice already pays
 * for. Naming both and being fair about what they do well is more
 * persuasive than pretending they do not exist, and it pre-empts the
 * objection a prospect was already forming.
 */
export const comparison = {
  columns: ["Phone & paper diary", "Generic booking tool", "CarePulse"],
  rows: [
    {
      feature: "Patients can book outside office hours",
      values: [false, true, true],
    },
    {
      feature: "Medical history collected before the visit",
      values: [false, false, true],
    },
    {
      feature: "Clinical notes and patient records",
      values: ["Paper", false, true],
    },
    {
      feature: "Allergies visible before a clinician walks in",
      values: ["If someone checks", false, true],
    },
    {
      feature: "Automated SMS reminders",
      values: [false, "Extra cost", true],
    },
    {
      feature: "Built around clinicians, not sales calls",
      values: [true, false, true],
    },
    {
      feature: "Works when the receptionist is on lunch",
      values: [false, true, true],
    },
    {
      feature: "Patient data stays gated and auditable",
      values: ["Filing cabinet", "Varies", true],
    },
  ],
};

/**
 * Security and data handling.
 *
 * On the landing page rather than buried in a policy, because in
 * healthcare this is a purchase blocker, not a footnote. Stated plainly
 * and without overclaiming: see the HIPAA answer in the FAQ.
 */
export const assurances = [
  {
    title: "Encrypted end to end",
    detail: "In transit and at rest, including uploaded documents.",
  },
  {
    title: "Gated staff access",
    detail: "Patient data is never public and never reaches an unauthenticated browser.",
  },
  {
    title: "Your data stays yours",
    detail: "Never sold, never used to train anything, exportable on request.",
  },
  {
    title: "Append-only clinical notes",
    detail: "Nothing in the record can be quietly rewritten after the fact.",
  },
];

export const trustStats = [
  { value: "~2 min", label: "for a patient to book, start to finish" },
  { value: "0", label: "phone calls to confirm an appointment" },
  { value: "1 screen", label: "for the whole day's schedule" },
  { value: "Same day", label: "setup, no hardware to install" },
];

/** The three jobs the product takes off the front desk. */
export const jobs = [
  {
    title: "Taking the booking",
    before:
      "A patient calls during your busiest hour, is put on hold, and a slot gets written into a paper diary.",
    after:
      "The patient books themselves at 11pm from their sofa. The request is on your worklist before you open.",
  },
  {
    title: "Chasing reminders",
    before:
      "Someone spends the first hour of every day ringing round tomorrow's list, and half of them do not pick up.",
    after:
      "Confirmations and reminders send automatically, with a one-tap link to reschedule instead of not turning up.",
  },
  {
    title: "Collecting history",
    before:
      "Medical history is filled in on a clipboard in the waiting room, then typed up again by someone else.",
    after:
      "The patient completes it at home. It is attached to the visit and readable before they walk in.",
  },
];

/** Vertical packs. Same platform, different defaults. */
export const verticals = [
  {
    name: "Dental practices",
    blurb:
      "Recall reminders, treatment plans, and appointment types that know a check-up is 20 minutes and a root canal is 90.",
    points: ["Six-month recalls", "Treatment plan staging", "Per-procedure durations"],
  },
  {
    name: "General practice",
    blurb:
      "Chronic disease review lists, vaccination tracking, and intake forms that match how a GP actually consults.",
    points: ["Chronic disease register", "Vaccination due dates", "Repeat prescriptions"],
  },
  {
    name: "Physiotherapy",
    blurb:
      "Block bookings, progress tracking between sessions, and forms built around assessment rather than admin.",
    points: ["Blocks of six", "Progress notes", "Exercise plans"],
  },
  {
    name: "Diabetes & BP clinics",
    blurb:
      "Glucose, HbA1c and blood pressure logs that a patient keeps between visits, with out-of-range alerts for staff.",
    points: ["HbA1c trends", "BP logs", "Out-of-range alerts"],
  },
];

export const faqs = [
  {
    q: "How long does setup take?",
    a: "Same day for a single-site practice. You add your clinicians, opening hours and appointment types, pick a template, and your booking page is live on a subdomain. There is no hardware and nothing to install on your machines.",
  },
  {
    q: "Do patients need to create an account?",
    a: "No, and no password to remember. They enter their name, email and phone once, and that identity carries through to booking and any future visits.",
  },
  {
    q: "What happens to our existing website?",
    a: "Keep it. You can either point a subdomain like book.yourpractice.com at CarePulse, or embed the booking widget into the site you already have. Practices that want to replace their site entirely can use the built-in landing page instead.",
  },
  {
    q: "Can staff still book on behalf of a patient?",
    a: "Yes. Phone bookings, walk-ins and anything else go in from the staff side, and appear on the same worklist. Self-booking is meant to reduce phone calls, not forbid them.",
  },
  {
    q: "Is this HIPAA or GDPR compliant?",
    a: "The software is built with encryption, access control and data minimisation as defaults, which is most of the engineering a compliance programme asks for. Compliance itself is organisational: it needs signed agreements with your hosting and messaging providers, staff training, and documented policy. Any vendor telling you their software is automatically compliant is selling you something. We will tell you exactly what we cover and what is on you.",
  },
  {
    q: "What does it cost?",
    a: "Per location, billed monthly, with no setup fee and no per-booking charge. A single-site practice pays one price whether it takes 50 bookings a month or 5,000. Book a call and we will quote against your actual list size.",
  },
];

/** Deliberately explicit scope. Discovering a boundary during onboarding
 * is how a cancellation happens in month two. */
export const scope = {
  does: [
    "Patient self-booking without an account",
    "Automated SMS confirmations and reminders",
    "A live worklist for staff, filterable by status",
    "Full patient records with history and clinical notes",
    "Provider directory with specialties and availability",
    "Public booking page and location maps",
  ],
  doesNot: [
    "Replace your clinical charting system or EHR",
    "Handle insurance claims or billing (on the roadmap)",
    "Provide formal HIPAA certification on your behalf",
    "Per-clinician logins yet, it is one staff passkey today",
  ],
};


/**
 * Pricing.
 *
 * On the page on purpose. "Contact us for pricing" is the single most
 * common reason a practice manager closes a tab: it signals the number is
 * negotiable, which signals it is high, and it forces a phone call before
 * they know whether you are even in range. Publishing a figure
 * disqualifies the wrong prospects before they cost you a call, and
 * qualifies the right ones before they arrive.
 *
 * Per location rather than per user, because per-user pricing punishes a
 * practice for giving the receptionist a login, which is exactly the
 * behaviour you want.
 */
export const pricing = {
  note: "Per location, billed monthly. No setup fee, no per-booking charge, cancel any time.",
  plans: [
    {
      name: "Single practice",
      price: "$79",
      cadence: "per location / month",
      forWho: "One site, up to 5 clinicians",
      features: [
        "Unlimited patients and bookings",
        "Public booking page and map",
        "SMS confirmations and reminders",
        "Staff worklist and patient records",
        "Clinical notes",
        "Email support",
      ],
      cta: "Start free for 14 days",
    },
    {
      name: "Multi-clinician",
      price: "$149",
      cadence: "per location / month",
      forWho: "One site, unlimited clinicians",
      features: [
        "Everything in Single practice",
        "Unlimited clinicians",
        "Per-specialty appointment types",
        "Provider directory with availability",
        "Custom domain",
        "Priority support",
      ],
      cta: "Start free for 14 days",
      featured: true,
    },
    {
      name: "Group & hospital",
      price: "Talk to us",
      cadence: "volume pricing",
      forWho: "Multiple sites, or a hospital department",
      features: [
        "Everything in Multi-clinician",
        "Multiple locations under one account",
        "Per-user staff logins and roles",
        "Full audit log",
        "Data residency options",
        "Onboarding and migration help",
      ],
      cta: "Book a call",
    },
  ],
};
