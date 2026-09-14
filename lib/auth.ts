import "server-only";

import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";

/* NOTE ON `await cookies()`
 * -------------------------
 * On Next 14 (this project) `cookies()` is synchronous, and awaiting a
 * non-promise is a harmless no-op. On Next 15 it returns a promise and the
 * await is required. Writing it this way means an upgrade does not
 * silently break session handling. */

/**
 * Server-side admin session.
 *
 * WHY THIS EXISTS
 * ---------------
 * The previous gate was `NEXT_PUBLIC_ADMIN_PASSKEY` compared in the
 * browser by <PasskeyModal />. That had two separate failures, and in an
 * application holding patient data either one on its own is disqualifying:
 *
 *   1. Anything prefixed NEXT_PUBLIC_ is inlined into the JavaScript
 *      bundle at build time. The passkey was readable by anyone who
 *      opened devtools and searched the source. It was not a secret.
 *
 *   2. The check ran in the browser, but /admin is a server component
 *      that fetched every appointment BEFORE rendering. The patient list
 *      was already in the HTML and the RSC payload by the time the modal
 *      appeared. Disabling JavaScript, or reading the network response,
 *      showed every patient name, phone number and appointment reason.
 *      The modal was a curtain, not a lock.
 *
 * This module moves the check to the server, before any patient data is
 * fetched. The secret lives in ADMIN_PASSKEY (no NEXT_PUBLIC_ prefix, so
 * it never reaches the client). A successful login sets an httpOnly,
 * signed cookie that JavaScript cannot read.
 *
 * This is a single shared passkey, which is appropriate for a
 * single-practice deployment and NOT appropriate for a multi-user
 * clinical system. Before real PHI, this should become per-user accounts
 * with individual audit trails, which is what an access log is for. That
 * is a deliberate, documented limitation rather than an oversight.
 */

const COOKIE_NAME = "cp_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // One clinic shift.

function getSecret(): string | null {
  const passkey = process.env.ADMIN_PASSKEY;
  if (!passkey || passkey.length < 4) return null;
  return passkey;
}

/** Signing key for the session cookie, derived from the passkey so there
 * is only one secret to configure. Rotating ADMIN_PASSKEY invalidates
 * every existing session, which is the behaviour you want. */
function signingKey(secret: string) {
  return createHmac("sha256", secret).update("cp-session-v1").digest();
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", signingKey(secret)).update(payload).digest("hex");
}

/** Timing-safe string comparison. A plain `===` on a secret leaks length
 * and prefix information through response timing. */
function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // Still burn a comparison so the mismatch is not instantaneous.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Verify a submitted passkey. Returns false when unset or wrong. */
export function verifyPasskey(submitted: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  return safeEqual(submitted, secret);
}

/** Is ADMIN_PASSKEY configured at all? Used to show a setup warning rather
 * than an unexplained login failure. */
export function isAdminConfigured(): boolean {
  return getSecret() !== null;
}

export async function createSession() {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_PASSKEY is not configured.");

  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  // A random nonce so two sessions issued in the same millisecond differ.
  const payload = `${expires}.${randomBytes(12).toString("hex")}`;
  const value = `${payload}.${sign(payload, secret)}`;

  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}

/**
 * Is the current request an authenticated admin?
 *
 * Call this BEFORE fetching patient data, never after. The whole point is
 * that unauthorised requests never cause a read of the patient collection.
 */
export async function isAuthenticated(): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;

  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const parts = raw.split(".");
  if (parts.length !== 3) return false;

  const [expires, nonce, signature] = parts;
  const payload = `${expires}.${nonce}`;

  if (!safeEqual(signature, sign(payload, secret))) return false;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}
