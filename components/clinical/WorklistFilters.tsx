"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

/**
 * Worklist filters: status tabs plus a name search.
 *
 * State lives in the URL rather than in component state, so a member of
 * staff can bookmark "pending only", send that link to a colleague, and
 * refresh without losing their place. It also means the filtering happens
 * where the data does.
 *
 * The search input is debounced. Without it, every keystroke pushes a
 * navigation, which on a slow connection makes the field feel like it is
 * dropping characters.
 */
const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function WorklistFilters({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const status = params.get("status") ?? "all";
  const urlQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  // Keep the field in sync when navigation changes the URL from elsewhere
  // (back button, a bookmarked link).
  useEffect(() => setQuery(urlQuery), [urlQuery]);

  const push = (next: URLSearchParams) => {
    startTransition(() => {
      const qs = next.toString();
      router.replace(qs ? `/admin?${qs}` : "/admin", { scroll: false });
    });
  };

  const setStatus = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete("status");
    else next.set("status", value);
    push(next);
  };

  useEffect(() => {
    if (query === urlQuery) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      push(next);
    }, 300);
    return () => clearTimeout(t);
    // `params` and `push` are stable enough here; re-running on every
    // params change would cancel the debounce on unrelated navigations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, urlQuery]);

  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div
        role="tablist"
        aria-label="Filter appointments by status"
        className="flex flex-wrap gap-1"
      >
        {TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={active}
              onClick={() => setStatus(tab.value)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-ink-muted hover:bg-raised hover:text-ink"
              }`}
            >
              {tab.label}
              <span
                className={`rounded px-1.5 py-0.5 text-[0.6875rem] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-raised text-ink-subtle"
                }`}
              >
                {counts[tab.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative sm:w-64">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient or physician"
          aria-label="Search appointments by patient or physician name"
          className="h-10 w-full rounded-md border border-line-strong bg-surface pl-9 pr-8 text-[0.875rem] text-ink placeholder:text-ink-subtle/70"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-subtle hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        )}
        {isPending && (
          <span className="sr-only" role="status">
            Updating results
          </span>
        )}
      </div>
    </div>
  );
}
