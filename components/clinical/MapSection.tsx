"use client";

import dynamic from "next/dynamic";

import type { Facility } from "@/lib/directory";

/**
 * Client boundary for the map.
 *
 * Leaflet reads `window` at module scope, so it can never be part of a
 * server render. `ssr: false` is only legal inside a client component,
 * which is the whole reason this thin wrapper exists. The skeleton keeps
 * the layout from jumping when the map chunk arrives.
 */
const FacilityMap = dynamic(
  () => import("@/components/clinical/FacilityMap").then((m) => m.FacilityMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="card h-[420px] sm:h-[576px]">
            <div className="skeleton h-full w-full rounded-lg" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="card h-[420px] sm:h-[576px]">
            <div className="skeleton h-full w-full rounded-lg" />
          </div>
        </div>
      </div>
    ),
  }
);

export function MapSection(props: {
  facilities: Facility[];
  center: { lat: number; lng: number };
  zoom?: number;
}) {
  return <FacilityMap {...props} />;
}
