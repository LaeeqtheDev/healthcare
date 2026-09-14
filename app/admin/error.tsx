"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Worklist error boundary.
 *
 * Deliberately does NOT print `error.message` to the screen. A failure
 * here comes from the data layer, and database errors routinely contain
 * collection names, IDs and occasionally record contents. Showing that on
 * a screen behind a shared passkey is an avoidable leak. The digest is
 * enough to find the real error in the server logs.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] worklist failed to load:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-md p-7 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-crit-50 text-crit-700">
          <AlertTriangle className="size-5" aria-hidden />
        </span>
        <h1 className="t-h2 text-ink">The worklist could not be loaded</h1>
        <p className="t-small mt-2.5 text-ink-muted">
          No appointments were changed. This is usually a connection problem
          between the app and the patient database.
        </p>
        {error.digest && (
          <p className="mt-4 rounded-md bg-raised px-3 py-2 font-mono text-[0.75rem] text-ink-subtle">
            Reference: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 text-[0.9375rem] font-semibold text-white hover:bg-brand-700"
        >
          <RotateCw className="size-4" aria-hidden />
          Try again
        </button>
      </div>
    </main>
  );
}
