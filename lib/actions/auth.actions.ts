"use server";

import { redirect } from "next/navigation";

import {
  createSession,
  destroySession,
  isAdminConfigured,
  verifyPasskey,
} from "@/lib/auth";

export type LoginState = { error?: string };

/**
 * Admin login. Runs on the server, so the passkey is never shipped to the
 * browser and a wrong attempt reveals nothing beyond "wrong".
 *
 * Deliberately does NOT distinguish between "no passkey entered" and
 * "wrong passkey" in its failure message, beyond the configuration case,
 * which is an operator problem rather than an attacker-useful signal.
 */
export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return {
      error:
        "Admin access is not configured on this deployment. Set ADMIN_PASSKEY in the environment and restart.",
    };
  }

  const passkey = String(formData.get("passkey") ?? "");

  if (!verifyPasskey(passkey)) {
    // A small delay blunts trivial online guessing. Real rate limiting
    // belongs at the edge; this is not a substitute for it.
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That passkey was not recognised." };
  }

  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
