import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck2, Check, CheckCircle2, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

import { PatientShell } from "@/components/clinical/PatientShell";
import { Doctors } from "@/constants";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Request received · CarePulse",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Appointment confirmation.
 *
 * THIS ROUTE DID NOT EXIST. AppointmentForm has always redirected to
 * `/patients/[userId]/new-appointment/success?appointmentId=...` on a
 * successful booking, and there was no page at that path, so every patient
 * who completed the whole flow landed on a 404 immediately after their
 * request was saved.
 *
 * From the practice's side the appointment appeared correctly on the
 * worklist, which is the worst version of this bug: it works, and the
 * patient is certain it did not.
 *
 * Deliberate wording: "request received", not "appointment confirmed". The
 * status at this point is `pending` and a staff member still has to accept
 * it. Telling a patient their appointment is confirmed before anyone has
 * looked at it is how people turn up to a clinic that is not expecting
 * them.
 */
const Success = async ({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: { appointmentId?: string };
}) => {
  const { userId } = params;
  const appointmentId = searchParams.appointmentId ?? "";

  if (!appointmentId) notFound();

  const appointment = await getAppointment(appointmentId);
  if (!appointment) notFound();

  const physician = Doctors.find(
    (d) => d.name === appointment.primaryPhysician
  );

  return (
    <PatientShell width="max-w-[560px]">
      <div className="text-center">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-ok-50 text-ok-700">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>

        <h1 className="t-h1 text-ink">Your request has been received.</h1>
        <p className="t-body mx-auto mt-3 max-w-md text-ink-muted">
          The practice has it. A member of staff will confirm the time, and
          you will get a text message either way, usually within one working
          day.
        </p>
      </div>

      <div className="card mt-8 p-6">
        <p className="t-label mb-5 text-ink-subtle">Requested appointment</p>

        <div className="flex items-center gap-3 border-b border-line pb-5">
          {physician && (
            <Image
              src={physician.image}
              width={44}
              height={44}
              alt=""
              className="size-11 rounded-full border border-line object-cover"
            />
          )}
          <div>
            <p className="text-[0.9375rem] font-semibold text-ink">
              Dr. {appointment.primaryPhysician}
            </p>
            <p className="text-[0.8125rem] text-ink-subtle">
              Primary physician
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-5">
          <CalendarCheck2
            className="mt-0.5 size-4 shrink-0 text-ink-subtle"
            aria-hidden
          />
          <div>
            <p className="text-[0.9375rem] font-semibold text-ink">
              <time dateTime={String(appointment.schedule)}>
                {formatDateTime(appointment.schedule).dateTime}
              </time>
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-ink-subtle">
              Not yet confirmed by the practice
            </p>
          </div>
        </div>
      </div>

      {/* What happens next. A confirmation screen that only says
          "received" leaves the patient wondering whether to phone anyway,
          which is the call this product exists to prevent. */}
      <div className="card mt-5 p-6">
        <p className="t-label mb-5 text-ink-subtle">What happens next</p>
        <ol className="space-y-5">
          <Step
            done
            title="Request submitted"
            detail="The practice can see it on their worklist now."
          />
          <Step
            title="Staff review"
            detail="Usually within one working day. They may offer a different time if that slot has gone."
          />
          <Step
            title="You get a text message"
            detail="Either confirming the time, or with a link to accept an alternative."
            last
          />
        </ol>
      </div>

      <div className="mt-5 flex gap-3 rounded-md border border-line bg-raised/60 p-4">
        <MessageSquare
          className="mt-0.5 size-4 shrink-0 text-ink-subtle"
          aria-hidden
        />
        <div>
          <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
            Feeling unwell and cannot wait? Do not wait for this request.
            Call the practice, or use an emergency department.
          </p>
          <Link
            href="/providers"
            className="mt-1.5 inline-block text-[0.8125rem] font-semibold text-brand-600 underline underline-offset-2"
          >
            Find clinic phone numbers and emergency sites
          </Link>
        </div>
      </div>

      <p className="mt-5 text-center text-[0.75rem] text-ink-subtle">
        Reference{" "}
        <span className="font-mono text-ink-muted">
          {appointmentId.slice(-8).toUpperCase()}
        </span>
        . Quote this if you call the practice.
      </p>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href={`/patients/${userId}/new-appointment`}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-line-strong bg-surface px-5 text-[0.9375rem] font-semibold text-ink hover:bg-raised"
        >
          Request another time
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-brand-600 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-700"
        >
          Done
        </Link>
      </div>
    </PatientShell>
  );
};

export default Success;

/**
 * One row of the "what happens next" timeline.
 */
function Step({
  title,
  detail,
  done,
  last,
}: {
  title: string;
  detail: string;
  done?: boolean;
  last?: boolean;
}) {
  return (
    <li className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${
            done ? "bg-ok-500 text-white" : "border border-line-strong bg-surface text-ink-subtle"
          }`}
          aria-hidden
        >
          {done ? <Check className="size-3.5" /> : ""}
        </span>
        {!last && <span className="mt-1 w-px flex-1 bg-line" aria-hidden />}
      </div>
      <div className="pb-1">
        <p className="text-[0.9375rem] font-semibold text-ink">{title}</p>
        <p className="t-small mt-0.5 text-ink-muted">{detail}</p>
      </div>
    </li>
  );
}
