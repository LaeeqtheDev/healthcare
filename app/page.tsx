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

      {/* TRUST / STATS */}
      <section className="border-y border-dark-400 bg-dark-300">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
          <Stat value="9" label="Physicians on the platform" />
          <Stat value="< 2 min" label="Average booking time" />
          <Stat value="24/7" label="Patients can request a visit" />
          <Stat value="0" label="Phone transfers required" />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-md text-32-bold text-light-200">
          What the front desk stopped doing.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Testimonial
            quote="We used to keep a paper log by the phone. Now every request just shows up on the dashboard, already sorted by status."
            name="Front desk lead"
            role="Family medicine clinic"
          />
          <Testimonial
            quote="Patients fill in their own history before they arrive, so the first five minutes of the visit aren't spent on a clipboard."
            name="Practice manager"
            role="Multi-physician practice"
          />
          <Testimonial
            quote="Cancelling and rescheduling used to mean three phone calls. Now it's two clicks and the patient gets a text."
            name="Office coordinator"
            role="Urgent care clinic"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-dark-400 bg-dark-300">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="mb-10 text-32-bold text-light-200">Questions, answered.</h2>
          <div className="divide-y divide-dark-500">
            <FaqItem
              question="Do patients need to create an account?"
              answer="No password to remember. A patient enters their name, email, and phone once, and that identity carries through to booking and any future visits."
            />
            <FaqItem
              question="How does the admin dashboard know about a new request?"
              answer="The moment a patient submits the form, it appears on the dashboard as pending, alongside live counts of scheduled and cancelled appointments."
            />
            <FaqItem
              question="Can a visit be rescheduled or cancelled after booking?"
              answer="Yes. From the admin dashboard, a staff member can confirm, reschedule, or cancel any appointment, and the patient is notified automatically."
            />
            <FaqItem
              question="Where are identification documents stored?"
              answer="Uploaded ID documents are stored in encrypted cloud storage and linked only to that patient's record, never made public."
            />
          </div>
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

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <p className="font-mono text-32-bold text-green-500">{value}</p>
    <p className="mt-2 text-14-regular text-dark-700">{label}</p>
  </div>
);

const Testimonial = ({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) => (
  <div className="flex h-full flex-col justify-between gap-8 rounded-2xl bg-dark-400 p-8">
    <p className="text-16-regular text-light-200">“{quote}”</p>
    <div>
      <p className="text-14-medium text-light-200">{name}</p>
      <p className="text-14-regular text-dark-600">{role}</p>
    </div>
  </div>
);

const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <details className="group py-6">
    <summary className="flex cursor-pointer list-none items-center justify-between text-16-semibold text-light-200">
      {question}
      <span className="ml-4 shrink-0 text-green-500 transition-transform group-open:rotate-45">
        +
      </span>
    </summary>
    <p className="mt-3 text-14-regular text-dark-700">{answer}</p>
  </details>
);
