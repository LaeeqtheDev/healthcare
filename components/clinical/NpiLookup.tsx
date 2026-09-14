"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Search } from "lucide-react";

import { searchNpi, type NpiSearchState } from "@/lib/actions/npi.actions";

/**
 * NPI Registry lookup.
 *
 * Staff search the CMS registry by name and get back the provider's NPI,
 * credential and official taxonomy, instead of typing a specialty from
 * memory. Keeping the local directory aligned with the registry is what
 * stops provider data drifting away from what payers hold, which is a
 * routine cause of claim rejections.
 */
export function NpiLookup() {
  const [state, formAction] = useFormState<NpiSearchState, FormData>(
    searchNpi,
    {}
  );

  return (
    <div>
      <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto]">
        <Input name="firstName" label="First name" placeholder="Optional" />
        <Input name="lastName" label="Last name" placeholder="Required" required />
        <Input name="state" label="State" placeholder="e.g. CA" maxLength={2} />
        <div className="flex items-end">
          <SearchButton />
        </div>
      </form>

      {state.error && (
        <p role="alert" className="mt-4 shad-error">
          {state.error}
        </p>
      )}

      {state.results && state.results.length === 0 && !state.error && (
        <p className="mt-4 t-small text-ink-muted">
          No providers matched. Try a different spelling, or drop the state
          filter.
        </p>
      )}

      {state.results && state.results.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="clin-table">
            <caption className="sr-only">NPI Registry search results</caption>
            <thead>
              <tr>
                <th scope="col">Provider</th>
                <th scope="col">NPI</th>
                <th scope="col">Primary taxonomy</th>
                <th scope="col">Location</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.results.map((r) => (
                <tr key={r.npi}>
                  <th scope="row" className="px-4 py-3.5 text-left">
                    <span className="block text-[0.875rem] font-semibold text-ink">
                      {r.name}
                    </span>
                    {r.credential && (
                      <span className="block text-[0.75rem] text-ink-subtle">
                        {r.credential}
                      </span>
                    )}
                  </th>
                  <td className="font-mono text-[0.8125rem]">{r.npi}</td>
                  <td className="text-ink-muted">{r.specialty}</td>
                  <td className="text-ink-muted">
                    {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td>
                    <span
                      className={`pill ${r.status === "Active" ? "pill-ok" : "pill-warn"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Input({
  name,
  label,
  placeholder,
  required,
  maxLength,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={`npi-${name}`}
        className="mb-1.5 block text-[0.8125rem] font-semibold text-ink"
      >
        {label}
      </label>
      <input
        id={`npi-${name}`}
        name={name}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[0.875rem] text-ink"
      />
    </div>
  );
}

function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-[0.875rem] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Search className="size-4" aria-hidden />
      )}
      {pending ? "Searching" : "Search"}
    </button>
  );
}
