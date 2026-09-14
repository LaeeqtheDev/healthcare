import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarCheck2,
  Check,
  ClipboardList,
  Clock3,
  Lock,
  Minus,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { PulseMark } from "@/components/clinical/AppHeader";
import { MapSection } from "@/components/clinical/MapSection";
import { RevenueCalculator } from "@/components/marketing/RevenueCalculator";
import { facilities, mapDefaults, providers } from "@/lib/directory";
import {
  faqs,
  hero,
  jobs,
  pricing,
  scope,
  trustStats,
  verticals,
} from "@/lib/marketing";

export default function LandingPage() {
  const physicians = providers.slice(0, 9);

  return (
    <div className="bg-canvas">
      {/* ── NAV ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-[500] border-b border-line bg-surface/95 backdrop-blur">
        <div className="shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-600 text-white">
              <PulseMark />
            </span>
            <span className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
              CarePulse
            </span>
          </div>
          <nav className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/providers"
              className="rounded-md px-3 py-2 text-[0.875rem] font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              Find a doctor
            </Link>
            <Link
              href="/admin"
              className="hidden rounded-md px-3 py-2 text-[0.875rem] font-semibold text-ink-muted transition-colors hover:text-ink sm:block"
            >
              Staff sign in
            </Link>
            <Link
              href="/patients"
              className="inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-[0.875rem] font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Book a visit
            </Link>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* ── HERO ───────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-line bg-surface">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_75%_0%,#EAF2FB,transparent_70%)]"
          />
          <div className="shell relative grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-1.5 text-[0.75rem] font-semibold text-ink-muted">
                <Stethoscope className="size-3.5" aria-hidden />
                {hero.eyebrow}
              </span>

              <h1 className="t-display mt-6 text-ink">
                {hero.headline}
                <br />
                <span className="text-brand-600">{hero.headlineAccent}</span>
              </h1>

              <p className="t-body mt-6 max-w-xl text-ink-muted">{hero.sub}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/patients"
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-brand-600 px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  {hero.primaryCta}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/providers"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-line-strong bg-surface px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-raised"
                >
                  {hero.secondaryCta}
                </Link>
              </div>

              <p className="mt-5 flex items-center gap-2 text-[0.8125rem] text-ink-subtle">
                <ShieldCheck className="size-4 shrink-0" aria-hidden />
                Encrypted in transit and at rest. Staff access is gated and
                patient records are never public.
              </p>
            </div>

            {/* Product screenshot, not stock photography. Buyers of
                clinical software want the screen they will stare at. */}
            <div className="lg:col-span-6">
              <WorklistPreview />
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP ────────────────────────────────── */}
        <section className="border-b border-line bg-raised/40">
          <dl className="shell grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4">
            {trustStats.map((s) => (
              <div key={s.label}>
                <dt className="text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-brand-600">
                  {s.value}
                </dt>
                <dd className="mt-2.5 max-w-[190px] text-[0.8125rem] leading-snug text-ink-muted">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── REVENUE CALCULATOR ─────────────────────────── */}
        <section className="shell py-16 sm:py-20">
          <div className="mb-8 max-w-2xl">
            <h2 className="t-h1 text-ink">
              Every empty chair was already paid for.
            </h2>
            <p className="t-body mt-3 text-ink-muted">
              The staff were rostered, the room was booked, the slot was
              blocked. Move the sliders to your own practice and see what a
              year of it adds up to.
            </p>
          </div>
          <RevenueCalculator />
        </section>

        {/* ── BEFORE / AFTER ─────────────────────────────── */}
        <section className="shell py-16 sm:py-24">
          <h2 className="t-h1 max-w-2xl text-ink">
            Three jobs your front desk currently does by hand.
          </h2>
          <p className="t-body mt-4 max-w-xl text-ink-muted">
            None of them need a person. All of them cost you one.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {jobs.map((j, i) => (
              <article key={j.title} className="card flex h-full flex-col p-6">
                <span className="t-label text-ink-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="t-h3 mb-5 mt-2 text-ink">{j.title}</h3>

                <div className="mb-4 flex flex-1 flex-col rounded-md border border-line bg-raised/60 p-4">
                  <p className="t-label mb-2 text-ink-subtle">Today</p>
                  <p className="text-[0.875rem] leading-relaxed text-ink-muted">
                    {j.before}
                  </p>
                </div>

                <div className="rounded-md border border-brand-500/25 bg-brand-50 p-4">
                  <p className="t-label mb-2 text-brand-700">With CarePulse</p>
                  <p className="text-[0.875rem] leading-relaxed text-ink">
                    {j.after}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── MAP ────────────────────────────────────────── */}
        <section className="border-y border-line bg-surface py-16 sm:py-20">
          <div className="shell">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="t-h1 max-w-xl text-ink">
                  Patients find you before they book you.
                </h2>
                <p className="t-body mt-3 max-w-xl text-ink-muted">
                  Every site gets a map pin, opening hours and a phone
                  number. Patients can also search hospitals and clinics
                  near them, so the practice page is useful even to someone
                  who is not your patient yet.
                </p>
              </div>
              <Link
                href="/providers"
                className="group inline-flex items-center gap-2 text-[0.875rem] font-semibold text-brand-600"
              >
                See the full directory
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>

            <MapSection
              facilities={facilities}
              center={{ lat: mapDefaults.lat, lng: mapDefaults.lng }}
              zoom={mapDefaults.zoom}
            />
          </div>
        </section>

        {/* ── VERTICALS ──────────────────────────────────── */}
        <section className="shell py-16 sm:py-24">
          <h2 className="t-h1 max-w-2xl text-ink">
            One platform. Configured for your kind of practice.
          </h2>
          <p className="t-body mt-4 max-w-xl text-ink-muted">
            Appointment types, intake forms and reminder timing arrive set up
            for your specialty, instead of a blank system you have to
            configure before it is useful.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {verticals.map((v) => (
              <article key={v.name} className="card flex h-full flex-col p-6">
                <h3 className="t-h3 text-ink">{v.name}</h3>
                <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-ink-muted">
                  {v.blurb}
                </p>
                <ul className="mt-auto space-y-2 border-t border-line pt-5">
                  {v.points.map((p) => (
                    <li
                      key={p}
                      className="flex gap-2.5 text-[0.8125rem] text-ink-muted"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-ok-500" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ── PHYSICIANS ─────────────────────────────────── */}
        <section className="border-y border-line bg-surface py-14">
          <div className="shell">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="t-label text-ink-subtle">
                Physicians configured on this practice
              </p>
              <Link
                href="/providers"
                className="group inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-brand-600"
              >
                Specialties, sites and availability
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
            <div className="scrollbar-hide flex gap-7 overflow-x-auto pb-1">
              {physicians.map((doctor) => (
                <div key={doctor.id} className="flex shrink-0 items-center gap-3">
                  <Image
                    src={doctor.image}
                    height={40}
                    width={40}
                    alt=""
                    className="size-10 rounded-full border border-line object-cover"
                  />
                  <div className="whitespace-nowrap">
                    <p className="text-[0.875rem] font-medium text-ink">
                      Dr. {doctor.name}
                    </p>
                    <p className="text-[0.75rem] text-ink-subtle">
                      {doctor.specialty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCOPE ──────────────────────────────────────── */}
        <section className="shell py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="t-h1 text-ink">
                What it does, and what it does not.
              </h2>
              <p className="t-body mt-4 text-ink-muted">
                Scheduling software gets oversold constantly. Here is the
                boundary in writing, so nobody finds it during onboarding.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
              <div className="card p-6">
                <p className="t-label mb-4 text-ok-700">It does</p>
                <ul className="space-y-2.5">
                  {scope.does.map((i) => (
                    <li key={i} className="flex gap-2.5 text-[0.875rem] text-ink-muted">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-ok-500" aria-hidden />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6">
                <p className="t-label mb-4 text-ink-subtle">It does not</p>
                <ul className="space-y-2.5">
                  {scope.doesNot.map((i) => (
                    <li key={i} className="flex gap-2.5 text-[0.875rem] text-ink-muted">
                      <Minus className="mt-0.5 size-3.5 shrink-0 text-ink-subtle" aria-hidden />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ────────────────────────────────────── */}
        <section className="border-t border-line bg-raised/30 py-16 sm:py-24">
          <div className="shell">
            <div className="max-w-2xl">
              <h2 className="t-h1 text-ink">Priced per location, published.</h2>
              <p className="t-body mt-3 text-ink-muted">{pricing.note}</p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {pricing.plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`flex h-full flex-col rounded-lg border bg-surface p-6 ${
                    plan.featured
                      ? "border-brand-500 shadow-raised ring-1 ring-brand-500/20"
                      : "border-line shadow-card"
                  }`}
                >
                  {plan.featured && (
                    <span className="mb-4 self-start rounded-full bg-brand-600 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-white">
                      Most practices
                    </span>
                  )}

                  <h3 className="t-h3 text-ink">{plan.name}</h3>
                  <p className="t-small mt-1 text-ink-subtle">{plan.forWho}</p>

                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="text-[2rem] font-bold leading-none tracking-[-0.02em] text-ink">
                      {plan.price}
                    </span>
                    <span className="t-small text-ink-subtle">
                      {plan.cadence}
                    </span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2.5 text-[0.875rem] text-ink-muted"
                      >
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-ok-500"
                          aria-hidden
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/patients"
                    className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md text-[0.875rem] font-semibold transition-colors ${
                      plan.featured
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-line-strong bg-surface text-ink hover:bg-raised"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>

            <p className="mt-6 t-small text-ink-subtle">
              Prices shown in USD. Local currency billing available for the
              markets we operate in.
            </p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────── */}
        <section className="border-t border-line bg-surface">
          <div className="shell max-w-3xl py-16 sm:py-24">
            <h2 className="t-h1 mb-8 text-ink">Questions, answered.</h2>
            <div className="divide-y divide-line border-y border-line">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.9375rem] font-semibold text-ink">
                    {f.q}
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-ink-subtle transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[0.875rem] leading-relaxed text-ink-muted">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="border-t border-line bg-brand-700">
          <div className="shell flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
            <div>
              <h2 className="t-h1 max-w-lg text-white">
                See it working before you decide anything.
              </h2>
              <p className="t-body mt-3 max-w-md text-brand-100">
                Walk through a real booking as a patient, then look at the
                staff worklist it lands on. Two minutes, no signup.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/patients"
                className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-white px-6 text-[0.9375rem] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                Try the patient flow
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="/admin"
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md border border-white/30 px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Lock className="size-4" aria-hidden />
                Staff sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-8">
          <p className="copyright">© {new Date().getFullYear()} CarePulse</p>
          <div className="flex gap-6">
            <Link href="/providers" className="text-[0.8125rem] text-ink-subtle hover:text-ink">
              Find a doctor
            </Link>
            <Link href="/admin" className="text-[0.8125rem] text-ink-subtle hover:text-ink">
              Staff sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Hero product preview.
 *
 * A real fragment of the worklist rather than a stock photo. Practice
 * managers buy the screen they will be looking at all day, and every
 * competitor's hero is the same photograph of a clinician holding a
 * tablet.
 */
function WorklistPreview() {
  const rows = [
    { n: "A. Whitfield", d: "Cameron", t: "9:00 AM", s: "pending" },
    { n: "M. Okonkwo", d: "Livingston", t: "9:30 AM", s: "scheduled" },
    { n: "R. Delgado", d: "Sharma", t: "10:15 AM", s: "pending" },
    { n: "S. Ahmed", d: "Green", t: "11:00 AM", s: "scheduled" },
    { n: "T. Bakker", d: "Lee", t: "11:45 AM", s: "scheduled" },
  ];

  return (
    <div className="card overflow-hidden shadow-raised">
      <div className="flex items-center gap-2 border-b border-line bg-raised px-4 py-3">
        <ClipboardList className="size-4 text-ink-subtle" aria-hidden />
        <span className="text-[0.8125rem] font-semibold text-ink">
          Today&apos;s worklist
        </span>
        <span className="ml-auto rounded-full bg-warn-50 px-2 py-0.5 text-[0.6875rem] font-bold text-warn-700">
          2 pending
        </span>
      </div>

      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li
            key={row.n}
            className="flex items-center justify-between gap-3 px-4 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate text-[0.875rem] font-semibold text-ink">
                {row.n}
              </p>
              <p className="truncate text-[0.75rem] text-ink-subtle">
                Dr. {row.d}
                <span className="mx-1.5">·</span>
                <Clock3 className="inline size-3 -translate-y-px" aria-hidden />{" "}
                {row.t}
              </p>
            </div>
            <span
              className={`pill ${row.s === "pending" ? "pill-warn" : "pill-ok"}`}
            >
              {row.s === "pending" ? (
                <BellRing className="size-3" aria-hidden />
              ) : (
                <CalendarCheck2 className="size-3" aria-hidden />
              )}
              {row.s}
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-line bg-raised px-4 py-2.5 text-[0.6875rem] text-ink-subtle">
        Illustrative worklist. Names are examples, not real patients.
      </p>
    </div>
  );
}
