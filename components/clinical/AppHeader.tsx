import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut, ShieldCheck } from "lucide-react";

import { logout } from "@/lib/actions/auth.actions";

/**
 * Admin application header. Distinct from the marketing site header on
 * purpose: this is the signed-in clinical surface and should not look like
 * a landing page. Sticky, because staff scroll long worklists and losing
 * the sign-out control is how shared machines stay signed in.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md"
            aria-label="CarePulse home"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-600 text-white">
              <PulseMark />
            </span>
            <span className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
              CarePulse
            </span>
          </Link>

          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-raised px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-muted sm:inline-flex">
            <ShieldCheck className="size-3" aria-hidden />
            Staff area
          </span>
        </div>

        <nav aria-label="Staff sections" className="hidden items-center gap-1 md:flex">
          <NavLink href="/admin">Worklist</NavLink>
          <NavLink href="/admin/directory">Directory</NavLink>
        </nav>

        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-3 py-2 text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-raised"
          >
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-[0.875rem] font-semibold text-ink-muted transition-colors hover:bg-raised hover:text-ink"
    >
      {children}
    </Link>
  );
}

export function PulseMark({ className = "size-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        d="M2 12h4.2l2.1-5.4 3.4 11.2 2.6-7.1 1.6 3.3H22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
