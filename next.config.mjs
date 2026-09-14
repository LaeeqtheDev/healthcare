/** @type {import('next').NextConfig} */

/**
 * Framing policy.
 *
 * This application shows patient data, so clickjacking is a genuine risk:
 * an attacker overlays an invisible copy of the worklist and captures
 * clicks on real appointment actions. The default is therefore to refuse
 * framing entirely.
 *
 * The one exception is the North Foundry case study, which embeds the
 * PUBLIC marketing page to demonstrate the product. That is a real
 * trade-off and it is scoped as tightly as it can be:
 *
 *   - Public routes allow ONLY northfoundry.co (and localhost for dev).
 *   - /admin and /patients stay 'none' and cannot be framed by anyone,
 *     including North Foundry. Those are the routes that actually reach
 *     patient data, so the clickjacking risk is unchanged there.
 *
 * If you ever take the case study down, set this back to 'none' for
 * everything. Framing a healthcare app should be a decision, not a default.
 */
const PUBLIC_FRAME_ANCESTORS = [
  "'self'",
  "https://northfoundry.co",
  "https://www.northfoundry.co",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

/** Public marketing, directory and booking-entry pages. */
const securityHeaders = [
  ...baseHeaders,
  {
    key: "Content-Security-Policy",
    value: `frame-ancestors ${PUBLIC_FRAME_ANCESTORS.join(" ")}`,
  },
];

/** Anything touching patient data. Never framable, by anyone. */
const sensitiveHeaders = [
  ...baseHeaders,
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig = {
  images: {
    /* Allowed remote image hosts.
     *
     * The landing page ships with product screenshots and generated
     * illustration rather than stock photography (see lib/marketing.ts for
     * why). These hosts are permitted so a practice can drop their OWN
     * photo URLs into the content without a config change:
     *   - their own CDN or S3 bucket: add the hostname here
     *   - Unsplash, for a placeholder while real photos are shot
     *   - Lorem Picsum, for obviously-fake placeholders during a demo
     * Nothing here is fetched unless a URL is actually used. */
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Belt and braces: even if a patient-data URL is shared or
        // scraped, it carries an explicit no-index header.
        //
        // NOTE: ordering matters. Next applies EVERY matching rule and the
        // last one wins per header key, so these narrower rules must come
        // after the catch-all above or their stricter CSP is overwritten.
        source: "/admin/:path*",
        headers: [
          ...sensitiveHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/patients/:path*",
        headers: [
          ...sensitiveHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
