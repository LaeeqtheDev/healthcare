/** @type {import('next').NextConfig} */

/**
 * Security headers.
 *
 * Unlike a marketing site, this application shows patient data, so framing
 * is denied outright: `frame-ancestors 'none'` blocks clickjacking, where
 * an attacker overlays an invisible copy of the worklist and captures
 * clicks on real appointment actions.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
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
        source: "/admin/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/patients/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
