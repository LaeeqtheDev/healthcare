import type { Metadata } from "next";

import { PatientShell } from "@/components/clinical/PatientShell";
import { PrivacyNote, Stepper } from "@/components/clinical/Stepper";
import RegisterForm from "@/components/ui/forms/RegisterForm";
import { getUser } from "@/lib/actions/patient.actions";

export const metadata: Metadata = {
  title: "Your details · CarePulse",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const Register = async ({ params }: { params: { userId: string } }) => {
  const { userId } = params;
  const user = await getUser(userId);

  return (
    <PatientShell
      aside="/assets/images/register-img.png"
      asideAlt="Practice reception"
      width="max-w-[720px]"
    >
      <Stepper current={1} />

      <h1 className="t-h1 text-ink">A little about your health.</h1>
      <p className="t-body mt-2.5 text-ink-muted">
        This is the paperwork you would normally fill in on a clipboard in
        the waiting room. Doing it now means your appointment starts on time.
      </p>

      <div className="mt-8">
        <RegisterForm user={user} />
      </div>

      <PrivacyNote />
    </PatientShell>
  );
};

export default Register;
