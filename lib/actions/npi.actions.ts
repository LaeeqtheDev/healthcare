"use server";

/**
 * NPI Registry lookup.
 *
 * The National Plan and Provider Enumeration System (NPPES), run by CMS,
 * publishes every US healthcare provider's NPI, legal name, credential,
 * taxonomy (specialty) and practice address. The API is free, public, and
 * requires no key or registration:
 *
 *   https://npiregistry.cms.hhs.gov/api/?version=2.1&...
 *
 * Why a practice should care: the NPI is the identifier that ties a
 * clinician to claims, e-prescribing and payer directories. Typing
 * provider names and specialties by hand produces a directory that drifts
 * out of step with what insurers hold, and mismatched provider data is a
 * routine cause of claim rejections. Looking it up once, at the point a
 * provider is added, keeps the local directory aligned with the registry.
 *
 * SCOPE: US only. NPPES has no equivalent outside the United States. For
 * other markets the analogues are national registers (the GMC register in
 * the UK, PMDC in Pakistan, AHPRA in Australia), most of which have no
 * open API, so a manual verification step is the realistic substitute.
 *
 * This is called from staff-facing screens only. It is deliberately not
 * exposed to patients: the registry is public, but proxying an unbounded
 * third-party search through your own server for anonymous visitors is a
 * free abuse vector.
 */

export type NpiResult = {
  npi: string;
  name: string;
  credential: string;
  specialty: string;
  city: string;
  state: string;
  status: string;
};

export type NpiSearchState = {
  results?: NpiResult[];
  error?: string;
  searched?: boolean;
};

const ENDPOINT = "https://npiregistry.cms.hhs.gov/api/";

export async function searchNpi(
  _prev: NpiSearchState,
  formData: FormData
): Promise<NpiSearchState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();

  // NPPES rejects queries that are too broad, so fail early with a useful
  // message rather than forwarding a request we know will be refused.
  if (!lastName || lastName.length < 2) {
    return { error: "Enter at least a last name to search.", searched: true };
  }

  const params = new URLSearchParams({
    version: "2.1",
    limit: "10",
    last_name: lastName,
  });
  if (firstName) params.set("first_name", firstName);
  if (state) params.set("state", state.toUpperCase());

  try {
    const res = await fetch(`${ENDPOINT}?${params}`, {
      headers: { accept: "application/json" },
      // The registry changes slowly; an hour of caching keeps repeated
      // staff searches off the wire without serving stale data.
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        error: `The NPI Registry returned ${res.status}. Try again shortly.`,
        searched: true,
      };
    }

    const data = await res.json();

    // NPPES reports its own errors inside a 200 response.
    if (data?.Errors?.length) {
      return {
        error: data.Errors[0]?.description ?? "The registry rejected that search.",
        searched: true,
      };
    }

    const results: NpiResult[] = (data?.results ?? []).map((r: any) => {
      const basic = r.basic ?? {};
      const primaryTaxonomy =
        (r.taxonomies ?? []).find((t: any) => t.primary) ?? r.taxonomies?.[0];
      const location =
        (r.addresses ?? []).find((a: any) => a.address_purpose === "LOCATION") ??
        r.addresses?.[0];

      return {
        npi: String(r.number ?? ""),
        name: [basic.first_name, basic.last_name].filter(Boolean).join(" ") ||
          basic.organization_name ||
          "Unknown",
        credential: basic.credential ?? "",
        specialty: primaryTaxonomy?.desc ?? "Not listed",
        city: location?.city ?? "",
        state: location?.state ?? "",
        status: basic.status === "A" ? "Active" : "Inactive",
      };
    });

    return { results, searched: true };
  } catch (error) {
    console.error("[npi] lookup failed:", error);
    // A registry outage must not block adding a provider. Staff can still
    // enter details manually; this is a convenience, not a dependency.
    return {
      error:
        "Could not reach the NPI Registry. Check the connection, or add the provider manually.",
      searched: true,
    };
  }
}
