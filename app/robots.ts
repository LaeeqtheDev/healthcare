import type { MetadataRoute } from "next";

/**
 * Only the marketing page is indexable. Everything that touches patient
 * data is disallowed here AND carries `robots: { index: false }` in its
 * own metadata, because robots.txt is a request to well-behaved crawlers
 * and the meta tag is what actually keeps a URL out of a results page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /providers is deliberately indexable: "endocrinologist near me"
      // is how patients search, and a booking form ranks for none of it.
      disallow: ["/admin", "/admin/", "/patients", "/patients/"],
    },
  };
}
