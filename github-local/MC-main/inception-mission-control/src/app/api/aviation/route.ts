// Server-side only. Proxies OpenSky Network — free, no API key required.

import { NextResponse } from "next/server";
import type { AircraftState, AviationData } from "@/types/aviation";

// Persian Gulf + Strait of Hormuz bounding box
const BOUNDS = { lamin: 22.0, lomin: 48.0, lamax: 30.0, lomax: 65.0 };

// Strait of Hormuz center (approximate)
const HORMUZ_LON = 56.5;
const HORMUZ_LAT = 26.5;
const HORMUZ_RADIUS_DEG = 2.5; // ~280 km

// Squawk codes indicating emergency
const EMERGENCY_SQUAWKS = new Set(["7500", "7600", "7700"]);

// Known Iranian military / government callsign prefixes
const IRAN_PREFIXES = ["IRI", "IRN", "IHR", "EPA", "QFZ"];

function isIranian(callsign: string | null, country: string): boolean {
  if (country.toLowerCase().includes("iran")) return true;
  if (!callsign) return false;
  return IRAN_PREFIXES.some((p) => callsign.toUpperCase().startsWith(p));
}

function distanceDeg(lon: number, lat: number): number {
  const dLon = lon - HORMUZ_LON;
  const dLat = lat - HORMUZ_LAT;
  return Math.sqrt(dLon * dLon + dLat * dLat);
}

export async function GET() {
  try {
    const params = new URLSearchParams({
      lamin: String(BOUNDS.lamin),
      lomin: String(BOUNDS.lomin),
      lamax: String(BOUNDS.lamax),
      lomax: String(BOUNDS.lomax),
    });

    const res = await fetch(
      `https://opensky-network.org/api/states/all?${params}`,
      {
        headers: { Accept: "application/json", "User-Agent": "InceptionMC/1.0" },
        next: { revalidate: 60 }, // 1-minute ISR cache
      }
    );

    if (!res.ok) {
      throw new Error(`OpenSky ${res.status}: ${res.statusText}`);
    }

    const raw = await res.json();
    const rawStates: unknown[][] = raw.states ?? [];

    const aircraft: AircraftState[] = rawStates.map((s) => ({
      icao24: String(s[0] ?? ""),
      callsign: s[1] ? String(s[1]).trim() || null : null,
      originCountry: String(s[2] ?? ""),
      longitude: s[5] != null ? Number(s[5]) : null,
      latitude: s[6] != null ? Number(s[6]) : null,
      baroAltitude: s[7] != null ? Number(s[7]) : null,
      onGround: Boolean(s[8]),
      velocity: s[9] != null ? Number(s[9]) : null,
      trueTrack: s[10] != null ? Number(s[10]) : null,
      verticalRate: s[11] != null ? Number(s[11]) : null,
      squawk: s[14] ? String(s[14]) : null,
    }));

    const inFlight = aircraft.filter((a) => !a.onGround);

    const nearHormuzCount = inFlight.filter(
      (a) =>
        a.longitude != null &&
        a.latitude != null &&
        distanceDeg(a.longitude, a.latitude) < HORMUZ_RADIUS_DEG
    ).length;

    // Sort: emergencies first, then Iranian, then near Hormuz, then by altitude desc
    const sorted = [...aircraft].sort((a, b) => {
      const aEmergency = a.squawk && EMERGENCY_SQUAWKS.has(a.squawk) ? 1 : 0;
      const bEmergency = b.squawk && EMERGENCY_SQUAWKS.has(b.squawk) ? 1 : 0;
      if (bEmergency !== aEmergency) return bEmergency - aEmergency;

      const aIran = isIranian(a.callsign, a.originCountry) ? 1 : 0;
      const bIran = isIranian(b.callsign, b.originCountry) ? 1 : 0;
      if (bIran !== aIran) return bIran - aIran;

      const aHormuz =
        a.longitude && a.latitude && !a.onGround
          ? distanceDeg(a.longitude, a.latitude) < HORMUZ_RADIUS_DEG
            ? 1
            : 0
          : 0;
      const bHormuz =
        b.longitude && b.latitude && !b.onGround
          ? distanceDeg(b.longitude, b.latitude) < HORMUZ_RADIUS_DEG
            ? 1
            : 0
          : 0;
      if (bHormuz !== aHormuz) return bHormuz - aHormuz;

      return (b.baroAltitude ?? 0) - (a.baroAltitude ?? 0);
    });

    const data: AviationData = {
      timestamp: typeof raw.time === "number" ? raw.time : Math.floor(Date.now() / 1000),
      totalCount: aircraft.length,
      inFlightCount: inFlight.length,
      groundCount: aircraft.length - inFlight.length,
      nearHormuzCount,
      aircraft: sorted.slice(0, 60),
    };

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Aviation data unavailable" },
      { status: 500 }
    );
  }
}
