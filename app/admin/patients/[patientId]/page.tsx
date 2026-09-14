import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  HeartPulse,
  CreditCard,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";

import { AppHeader } from "@/components/clinical/AppHeader";
import { ClinicalNotes } from "@/components/clinical/ClinicalNotes";
import { Field, RecordSection } from "@/components/clinical/RecordSection";
import { StatusBadge } from "@/components/clinical/StatusBadge";
import { getAppointmentsForPatient } from "@/lib/actions/appointment.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { listNotes } from "@/lib/actions/note.actions";
import { isAuthenticated } from "@/lib/auth";
import { facilityById, providerByName } from "@/lib/directory";
import { formatDateTime } from "@/lib/utils";
import type { Appointment } from "@/types/appwrite.types";

export const metadata: Metadata = {
  title: "Patient record · CarePulse",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function age(birthDate?: Date | string) {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

/**
 * The patient record.
 *
 * THIS SCREEN DID NOT EXIST. The registration form collects allergies,
 * current medication, past and family medical history, insurance details
 * and an identification document, and none of it was displayed anywhere in
 * the application. It was a write-only database: patients filled in a long
 * medical history that no member of staff could ever read back.
 *
 * That is also why there was nowhere to see visit history, reports or
 * clinical comments. There was no patient-level view at all, only a flat
 * list of appointments by date.
 */
export default async function PatientRecord({
  params,
}: {
  params: { patientId: string };
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const patient = await getPatientById(params.patientId);
  if (!patient) notFound();

  const [appointments, notes] = await Promise.all([
    getAppointmentsForPatient(params.patientId),
    listNotes(params.patientId),
  ]);

  const provider = providerByName(patient.primaryPhysician);
  const facility = provider ? facilityById(provider.facilityId) : undefined;
  const years = age(patient.birthDate);

  const hasAllergies =
    patient.allergies && String(patient.allergies).trim().length > 0;

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

        {/* ── Patient banner ────────────────────────────── */}
        <div className="card mb-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <UserRound className="size-6" aria-hidden />
              </span>
              <div>
                <h1 className="t-h1 text-ink">{patient.name}</h1>
                <p className="t-small mt-1 text-ink-muted">
                  {[
                    years !== null ? `${years} years` : null,
                    patient.gender,
                    patient.phone,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>

            {/* Allergy banner, at the top, in red, unmissable. In every
                real EHR this is the first thing on the chart, because it
                is the field with the worst consequence for being missed. */}
            <div
              className={`flex items-start gap-2.5 rounded-md border px-4 py-3 ${
                hasAllergies
                  ? "border-crit-500/30 bg-crit-50"
                  : "border-line bg-raised"
              }`}
            >
              <ShieldAlert
                className={`mt-0.5 size-4 shrink-0 ${
                  hasAllergies ? "text-crit-700" : "text-ink-subtle"
                }`}
                aria-hidden
              />
              <div>
                <p className="t-label text-ink-subtle">Allergies</p>
                <p
                  className={`mt-0.5 text-[0.875rem] font-semibold ${
                    hasAllergies ? "text-crit-700" : "text-ink-muted"
                  }`}
                >
                  {hasAllergies ? patient.allergies : "None recorded"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {/* ── Clinical summary ────────────────────────── */}
            <RecordSection title="Clinical summary" icon={HeartPulse}>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Current medication"
                  value={patient.currentMedication}
                  emphasis="alert"
                  span
                />
                <Field
                  label="Past medical history"
                  value={patient.pastMedicalHistory}
                  span
                />
                <Field
                  label="Family medical history"
                  value={patient.familyMedicalHistory}
                  span
                />
              </dl>
            </RecordSection>

            {/* ── Visit history ───────────────────────────── */}
            <RecordSection
              title={`Visit history (${appointments.length})`}
              icon={CalendarClock}
            >
              {appointments.length === 0 ? (
                <p className="t-small text-ink-muted">
                  No appointments recorded for this patient yet.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {appointments.map((a: Appointment) => (
                    <li key={a.$id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.9375rem] font-semibold text-ink">
                            <time dateTime={String(a.schedule)}>
                              {formatDateTime(a.schedule).dateTime}
                            </time>
                          </p>
                          <p className="t-small mt-0.5 text-ink-muted">
                            Dr. {a.primaryPhysician}
                          </p>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                      {a.reason && (
                        <p className="mt-2.5 text-[0.875rem] text-ink-muted">
                          <span className="font-medium text-ink">Reason: </span>
                          {a.reason}
                        </p>
                      )}
                      {a.cancellationReason && (
                        <p className="mt-1.5 text-[0.875rem] text-crit-700">
                          <span className="font-medium">Cancelled: </span>
                          {a.cancellationReason}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </RecordSection>

            {/* ── Clinical notes ──────────────────────────── */}
            <ClinicalNotes patientId={params.patientId} notes={notes} />
          </div>

          <div className="space-y-6 lg:col-span-5">
            {/* ── Care team ───────────────────────────────── */}
            <RecordSection title="Care team" icon={Stethoscope}>
              {provider ? (
                <div className="flex items-start gap-3">
                  <Image
                    src={provider.image}
                    width={44}
                    height={44}
                    alt=""
                    className="size-11 rounded-full border border-line object-cover"
                  />
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-ink">
                      Dr. {provider.name}, {provider.credential}
                    </p>
                    <p className="t-small text-ink-muted">{provider.specialty}</p>
                    {facility && (
                      <p className="t-small mt-1.5 text-ink-subtle">
                        {facility.name} · {facility.phone}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="t-small text-ink-muted">
                  Primary physician recorded as{" "}
                  <span className="font-medium text-ink">
                    {patient.primaryPhysician || "not set"}
                  </span>
                  , who is not in the provider directory.
                </p>
              )}
            </RecordSection>

            {/* ── Demographics ────────────────────────────── */}
            <RecordSection title="Demographics" icon={UserRound}>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" value={patient.email} />
                <Field label="Phone" value={patient.phone} />
                <Field
                  label="Date of birth"
                  value={
                    patient.birthDate
                      ? new Date(patient.birthDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : undefined
                  }
                />
                <Field label="Occupation" value={patient.occupation} />
                <Field label="Address" value={patient.address} span />
                <Field
                  label="Emergency contact"
                  value={
                    patient.emergencyContactName
                      ? `${patient.emergencyContactName} · ${patient.emergencyContactNumber ?? ""}`
                      : undefined
                  }
                  span
                />
              </dl>
            </RecordSection>

            {/* ── Insurance ───────────────────────────────── */}
            <RecordSection title="Insurance" icon={FileText}>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Provider" value={patient.insuranceProvider} />
                <Field label="Policy number" value={patient.insurancePolicyNumber} />
              </dl>
            </RecordSection>

            {/* ── Identification ──────────────────────────── */}
            <RecordSection title="Identification" icon={CreditCard}>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Type" value={patient.identificationType} />
                <Field label="Number" value={patient.identificationNumber} />
              </dl>

              {patient.identificationDocumentURL ? (
                <a
                  href={patient.identificationDocumentURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-md border border-line-strong px-3.5 py-2 text-[0.8125rem] font-semibold text-ink hover:bg-raised"
                >
                  <FileText className="size-3.5" aria-hidden />
                  View uploaded document
                </a>
              ) : (
                <p className="t-small mt-5 text-ink-subtle">
                  No identification document was uploaded.
                </p>
              )}
            </RecordSection>
          </div>
        </div>
      </main>
    </div>
  );
}
