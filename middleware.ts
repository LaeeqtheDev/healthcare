import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge auth gate for /admin.
 *
 * WHY MIDDLEWARE AND NOT JUST THE PAGE CHECK
 * ------------------------------------------
 * app/admin/page.tsx already calls redirect() before fetching anything,
 * and that alone keeps patient data off the wire. But because the route
 * has a loading.tsx, Next streams the loading shell with a 200 and then
 * delivers the redirect inside the stream, to be executed on the client.
 *
 * That is safe (the streamed HTML contains only skeleton markup) but it is
 * not ideal for a screen holding PHI: a client with JavaScript disabled
 * sits on a skeleton indefinitely, and the response looks like a success
 * to anything reading status codes, including monitoring and logs.
 *
 * Running the check here returns a real 307 with no body at all, before
 * any rendering happens. The page-level check stays as defence in depth,
 * so removing this file weakens the response but does not expose data.
 *
 * Uses Web Crypto rather than node:crypto because middleware runs on the
 * Edge runtime, where node:crypto is unavailable. The HMAC construction
 * matches lib/auth.ts exactly.
 */

const COOKIE_NAME = "cp_admin_session";

async function hmac(key: ArrayBuffer | Uint8Array, data: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

function toHex(buf: ArrayBuffer) {
  // Array.from rather than spread: tsconfig targets ES5 here, where
  // spreading a typed array needs downlevelIteration.
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-independent comparison so a mismatch does not leak position. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isValidSession(raw: string | undefined, secret: string) {
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;

  const [expires, nonce, signature] = parts;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  // Same derivation as lib/auth.ts: key = HMAC(secret, "cp-session-v1")
  const keyBytes = await hmac(new TextEncoder().encode(secret), "cp-session-v1");
  const expected = toHex(await hmac(keyBytes, `${expires}.${nonce}`));

  return safeEqual(signature, expected);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page itself must stay reachable.
  if (pathname === "/admin/login") return NextResponse.next();

  const secret = process.env.ADMIN_PASSKEY;

  // Fail closed. An unconfigured deployment must not expose the worklist.
  if (!secret || secret.length < 4) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const ok = await isValidSession(
    request.cookies.get(COOKIE_NAME)?.value,
    secret
  );

  if (!ok) {
    const url = new URL("/admin/login", request.url);
    const res = NextResponse.redirect(url);
    // Clear an expired or tampered cookie so the browser stops sending it.
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
