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
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

import { PulseMark } from "@/components/clinical/AppHeader";
import { MapSection } from "@/components/clinical/MapSection";
import { RevenueCalculator } from "@/components/marketing/RevenueCalculator";
import { facilities, mapDefaults, providers } from "@/lib/directory";
import {
  assurances,
  comparison,
  faqs,
  hero,
  howItWorks,
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
      {/* ── ANNOUNCEMENT ─────────────────────────────────── */}
      <div className="bg-night-900 text-center">
        <p className="shell py-2.5 text-[0.8125rem] text-white/70">
          <Sparkles className="mr-2 inline size-3.5 -translate-y-px text-brand-100" aria-hidden />
          Free for 14 days. Live the same afternoon you sign up.
        </p>
      </div>

      {/* ── NAV ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-[500] border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-600 text-white">
              <PulseMark />
            </span>
            <span className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
              CarePulse
            </span>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="#pricing"
              className="hidden rounded-md px-3 py-2 text-[0.875rem] font-semibold text-ink-muted transition-colors hover:text-ink sm:block"
            >
              Pricing
            </Link>
            <Link
              href="/providers"
              className="rounded-md px-3 py-2 text-[0.875rem] font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              Find a doctor
            </Link>
            <Link
              href="/admin"
              className="hidden rounded-md px-3 py-2 text-[0.875rem] font-semibold text-ink-muted transition-colors hover:text-ink md:block"
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
        <section className="hero-dark hero-grid relative overflow-hidden">
          <div className="shell relative grid gap-14 py-20 lg:grid-cols-12 lg:gap-10 lg:py-28">
            <div className="lg:col-span-6">
              <span
                className="rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.75rem] font-semibold text-brand-100"
                style={{ animationDelay: "0ms" }}
              >
                <Stethoscope className="size-3.5" aria-hidden />
                {hero.eyebrow}
              </span>

              <h1
                className="rise t-display mt-7 text-white"
                style={{ animationDelay: "80ms" }}
              >
                {hero.headline}
                <br />
                <span className="text-brand-100">{hero.headlineAccent}</span>
              </h1>

              <p
                className="rise t-body mt-7 max-w-xl text-white/70"
                style={{ animationDelay: "160ms" }}
              >
                {hero.sub}
              </p>

              <div
                className="rise mt-9 flex flex-wrap gap-3"
                style={{ animationDelay: "240ms" }}
              >
                <Link
                  href="/patients"
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 text-[0.9375rem] font-semibold text-night-900 transition-colors hover:bg-brand-50"
                >
                  {hero.primaryCta}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-white/20 px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <Lock className="size-4" aria-hidden />
                  {hero.secondaryCta}
                </Link>
              </div>

              <div
                className="rise mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-7"
                style={{ animationDelay: "320ms" }}
              >
                {[
                  "No card required",
                  "No hardware",
                  "Cancel any time",
                ].map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-2 text-[0.8125rem] text-white/60"
                  >
                    <Check className="size-3.5 shrink-0 text-ok-500" aria-hidden />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Product screenshot, not stock photography. Buyers of
                clinical software want the screen they will stare at. */}
            <div
              className="rise lg:col-span-6 lg:pl-6"
              style={{ animationDelay: "200ms" }}
            >
              <WorklistPreview />
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP ────────────────────────────────── */}
        <section className="border-b border-line bg-surface">
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

        {/* ── HOW IT WORKS ───────────────────────────────── */}
        <section className="shell py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="t-label mb-3 text-brand-600">How it works</p>
            <h2 className="t-h1 text-ink">
              The whole product, in three steps.
            </h2>
          </div>

          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {howItWorks.map((s) => (
              <li key={s.step} className="card flex h-full flex-col p-6">
                <span className="mb-5 flex size-9 items-center justify-center rounded-md bg-brand-600 text-[0.8125rem] font-bold text-white">
                  {s.step}
                </span>
                <h3 className="t-h3 text-ink">{s.title}</h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
                  {s.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── CALCULATOR ─────────────────────────────────── */}
        <section className="border-y border-line bg-raised/40 py-16 sm:py-24">
          <div className="shell">
            <div className="mb-10 max-w-2xl">
              <p className="t-label mb-3 text-brand-600">The cost of doing nothing</p>
              <h2 className="t-h1 text-ink">
                Every empty chair was already paid for.
              </h2>
              <p className="t-body mt-3 text-ink-muted">
                The staff were rostered, the room was booked, the slot was
                blocked. Move the sliders to your own practice.
              </p>
            </div>
            <RevenueCalculator />
          </div>
        </section>

        {/* ── BEFORE / AFTER ─────────────────────────────── */}
        <section className="shell py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="t-label mb-3 text-brand-600">What changes</p>
            <h2 className="t-h1 text-ink">
              Three jobs your front desk does by hand.
            </h2>
            <p className="t-body mt-3 text-ink-muted">
              None of them need a person. All of them cost you one.
            </p>
          </div>

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

        {/* ── COMPARISON ─────────────────────────────────── */}
        <section className="border-y border-line bg-surface py-16 sm:py-24">
          <div className="shell">
            <div className="max-w-2xl">
              <p className="t-label mb-3 text-brand-600">Honestly compared</p>
              <h2 className="t-h1 text-ink">
                You are probably choosing between three things.
              </h2>
              <p className="t-body mt-3 text-ink-muted">
                Usually not another clinical system. Usually the phone, or a
                generic booking tool you already pay for.
              </p>
            </div>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <caption className="sr-only">
                  Feature comparison between a paper diary, a generic booking
                  tool and CarePulse
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-2/5 pb-4" />
                    {comparison.columns.map((c, i) => (
                      <th
                        key={c}
                        scope="col"
                        className={`pb-4 text-center text-[0.875rem] font-semibold ${
                          i === 2 ? "text-brand-600" : "text-ink-subtle"
                        }`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row) => (
                    <tr key={row.feature} className="border-t border-line">
                      <th
                        scope="row"
                        className="py-4 pr-4 text-left text-[0.875rem] font-medium text-ink"
                      >
                        {row.feature}
                      </th>
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-4 text-center ${
                            i === 2 ? "bg-brand-50/50" : ""
                          }`}
                        >
                          <Cell value={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── VERTICALS ──────────────────────────────────── */}
        <section className="shell py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="t-label mb-3 text-brand-600">Built for your specialty</p>
            <h2 className="t-h1 text-ink">
              One platform, configured for your kind of practice.
            </h2>
            <p className="t-body mt-3 text-ink-muted">
              Appointment types, intake forms and reminder timing arrive set
              up for your specialty, not as a blank system you configure
              before it is useful.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {verticals.map((v) => (
              <article key={v.name} className="card flex h-full flex-col p-6">
                <h3 className="t-h3 text-ink">{v.name}</h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
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

        {/* ── MAP ────────────────────────────────────────── */}
        <section className="border-y border-line bg-surface py-16 sm:py-24">
          <div className="shell">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <p className="t-label mb-3 text-brand-600">Get found</p>
                <h2 className="t-h1 text-ink">
                  Patients find you before they book you.
                </h2>
                <p className="t-body mt-3 text-ink-muted">
                  Every site gets a map pin, opening hours and a phone number,
                  marked up so search engines can read it. Patients can also
                  search hospitals near them, which makes your page useful to
                  someone who is not your patient yet.
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

        {/* ── PHYSICIANS ─────────────────────────────────── */}
        <section className="shell py-14">
          <p className="t-label mb-6 text-ink-subtle">
            Physicians configured on this practice
          </p>
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
        </section>

        {/* ── SECURITY ───────────────────────────────────── */}
        <section className="border-y border-line bg-night-900 py-16 sm:py-20">
          <div className="shell grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="t-label mb-3 text-brand-100">Data & security</p>
              <h2 className="t-h1 text-white">
                The question your compliance lead asks first.
              </h2>
              <p className="t-body mt-4 text-white/60">
                Answered on the homepage rather than buried in a policy,
                because in healthcare it decides the sale.
              </p>
            </div>

            <dl className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
              {assurances.map((a) => (
                <div
                  key={a.title}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
                >
                  <dt className="flex items-center gap-2.5 text-[0.9375rem] font-semibold text-white">
                    <ShieldCheck className="size-4 shrink-0 text-ok-500" aria-hidden />
                    {a.title}
                  </dt>
                  <dd className="mt-2 text-[0.8125rem] leading-relaxed text-white/60">
                    {a.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── SCOPE ──────────────────────────────────────── */}
        <section className="shell py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="t-label mb-3 text-brand-600">No surprises</p>
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
        <section id="pricing" className="border-y border-line bg-raised/40 py-16 sm:py-24">
          <div className="shell">
            <div className="max-w-2xl">
              <p className="t-label mb-3 text-brand-600">Pricing</p>
              <h2 className="t-h1 text-ink">Published, per location.</h2>
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
                    <span className="t-small text-ink-subtle">{plan.cadence}</span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-[0.875rem] text-ink-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-ok-500" aria-hidden />
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
              Prices shown in USD. Local currency billing available in the
              markets we operate in.
            </p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────── */}
        <section className="shell max-w-3xl py-16 sm:py-24">
          <p className="t-label mb-3 text-brand-600">Questions</p>
          <h2 className="t-h1 mb-8 text-ink">The ones you were going to ask.</h2>
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
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="hero-dark relative overflow-hidden border-t border-line">
          <div className="shell relative flex flex-col items-start justify-between gap-8 py-20 md:flex-row md:items-center">
            <div>
              <h2 className="t-h1 max-w-lg text-white">
                See it working before you decide anything.
              </h2>
              <p className="t-body mt-3 max-w-md text-white/60">
                Walk through a real booking as a patient, then look at the
                staff worklist it lands on. Two minutes, no signup.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/patients"
                className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-white px-6 text-[0.9375rem] font-semibold text-night-900 transition-colors hover:bg-brand-50"
              >
                Try the patient flow
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="/admin"
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md border border-white/20 px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Lock className="size-4" aria-hidden />
                Staff sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-line bg-surface">
        <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-md bg-brand-600 text-white">
                <PulseMark />
              </span>
              <span className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
                CarePulse
              </span>
            </div>
            <p className="mt-4 max-w-[240px] text-[0.8125rem] leading-relaxed text-ink-muted">
              Patient scheduling and records for dental, medical and allied
              practices.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Pricing", href: "#pricing" },
              { label: "Find a doctor", href: "/providers" },
              { label: "Book a visit", href: "/patients" },
            ]}
          />
          <FooterCol
            title="For practices"
            links={[
              { label: "Staff sign in", href: "/admin" },
              { label: "Provider directory", href: "/admin/directory" },
            ]}
          />
          <FooterCol
            title="Patients"
            links={[
              { label: "Book an appointment", href: "/patients" },
              { label: "Clinic locations", href: "/providers" },
            ]}
          />
        </div>

        <div className="border-t border-line">
          <div className="shell flex flex-wrap items-center justify-between gap-3 py-6">
            <p className="copyright">© {new Date().getFullYear()} CarePulse</p>
            <p className="text-[0.75rem] text-ink-subtle">
              Map data © OpenStreetMap contributors
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="t-label mb-4 text-ink-subtle">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[0.875rem] text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Comparison cell. Booleans render as icons; a string renders as a
 * qualified answer, which is more honest than forcing every row into
 * yes or no. */
function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <>
        <Check className="mx-auto size-4 text-ok-500" aria-hidden />
        <span className="sr-only">Yes</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <X className="mx-auto size-4 text-ink-subtle/50" aria-hidden />
        <span className="sr-only">No</span>
      </>
    );
  }
  return <span className="text-[0.8125rem] text-ink-subtle">{value}</span>;
}

/**
 * Hero product preview.
 *
 * A real fragment of the worklist rather than a stock photo. Practice
 * managers buy the screen they will be looking at all day, and every
 * competitor's hero is the same photograph of a clinician holding a
 * tablet. The tilt and glow exist to make it read as a screenshot sitting
 * above the page rather than a flat panel pasted into it.
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
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-3xl bg-brand-500/20 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-surface shadow-pop">
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
    </div>
  );
}
