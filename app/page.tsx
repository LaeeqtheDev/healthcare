import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Doctors } from "@/constants";

const PulseLine = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 1200 80"
    preserveAspectRatio="none"
    className={`h-14 w-full ${className}`}
    aria-hidden="true"
  >
    <path
      d="M0 40 H420 L455 40 L470 12 L495 68 L515 40 L540 40 L560 20 L580 40 H1200"
      fill="none"
      stroke="#24AE7C"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength="100"
      className="pulse-draw"
    />
  </svg>
);

export default function LandingPage() {
  const onCall = Doctors.slice(0, 9);

  return (
    <div className="min-h-screen bg-dark-200">
      {/* NAV */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <Image
          src="/assets/icons/logo-full.svg"
          height={28}
          width={140}
          alt="CarePulse"
          className="h-7 w-fit"
        />
        <nav className="flex items-center gap-6">
          <Link
            href="/admin"
            className="text-14-medium text-dark-600 transition-colors hover:text-light-200"
          >
            Admin
          </Link>
          <Button asChild className="shad-primary-btn rounded-full px-6">
            <Link href="/patients">Book a visit</Link>
          </Button>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-10 md:pt-16">
        <p className="font-mono text-12-semibold uppercase tracking-[0.2em] text-green-500">
          Now scheduling · {onCall.length} physicians on call
        </p>

        <h1 className="mt-6 max-w-3xl text-[42px] font-bold leading-[1.05] text-light-200 md:text-[68px]">
          Every heartbeat of your care,
          <span className="text-green-500"> on one schedule.</span>
        </h1>

        <p className="mt-6 max-w-xl text-16-regular text-dark-700">
          CarePulse turns appointment booking into a two-minute form and
          gives your front desk a live pulse on every patient, from first
          request to confirmed visit.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild size="lg" className="shad-primary-btn rounded-full px-8">
            <Link href="/patients">Book an appointment</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="shad-gray-btn rounded-full px-8"
          >
            <Link href="/admin">Open admin dashboard</Link>
          </Button>
        </div>

        <div className="mt-16">
          <PulseLine />
        </div>
      </section>

      {/* ON-CALL DIRECTORY STRIP */}
      <section className="border-y border-dark-400 bg-dark-300 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <div className="scrollbar-hide flex gap-8 overflow-x-auto">
            {onCall.map((doctor) => (
              <div
                key={doctor.name}
                className="flex shrink-0 items-center gap-3"
              >
                <Image
                  src={doctor.image}
                  height={36}
                  width={36}
                  alt={doctor.name}
                  className="size-9 rounded-full border border-dark-500 object-cover"
                />
                <div className="whitespace-nowrap">
                  <p className="text-14-medium text-light-200">
                    Dr. {doctor.name}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-green-500">
                    on call
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNEY / FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-md text-32-bold text-light-200">
          From request to record, three steps.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-dark-500 md:grid-cols-3">
          <JourneyStep
            index="01"
            title="Book"
            description="Pick a physician, a time, and a reason. Confirmed in seconds, no phone queue."
          />
          <JourneyStep
            index="02"
            title="Track"
            description="Your team sees every request land on a live dashboard the moment it's submitted."
          />
          <JourneyStep
            index="03"
            title="Record"
            description="Once confirmed, history, documents, and notes stay attached to the visit for good."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-dark-400 bg-dark-300">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-10">
            <PulseLine />
          </div>
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h2 className="max-w-sm text-32-bold text-light-200">
                Your first appointment is two minutes away.
              </h2>
            </div>
            <Button asChild size="lg" className="shad-primary-btn shrink-0 rounded-full px-8">
              <Link href="/patients">Get started</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <p className="text-14-regular text-dark-600">
          © {new Date().getFullYear()} CarePulse
        </p>
        <Link href="/admin" className="text-14-regular text-dark-600 hover:text-light-200">
          Admin
        </Link>
      </footer>
    </div>
  );
}

const JourneyStep = ({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col gap-4 bg-dark-300 p-8">
    <span className="font-mono text-14-medium text-green-500">{index}</span>
    <h3 className="text-24-bold text-light-200">{title}</h3>
    <p className="text-14-regular text-dark-700">{description}</p>
  </div>
);
