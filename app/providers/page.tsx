import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  Languages,
  MapPin,
  Phone,
  Siren,
} from "lucide-react";
import type { Metadata } from "next";

import { PulseMark } from "@/components/clinical/AppHeader";
import { MapSection } from "@/components/clinical/MapSection";
import {
  facilities,
  facilityById,
  mapDefaults,
  providers,
  specialties,
} from "@/lib/directory";

export const metadata: Metadata = {
  title: "Find a doctor or clinic · CarePulse",
  description:
    "Browse physicians by specialty, see who is accepting new patients, and find opening hours, services and contact details for each hospital and clinic.",
};

/**
 * Public provider and facility directory.
 *
 * Business case, since this is a lot of surface area to add: a booking
 * form that lists nine bare names makes the patient guess, and a wrong
 * guess costs the practice a phone call, a cancelled slot and a rebooking.
 * Specialty, location, languages and "accepting new patients" are the four
 * facts that let someone self-route correctly.
 *
 * It is also the page that earns organic search traffic. "endocrinologist
 * near me" and "who treats diabetes in <town>" are how patients actually
 * look, and a booking form ranks for none of it. This is the only
 * indexable page on the site besides the home page.
 */
export default function ProvidersPage({
  searchParams,
}: {
  searchParams: { specialty?: string };
}) {
  const active = searchParams.specialty ?? "all";
  const shown =
    active === "all"
      ? providers
      : providers.filter((p) => p.specialty === active);

  return (
    <div className="bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-600 text-white">
              <PulseMark />
            </span>
            <span className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
              CarePulse
            </span>
          </Link>
          <Link
            href="/patients"
            className="inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-[0.875rem] font-semibold text-white hover:bg-brand-700"
          >
            Book a visit
          </Link>
        </div>
      </header>

      {/* Structured data.
          This is what actually puts a practice into "dentist near me" and
          into the map pack. Crawlers do not read a Leaflet canvas, so the
          coordinates, opening hours and phone numbers have to be declared
          explicitly. MedicalClinic and Physician are the correct
          schema.org types here; LocalBusiness alone is weaker for health
          queries. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              ...facilities.map((f) => ({
                "@type": f.emergency ? "Hospital" : "MedicalClinic",
                "@id": `#${f.id}`,
                name: f.name,
                address: { "@type": "PostalAddress", streetAddress: f.address },
                telephone: f.phone,
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: f.lat,
                  longitude: f.lng,
                },
                openingHours: f.hours,
                availableService: f.services.map((svc) => ({
                  "@type": "MedicalProcedure",
                  name: svc,
                })),
                isAcceptingNewPatients: true,
              })),
              ...providers.map((p) => ({
                "@type": "Physician",
                name: `Dr. ${p.name}, ${p.credential}`,
                medicalSpecialty: p.specialty,
                knowsLanguage: p.languages,
                worksFor: { "@id": `#${p.facilityId}` },
              })),
            ],
          }),
        }}
      />

      <main id="main">
        <section className="border-b border-line bg-surface">
          <div className="shell py-14">
            <h1 className="t-display max-w-2xl text-ink">
              Find the right clinician, not just the next free slot.
            </h1>
            <p className="t-body mt-5 max-w-xl text-ink-muted">
              {providers.length} physicians across {facilities.length} sites.
              Filter by what you need treated, check who is taking new
              patients, then book without phoning anyone.
            </p>
          </div>
        </section>

        {/* ── Specialty filter ───────────────────────────── */}
        <section className="border-b border-line bg-surface py-4">
          <div className="shell scrollbar-hide flex gap-2 overflow-x-auto">
            <FilterChip label="All specialties" value="all" active={active === "all"} />
            {specialties.map((s) => (
              <FilterChip key={s} label={s} value={s} active={active === s} />
            ))}
          </div>
        </section>

        {/* ── Providers ──────────────────────────────────── */}
        <section className="shell py-12">
          <h2 className="sr-only">Physicians</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((p) => {
              const facility = facilityById(p.facilityId);
              return (
                <article key={p.id} className="card flex flex-col p-6">
                  <div className="flex items-start gap-3.5">
                    <Image
                      src={p.image}
                      width={52}
                      height={52}
                      alt=""
                      className="size-[52px] shrink-0 rounded-full border border-line object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="text-[1.0625rem] font-semibold text-ink">
                        Dr. {p.name}
                      </h3>
                      <p className="t-small text-ink-subtle">{p.credential}</p>
                      <p className="mt-1 text-[0.875rem] font-medium text-brand-600">
                        {p.specialty}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 flex flex-1 flex-wrap content-start gap-1.5">
                    {p.focus.map((f) => (
                      <li
                        key={f}
                        className="rounded-full border border-line bg-raised px-2.5 py-1 text-[0.75rem] text-ink-muted"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-[0.8125rem]">
                    <Row icon={Building2} label="Site" value={facility?.name ?? "—"} />
                    <Row icon={Languages} label="Languages" value={p.languages.join(", ")} />
                    <Row
                      icon={Clock3}
                      label="Clinic days"
                      value={Object.keys(p.availability).join(", ")}
                    />
                  </dl>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <span
                      className={`pill ${p.acceptingNewPatients ? "pill-ok" : "pill-warn"}`}
                    >
                      <BadgeCheck className="size-3" aria-hidden />
                      {p.acceptingNewPatients ? "Accepting patients" : "Referral only"}
                    </span>
                    <span className="t-small text-ink-subtle">{p.nextAvailable}</span>
                  </div>

                  <Link
                    href="/patients"
                    className="group mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface text-[0.875rem] font-semibold text-ink hover:bg-raised"
                  >
                    Request an appointment
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Facilities ─────────────────────────────────── */}
        <section className="border-t border-line bg-surface">
          <div className="shell py-14">
            <h2 className="t-h1 text-ink">Hospitals and clinics</h2>
            <p className="t-body mt-3 max-w-xl text-ink-muted">
              Where each service is actually delivered, including which site
              has an emergency department.
            </p>

            <div className="mt-10">
              <MapSection
                facilities={facilities}
                center={{ lat: mapDefaults.lat, lng: mapDefaults.lng }}
                zoom={mapDefaults.zoom}
              />
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {facilities.map((f) => (
                <article key={f.id} className="card flex flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[1.0625rem] font-semibold text-ink">
                        {f.name}
                      </h3>
                      <p className="t-small text-ink-subtle">{f.kind}</p>
                    </div>
                    {f.emergency && (
                      <span className="pill pill-crit">
                        <Siren className="size-3" aria-hidden />
                        24h emergency
                      </span>
                    )}
                  </div>

                  <dl className="mt-4 space-y-2.5 text-[0.8125rem]">
                    <Row icon={MapPin} label="Address" value={f.address} />
                    <Row icon={Phone} label="Phone" value={f.phone} />
                    <Row icon={Clock3} label="Hours" value={f.hours} />
                  </dl>

                  <p className="t-label mt-5 text-ink-subtle">Services</p>
                  <ul className="mt-2.5 flex flex-1 flex-wrap content-start gap-1.5">
                    {f.services.map((s) => (
                      <li
                        key={s}
                        className="rounded-full border border-line bg-raised px-2.5 py-1 text-[0.75rem] text-ink-muted"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="shell flex flex-wrap items-center justify-between gap-3 py-8">
        <p className="copyright">© {new Date().getFullYear()} CarePulse</p>
        <Link href="/admin" className="text-[0.8125rem] text-ink-subtle hover:text-ink">
          Staff sign in
        </Link>
      </footer>
    </div>
  );
}

function FilterChip({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <Link
      href={value === "all" ? "/providers" : `/providers?specialty=${encodeURIComponent(value)}`}
      className={`shrink-0 rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold transition-colors ${
        active
          ? "bg-brand-600 text-white"
          : "border border-line bg-surface text-ink-muted hover:text-ink"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-ink-subtle" aria-hidden />
      <div>
        <dt className="sr-only">{label}</dt>
        <dd className="text-ink-muted">{value}</dd>
      </div>
    </div>
  );
}
