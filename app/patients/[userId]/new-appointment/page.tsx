import type { Metadata } from "next";

import { PatientShell } from "@/components/clinical/PatientShell";
import { PrivacyNote, Stepper } from "@/components/clinical/Stepper";
import { AppointmentForm } from "@/components/ui/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";

export const metadata: Metadata = {
  title: "Choose a time · CarePulse",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const Appointment = async ({ params }: { params: { userId: string } }) => {
  const { userId } = params;
  const patient = await getPatient(userId);

  return (
    <PatientShell
      aside="/assets/images/appointment-img.png"
      asideAlt="Clinic corridor"
      width="max-w-[720px]"
    >
      <Stepper current={2} />

      <h1 className="t-h1 text-ink">Pick a physician and a time.</h1>
      <p className="t-body mt-2.5 text-ink-muted">
        Your request goes straight to the practice. Someone will confirm it,
        and you will get a text message either way.
      </p>

      <div className="mt-8">
        <AppointmentForm
          patientId={patient?.$id}
          userId={userId}
          type="create"
        />
      </div>

      <PrivacyNote />
    </PatientShell>
  );
};

export default Appointment;
