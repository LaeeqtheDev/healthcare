import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Building2, Database, Users } from "lucide-react";
import type { Metadata } from "next";

import { AppHeader } from "@/components/clinical/AppHeader";
import { NpiLookup } from "@/components/clinical/NpiLookup";
import { RecordSection } from "@/components/clinical/RecordSection";
import { isAuthenticated } from "@/lib/auth";
import { facilities, facilityById, providers } from "@/lib/directory";

export const metadata: Metadata = {
  title: "Directory · CarePulse",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />

      <main id="main" className="shell py-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to worklist
        </Link>

        <h1 className="t-h1 text-ink">Provider directory</h1>
        <p className="t-body mt-1.5 max-w-2xl text-ink-muted">
          The clinicians and sites this practice books into. Patients see the
          public version at{" "}
          <Link href="/providers" className="font-semibold text-brand-600 underline underline-offset-2">
            /providers
          </Link>
          .
        </p>

        <div className="mt-8 space-y-6">
          <RecordSection title="NPI Registry lookup" icon={Database}>
            <p className="t-small mb-5 max-w-2xl text-ink-muted">
              Search the free CMS registry by name to pull a provider&apos;s
              NPI, credential and official taxonomy, rather than typing a
              specialty from memory. Provider data that drifts away from what
              payers hold is a routine cause of claim rejections. US
              providers only; there is no equivalent open registry elsewhere.
            </p>
            <NpiLookup />
          </RecordSection>

          <RecordSection
            title={`Physicians (${providers.length})`}
            icon={Users}
          >
            <div className="overflow-x-auto">
              <table className="clin-table">
                <caption className="sr-only">Physicians in this practice</caption>
                <thead>
                  <tr>
                    <th scope="col">Provider</th>
                    <th scope="col">Specialty</th>
                    <th scope="col">Site</th>
                    <th scope="col">Clinic days</th>
                    <th scope="col">NPI</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id}>
                      <th scope="row" className="px-4 py-3.5 text-left">
                        <span className="flex items-center gap-2.5">
                          <Image
                            src={p.image}
                            width={30}
                            height={30}
                            alt=""
                            className="size-[30px] rounded-full border border-line object-cover"
                          />
                          <span>
                            <span className="block text-[0.875rem] font-semibold text-ink">
                              Dr. {p.name}
                            </span>
                            <span className="block text-[0.75rem] text-ink-subtle">
                              {p.credential}
                            </span>
                          </span>
                        </span>
                      </th>
                      <td className="text-ink-muted">{p.specialty}</td>
                      <td className="text-ink-muted">
                        {facilityById(p.facilityId)?.name ?? "—"}
                      </td>
                      <td className="text-ink-muted">
                        {Object.keys(p.availability).join(", ")}
                      </td>
                      <td className="font-mono text-[0.8125rem] text-ink-subtle">
                        {p.npi || "Not set"}
                      </td>
                      <td>
                        <span
                          className={`pill ${p.acceptingNewPatients ? "pill-ok" : "pill-warn"}`}
                        >
                          {p.acceptingNewPatients ? "Open" : "Referral"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="t-small mt-4 text-ink-subtle">
              Seeded from <code className="rounded bg-raised px-1">lib/directory.ts</code>.
              Move this to an Appwrite collection when staff need to edit it
              without a deploy.
            </p>
          </RecordSection>

          <RecordSection
            title={`Facilities (${facilities.length})`}
            icon={Building2}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {facilities.map((f) => (
                <div key={f.id} className="rounded-md border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.9375rem] font-semibold text-ink">
                        {f.name}
                      </p>
                      <p className="t-small text-ink-subtle">{f.kind}</p>
                    </div>
                    {f.emergency && (
                      <span className="pill pill-crit">24h ED</span>
                    )}
                  </div>
                  <p className="t-small mt-3 text-ink-muted">{f.address}</p>
                  <p className="t-small text-ink-muted">{f.phone}</p>
                  <p className="t-small mt-2 text-ink-subtle">{f.hours}</p>
                </div>
              ))}
            </div>
          </RecordSection>
        </div>
      </main>
    </div>
  );
}
