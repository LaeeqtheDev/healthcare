"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertTriangle, Loader2, Lock } from "lucide-react";

import { login, type LoginState } from "@/lib/actions/auth.actions";

/**
 * Staff sign-in form.
 *
 * The passkey is submitted to a server action and compared there. Nothing
 * secret is present in this file or in the bundle it compiles into, which
 * was the defining flaw of the modal this replaces.
 */
export function LoginForm({ configured }: { configured: boolean }) {
  // useFormState rather than React 19's useActionState: this project is on
  // React 18 / Next 14, where useActionState does not exist. Swapping to
  // useActionState is a one-line change if the stack is upgraded later.
  const [state, formAction] = useFormState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {!configured && (
        <div
          role="alert"
          className="flex gap-3 rounded-md border border-warn-500/25 bg-warn-50 p-3.5"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-warn-700"
            aria-hidden
          />
          <p className="t-small text-warn-700">
            <span className="font-semibold">Not configured.</span> Set{" "}
            <code className="rounded bg-warn-500/10 px-1">ADMIN_PASSKEY</code>{" "}
            in this deployment&apos;s environment, then restart the server.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="passkey"
          className="mb-1.5 block text-[0.8125rem] font-semibold text-ink"
        >
          Access passkey
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden
          />
          <input
            id="passkey"
            name="passkey"
            type="password"
            autoComplete="current-password"
            required
            aria-describedby={state.error ? "passkey-error" : undefined}
            aria-invalid={Boolean(state.error)}
            className="h-11 w-full rounded-md border border-line-strong bg-surface pl-9 pr-3 text-[0.9375rem] text-ink"
          />
        </div>
        {state.error && (
          <p id="passkey-error" role="alert" className="mt-2 shad-error">
            {state.error}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? "Checking" : "Sign in"}
    </button>
  );
}
