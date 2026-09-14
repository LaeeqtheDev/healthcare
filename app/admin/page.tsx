import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarCheck2,
  CalendarX2,
  ClipboardList,
  Clock3,
  Inbox,
  Stethoscope,
} from "lucide-react";
import type { Metadata } from "next";

import { AppointmentModal } from "@/components/AppointmentModal";
import { AppHeader } from "@/components/clinical/AppHeader";
import { StatCard } from "@/components/clinical/StatCard";
import { StatusBadge } from "@/components/clinical/StatusBadge";
import { WorklistFilters } from "@/components/clinical/WorklistFilters";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { isAuthenticated } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

export const metadata: Metadata = {
  title: "Worklist · CarePulse",
  // Staff surfaces holding patient data must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

// This page reads live patient data. It must never be cached or
// statically rendered.
export const dynamic = "force-dynamic";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) => {
  // ── AUTH GATE ────────────────────────────────────────────────────
  // This runs BEFORE any patient data is fetched. That ordering is the
  // entire fix: the previous version fetched every appointment, rendered
  // it into the HTML, and then covered it with a client-side modal. The
  // data was already on the wire.
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const { status = "all", q = "" } = await searchParams;
  const appointments = await getRecentAppointmentList();
  const all: Appointment[] = appointments?.documents ?? [];

  const counts = {
    all: all.length,
    pending: all.filter((a) => a.status === "pending").length,
    scheduled: all.filter((a) => a.status === "scheduled").length,
    cancelled: all.filter((a) => a.status === "cancelled").length,
  };

  const needle = q.trim().toLowerCase();
  const rows = all.filter((a) => {
    if (status !== "all" && a.status !== status) return false;
    if (!needle) return true;
    return (
      a.patient?.name?.toLowerCase().includes(needle) ||
      a.primaryPhysician?.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />

      <main id="main" className="shell py-8 sm:py-10">
        {/* ── Page heading ──────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="t-h1 text-ink">Appointment worklist</h1>
            <p className="t-body mt-1.5 text-ink-muted">
              {counts.pending > 0 ? (
                <>
                  <span className="font-semibold text-ink">
                    {counts.pending}
                  </span>{" "}
                  {counts.pending === 1 ? "request needs" : "requests need"} a
                  decision today.
                </>
              ) : (
                "Nothing is waiting on you. Every request has been actioned."
              )}
            </p>
          </div>
          <p className="t-small text-ink-subtle">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* ── Counters ──────────────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            tone="warn"
            icon={Clock3}
            count={counts.pending}
            label="Pending"
            hint="Requested by a patient, not yet confirmed by staff."
          />
          <StatCard
            tone="ok"
            icon={CalendarCheck2}
            count={counts.scheduled}
            label="Scheduled"
            hint="Confirmed and the patient has been notified."
          />
          <StatCard
            tone="crit"
            icon={CalendarX2}
            count={counts.cancelled}
            label="Cancelled"
            hint="Cancelled by staff or by the patient."
          />
        </div>

        {/* ── Worklist ──────────────────────────────────────── */}
        <section className="card overflow-hidden" aria-label="Appointments">
          <div className="panel-header">
            <div className="flex items-center gap-2.5">
              <ClipboardList className="size-4 text-ink-subtle" aria-hidden />
              <h2 className="t-h3 text-ink">Appointments</h2>
            </div>
            <p className="t-small text-ink-subtle">
              Showing {rows.length} of {all.length}
            </p>
          </div>

          <WorklistFilters counts={counts} />

          {rows.length === 0 ? (
            <EmptyState hasAny={all.length > 0} />
          ) : (
            <>
              {/* Desktop: dense table. Clinical staff scan columns. */}
              <div className="hidden overflow-x-auto md:block">
                <table className="clin-table">
                  <caption className="sr-only">
                    Appointment requests with patient, status, physician and
                    scheduled time
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Patient</th>
                      <th scope="col">Status</th>
                      <th scope="col">Physician</th>
                      <th scope="col">Appointment</th>
                      <th scope="col" className="text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((appointment) => (
                      <tr key={appointment.$id}>
                        <th scope="row" className="px-4 py-3.5 text-left">
                          {appointment.patient?.$id ? (
                            <Link
                              href={`/admin/patients/${appointment.patient.$id}`}
                              className="block text-[0.875rem] font-semibold text-brand-600 underline-offset-2 hover:underline"
                            >
                              {appointment.patient.name ?? "Unknown patient"}
                            </Link>
                          ) : (
                            <span className="block text-[0.875rem] font-semibold text-ink">
                              {appointment.patient?.name ?? "Unknown patient"}
                            </span>
                          )}
                          {appointment.patient?.email && (
                            <span className="block text-[0.75rem] text-ink-subtle">
                              {appointment.patient.email}
                            </span>
                          )}
                        </th>
                        <td>
                          <StatusBadge status={appointment.status} />
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-2 text-ink-muted">
                            <Stethoscope
                              className="size-3.5 shrink-0 text-ink-subtle"
                              aria-hidden
                            />
                            Dr. {appointment.primaryPhysician}
                          </span>
                        </td>
                        <td>
                          <time dateTime={String(appointment.schedule)}>
                            {formatDateTime(appointment.schedule).dateTime}
                          </time>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-1">
                            <AppointmentModal
                              type="schedule"
                              patientId={appointment.patient?.$id}
                              userId={appointment.userId}
                              appointment={appointment}
                            />
                            <AppointmentModal
                              type="cancel"
                              patientId={appointment.patient?.$id}
                              userId={appointment.userId}
                              appointment={appointment}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: cards. A five-column table on a phone is a
                  horizontal-scroll trap, and staff do check this on a
                  phone between rooms. */}
              <ul className="divide-y divide-line md:hidden">
                {rows.map((appointment) => (
                  <li key={appointment.$id} className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {appointment.patient?.$id ? (
                          <Link
                            href={`/admin/patients/${appointment.patient.$id}`}
                            className="block truncate text-[0.9375rem] font-semibold text-brand-600"
                          >
                            {appointment.patient.name ?? "Unknown patient"}
                          </Link>
                        ) : (
                          <p className="truncate text-[0.9375rem] font-semibold text-ink">
                            {appointment.patient?.name ?? "Unknown patient"}
                          </p>
                        )}
                        <p className="truncate text-[0.8125rem] text-ink-subtle">
                          Dr. {appointment.primaryPhysician}
                        </p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <p className="mb-3 text-[0.8125rem] text-ink-muted">
                      <time dateTime={String(appointment.schedule)}>
                        {formatDateTime(appointment.schedule).dateTime}
                      </time>
                    </p>
                    <div className="flex gap-1">
                      <AppointmentModal
                        type="schedule"
                        patientId={appointment.patient?.$id}
                        userId={appointment.userId}
                        appointment={appointment}
                      />
                      <AppointmentModal
                        type="cancel"
                        patientId={appointment.patient?.$id}
                        userId={appointment.userId}
                        appointment={appointment}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <p className="mt-6 t-small text-ink-subtle">
          This screen shows protected health information. Sign out before
          leaving a shared workstation.
        </p>
      </main>
    </div>
  );
};

/**
 * Two genuinely different empty states. "No appointments yet" and "your
 * filter matched nothing" need different wording and different actions;
 * collapsing them into one message is how people conclude the system is
 * broken.
 */
function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-raised text-ink-subtle">
        <Inbox className="size-5" aria-hidden />
      </span>
      <p className="t-h3 text-ink">
        {hasAny ? "No appointments match this filter" : "No appointments yet"}
      </p>
      <p className="t-small max-w-sm text-ink-muted">
        {hasAny
          ? "Try a different status, or clear the search box above."
          : "Requests appear here the moment a patient submits the booking form."}
      </p>
    </div>
  );
}

export default AdminPage;
