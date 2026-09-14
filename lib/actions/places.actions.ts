"use server";

/**
 * Nearby healthcare facilities, from OpenStreetMap via the Overpass API.
 *
 * WHY OVERPASS
 * ------------
 * Google Places would do this too, but it needs a billable API key, it
 * forbids caching results, and its terms require you to display results on
 * a Google map. Overpass is free, needs no key, and the data is ODbL so it
 * can be stored and shown on any map. For "where is my nearest hospital"
 * on a practice website, OSM coverage of hospitals, clinics, pharmacies
 * and dentists is good in nearly every populated area.
 *
 * WHY IT IS ON THE SERVER
 * -----------------------
 * Overpass asks callers to identify themselves and to be gentle. Calling
 * it from every visitor's browser would spray uncoordinated requests at a
 * volunteer-funded endpoint from thousands of IPs. Going through our own
 * server means one identifiable user agent, one place to cache, and one
 * place to back off if we are asked to.
 *
 * NOT TESTED AGAINST THE LIVE API from the build environment used to write
 * this (outbound network is restricted there), so the parser is written
 * against the documented Overpass JSON shape and every failure path
 * returns a usable message rather than throwing. Worth one manual check
 * after deploy.
 */

export type NearbyPlace = {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  emergency?: boolean;
  openingHours?: string;
  website?: string;
  /** Straight-line distance in km from the search point. */
  distanceKm: number;
};

export type NearbyState = {
  places?: NearbyPlace[];
  error?: string;
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  // Mirror. Overpass instances go down for maintenance reasonably often,
  // and a map that silently shows nothing is worse than one that retries.
  "https://overpass.kumi.systems/api/interpreter",
];

/** Haversine, because "nearest" has to be sorted by something. */
function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const KIND_LABEL: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  doctors: "Doctor's surgery",
  dentist: "Dentist",
  pharmacy: "Pharmacy",
  laboratory: "Laboratory",
};

export async function findNearbyFacilities(
  lat: number,
  lng: number,
  radiusMetres = 5000
): Promise<NearbyState> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "Invalid location." };
  }

  // Cap the radius. An unbounded radius from a public endpoint is both a
  // slow query for us and an unkind one for a volunteer-run service.
  const radius = Math.min(Math.max(radiusMetres, 500), 25000);

  const query = `
    [out:json][timeout:20];
    (
      node["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"](around:${radius},${lat},${lng});
      way["amenity"~"^(hospital|clinic|doctors|dentist)$"](around:${radius},${lat},${lng});
    );
    out center tags 60;
  `;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          // Overpass asks callers to identify themselves.
          "user-agent": "CarePulse/1.0 (practice directory; +https://carepulse.app)",
        },
        body: new URLSearchParams({ data: query }),
        // OSM facility data changes slowly. A day of caching is generous
        // to the endpoint and invisible to the visitor.
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) continue;

      const data = await res.json();

      const places: NearbyPlace[] = (data?.elements ?? [])
        .map((el: any) => {
          const pLat = el.lat ?? el.center?.lat;
          const pLng = el.lon ?? el.center?.lon;
          if (typeof pLat !== "number" || typeof pLng !== "number") return null;

          const tags = el.tags ?? {};
          const name = tags.name ?? tags["name:en"];
          // Unnamed pins are noise on a map a patient is trying to read.
          if (!name) return null;

          const street = [tags["addr:housenumber"], tags["addr:street"]]
            .filter(Boolean)
            .join(" ");
          const address = [street, tags["addr:city"]].filter(Boolean).join(", ");

          return {
            id: `${el.type}/${el.id}`,
            name,
            kind: KIND_LABEL[tags.amenity] ?? "Healthcare",
            lat: pLat,
            lng: pLng,
            address: address || undefined,
            phone: tags.phone ?? tags["contact:phone"] ?? undefined,
            emergency: tags.emergency === "yes",
            openingHours: tags.opening_hours ?? undefined,
            website: tags.website ?? tags["contact:website"] ?? undefined,
            distanceKm: distanceKm(lat, lng, pLat, pLng),
          } satisfies NearbyPlace;
        })
        .filter(Boolean)
        .sort((a: NearbyPlace, b: NearbyPlace) => a.distanceKm - b.distanceKm)
        .slice(0, 40);

      return { places };
    } catch (error) {
      console.error(`[overpass] ${endpoint} failed:`, error);
      // Try the next mirror before giving up.
    }
  }

  return {
    error:
      "Could not load nearby facilities right now. The practice's own sites are still shown on the map.",
  };
}
