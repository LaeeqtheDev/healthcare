import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/clinical/LoginForm";
import { PulseMark } from "@/components/clinical/AppHeader";
import { isAdminConfigured, isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Staff sign in · CarePulse",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-brand-600 text-white">
            <PulseMark />
          </span>
          <span className="text-[1.125rem] font-bold tracking-[-0.01em] text-ink">
            CarePulse
          </span>
        </div>

        <div className="card p-7">
          <h1 className="t-h2 text-ink">Staff sign in</h1>
          <p className="t-small mt-2 text-ink-muted">
            This area contains patient information. Access is restricted to
            practice staff.
          </p>

          <LoginForm configured={isAdminConfigured()} />
        </div>

        <p className="mt-6 t-small text-ink-subtle">
          Patients do not need to sign in.{" "}
          <a
            href="/patients"
            className="font-semibold text-brand-600 underline underline-offset-2"
          >
            Book an appointment instead
          </a>
          .
        </p>
      </div>
    </main>
  );
}
