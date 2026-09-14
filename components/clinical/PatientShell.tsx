import Link from "next/link";
import type { ReactNode } from "react";

import { PulseMark } from "@/components/clinical/AppHeader";

/**
 * Shared layout for the three patient-facing form screens.
 *
 * The original used `h-screen max-h-screen` with an inner scroll area on
 * every one of these pages. On a phone that is a trap: the browser chrome
 * makes 100vh taller than the visible area, so the submit button sits
 * below the fold with no page scroll to reach it. This uses normal
 * document flow and lets the page scroll, which is what a long form needs.
 *
 * The decorative side image is hidden below lg and, importantly, is no
 * longer requested at 1000x1000 for a 390px slot.
 */
export function PatientShell({
  children,
  aside,
  asideAlt = "",
  width = "max-w-[560px]",
}: {
  children: ReactNode;
  aside?: string;
  asideAlt?: string;
  width?: string;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div
        className={`flex w-full flex-col ${
          aside ? "lg:w-[58%] xl:w-[55%]" : ""
        }`}
      >
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex h-16 w-full max-w-[720px] items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-md bg-brand-600 text-white">
                <PulseMark />
              </span>
              <span className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
                CarePulse
              </span>
            </Link>
            <Link
              href="/providers"
              className="text-[0.8125rem] font-semibold text-brand-600"
            >
              Find a doctor
            </Link>
          </div>
        </header>

        <main id="main" className="flex-1 px-5 py-10">
          <div className={`mx-auto w-full ${width}`}>{children}</div>
        </main>

        <footer className="border-t border-line px-5 py-6">
          <div className={`mx-auto w-full ${width} flex flex-wrap items-center justify-between gap-3`}>
            <p className="copyright">
              © {new Date().getFullYear()} CarePulse
            </p>
            <Link
              href="/admin"
              className="text-[0.8125rem] font-medium text-ink-subtle hover:text-ink"
            >
              Staff sign in
            </Link>
          </div>
        </footer>
      </div>

      {aside && (
        <aside
          className="relative hidden flex-1 bg-brand-700 lg:block"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={aside}
            alt={asideAlt}
            className="absolute inset-0 size-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-700/70 to-transparent" />
        </aside>
      )}
    </div>
  );
}
