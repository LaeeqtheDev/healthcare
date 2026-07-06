import Image from "next/image";
import Link from "next/link";

import Patientform from "@/components/ui/forms/Patientform";

export default function PatientsHome() {
  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <Link href="/">
            <Image
              src="/assets/icons/logo-full.svg"
              alt="patient"
              height={1000}
              width={1000}
              className="mb-12 h10 w-fit"
            />
          </Link>

          <Patientform />

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-dark-600 xl:text-left">
              © 2026 CarePulse
            </p>
            <Link href="/admin" className="text-green-500">
              Admin
            </Link>
          </div>
        </div>
      </section>

      <Image
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[50%]"
      />
    </div>
  );
}
