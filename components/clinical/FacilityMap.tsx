"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, Phone, Siren } from "lucide-react";
import type { Map as LeafletMap, Marker } from "leaflet";

import { findNearbyFacilities, type NearbyPlace } from "@/lib/actions/places.actions";
import type { Facility } from "@/lib/directory";

/**
 * Facility map.
 *
 * Leaflet with OpenStreetMap tiles rather than Google Maps: no API key, no
 * billing account, no per-load cost, and the data licence permits showing
 * results on our own map. A practice should not need a Google Cloud
 * account to put a pin on their own clinic.
 *
 * Leaflet is imported dynamically inside the effect because it touches
 * `window` at module scope and will crash server rendering if imported at
 * the top of the file. This is the standard workaround and the reason the
 * whole component is client-only.
 */
export function FacilityMap({
  facilities,
  center,
  zoom = 12,
}: {
  facilities: Facility[];
  center: { lat: number; lng: number };
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const nearbyLayerRef = useRef<Marker[]>([]);

  const [nearby, setNearby] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // ── Initialise the map once ────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      // Leaflet's default marker icons resolve via relative image paths
      // that break under a bundler. Inline SVG icons avoid the problem
      // entirely and let the pins match the palette.
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        scrollWheelZoom: false, // trapping page scroll inside a map is hostile
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Our own sites, in brand colour.
      facilities.forEach((f) => {
        L.marker([f.lat, f.lng], { icon: pin(L, "#15529B", f.emergency) })
          .addTo(map)
          .bindPopup(
            `<strong>${escapeHtml(f.name)}</strong><br/>${escapeHtml(f.kind)}<br/>${escapeHtml(f.address)}<br/>${escapeHtml(f.phone)}`
          );
      });

      if (facilities.length > 1) {
        map.fitBounds(
          facilities.map((f) => [f.lat, f.lng] as [number, number]),
          { padding: [40, 40] }
        );
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [facilities, center.lat, center.lng, zoom]);

  // ── Nearby lookup ──────────────────────────────────────────────
  const loadNearby = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    const result = await findNearbyFacilities(lat, lng);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    const places = result.places ?? [];
    setNearby(places);

    const map = mapRef.current;
    if (!map) return;

    const L = (await import("leaflet")).default;

    nearbyLayerRef.current.forEach((m) => m.remove());
    nearbyLayerRef.current = [];

    places.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: pin(L, p.emergency ? "#B42318" : "#0B7A5A", p.emergency),
      })
        .addTo(map)
        .bindPopup(
          `<strong>${escapeHtml(p.name)}</strong><br/>${escapeHtml(p.kind)}` +
            (p.address ? `<br/>${escapeHtml(p.address)}` : "") +
            (p.phone ? `<br/>${escapeHtml(p.phone)}` : "")
        );
      nearbyLayerRef.current.push(marker);
    });

    map.setView([lat, lng], 13);
  }, []);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("This browser cannot share a location.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => loadNearby(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLoading(false);
        setError(
          "Location was not shared. Showing the practice's own sites instead."
        );
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [loadNearby]);

  const focus = (lat: number, lng: number, id: string) => {
    setSelected(id);
    mapRef.current?.setView([lat, lng], 15);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="card overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center gap-2.5">
              <MapPin className="size-4 text-ink-subtle" aria-hidden />
              <h3 className="t-h3 text-ink">Where to find us</h3>
            </div>
            <button
              onClick={useMyLocation}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-3 py-2 text-[0.8125rem] font-semibold text-ink hover:bg-raised disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Crosshair className="size-3.5" aria-hidden />
              )}
              {loading ? "Finding" : "Hospitals near me"}
            </button>
          </div>

          <div
            ref={containerRef}
            className="h-[420px] w-full bg-raised sm:h-[520px]"
            role="application"
            aria-label="Map of clinic and hospital locations"
          />

          {error && (
            <p role="status" className="border-t border-line px-5 py-3 t-small text-warn-700">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Location list, synced to the map. A map alone is unusable on a
          phone and invisible to a screen reader; the list is the
          accessible equivalent and most people scan it first anyway. */}
      <div className="lg:col-span-4">
        <div className="card flex h-full flex-col overflow-hidden">
          <div className="panel-header">
            <h3 className="t-h3 text-ink">
              {nearby.length > 0 ? "Nearby facilities" : "Our locations"}
            </h3>
            <span className="t-small text-ink-subtle">
              {nearby.length > 0 ? nearby.length : facilities.length}
            </span>
          </div>

          <ul className="max-h-[460px] divide-y divide-line overflow-y-auto">
            {nearby.length > 0
              ? nearby.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => focus(p.lat, p.lng, p.id)}
                      className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-raised ${
                        selected === p.id ? "bg-brand-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[0.875rem] font-semibold text-ink">
                          {p.name}
                        </span>
                        <span className="shrink-0 t-small text-ink-subtle">
                          {p.distanceKm.toFixed(1)} km
                        </span>
                      </div>
                      <span className="mt-0.5 block t-small text-ink-muted">
                        {p.kind}
                        {p.emergency && (
                          <span className="ml-2 inline-flex items-center gap-1 text-crit-700">
                            <Siren className="size-3" aria-hidden />
                            Emergency
                          </span>
                        )}
                      </span>
                      {p.phone && (
                        <span className="mt-1 flex items-center gap-1.5 t-small text-ink-subtle">
                          <Phone className="size-3" aria-hidden />
                          {p.phone}
                        </span>
                      )}
                    </button>
                  </li>
                ))
              : facilities.map((f) => (
                  <li key={f.id}>
                    <button
                      onClick={() => focus(f.lat, f.lng, f.id)}
                      className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-raised ${
                        selected === f.id ? "bg-brand-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[0.875rem] font-semibold text-ink">
                          {f.name}
                        </span>
                        {f.emergency && (
                          <span className="pill pill-crit shrink-0">24h</span>
                        )}
                      </div>
                      <span className="mt-0.5 block t-small text-ink-muted">
                        {f.address}
                      </span>
                      <span className="mt-1 block t-small text-ink-subtle">
                        {f.hours}
                      </span>
                    </button>
                  </li>
                ))}
          </ul>

          {nearby.length > 0 && (
            <p className="border-t border-line px-5 py-3 t-small text-ink-subtle">
              Nearby data from OpenStreetMap contributors.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Inline SVG pin, so no external marker images are fetched. */
function pin(L: typeof import("leaflet"), colour: string, emergency?: boolean) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 38" width="28" height="38">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 10 14 24 14 24s14-14 14-24C28 6.3 21.7 0 14 0z" fill="${colour}"/>
      <circle cx="14" cy="14" r="5.5" fill="#fff"/>
      ${emergency ? '<circle cx="14" cy="14" r="2.5" fill="' + colour + '"/>' : ""}
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -34],
  });
}

/** Popups take an HTML string, so anything interpolated must be escaped. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
