import type { Metadata } from "next";

import { PatientShell, } from "@/components/clinical/PatientShell";
import { PrivacyNote, Stepper } from "@/components/clinical/Stepper";
import Patientform from "@/components/ui/forms/Patientform";

export const metadata: Metadata = {
  title: "Book an appointment · CarePulse",
  description:
    "Request an appointment with your practice in about two minutes. No account needed.",
  robots: { index: false, follow: false },
};

export default function PatientsHome() {
  return (
    <PatientShell
      aside="/assets/images/onboarding-img.png"
      asideAlt="Clinician meeting a patient"
    >
      <Stepper current={0} />

      <h1 className="t-h1 text-ink">Let&apos;s get you booked in.</h1>
      <p className="t-body mt-2.5 text-ink-muted">
        Three short steps, about two minutes. You do not need to create an
        account or remember a password.
      </p>

      <div className="mt-8">
        <Patientform />
      </div>

      <PrivacyNote />
    </PatientShell>
  );
}
