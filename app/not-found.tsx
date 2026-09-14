import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-raised text-ink-subtle">
          <FileQuestion className="size-5" aria-hidden />
        </span>
        <h1 className="t-h2 text-ink">That page does not exist</h1>
        <p className="t-small mt-2.5 text-ink-muted">
          The link may be out of date, or the appointment it pointed to may
          have been cancelled.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-700"
          >
            Back to home
          </Link>
          <Link
            href="/patients"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line-strong px-5 text-[0.9375rem] font-semibold text-ink hover:bg-raised"
          >
            Book an appointment
          </Link>
        </div>
      </div>
    </main>
  );
}
