"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useAviation } from "@/hooks/useAviation";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { AircraftState } from "@/types/aviation";

const EMERGENCY_SQUAWKS = new Set(["7500", "7600", "7700"]);
const IRAN_PREFIXES = ["IRI", "IRN", "IHR", "EPA", "QFZ"];

const SQUAWK_LABELS: Record<string, string> = {
  "7500": "HIJACK",
  "7600": "RADIO FAIL",
  "7700": "EMERGENCY",
};

function mToFt(m: number | null): string {
  if (m == null || m <= 0) return "GND";
  return `${Math.round(m * 3.28084).toLocaleString()}`;
}

function msToKt(ms: number | null): string {
  if (ms == null) return "—";
  return `${Math.round(ms * 1.94384)}`;
}

function isIranian(a: AircraftState): boolean {
  if (a.originCountry.toLowerCase().includes("iran")) return true;
  if (!a.callsign) return false;
  return IRAN_PREFIXES.some((p) => a.callsign!.toUpperCase().startsWith(p));
}

function getRowClass(a: AircraftState): string {
  if (a.squawk && EMERGENCY_SQUAWKS.has(a.squawk))
    return "bg-red-900/30 border-l-2 border-l-bloomberg-negative";
  if (isIranian(a)) return "border-l-2 border-l-bloomberg-warning";
  return "";
}

function StatBox({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-1 px-2 bg-bloomberg-header border border-bloomberg-border">
      <span className={cn("text-sm font-black tabular-nums", color ?? "text-bloomberg-text")}>
        {value}
      </span>
      <span className="text-2xs text-bloomberg-muted tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

export function AviationWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } =
    useAviation(pollingIntervalMs);

  return (
    <WidgetShell
      widgetId="aviation-monitor"
      label={label}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refresh}
      lastUpdated={lastUpdated}
      liveIndicator={true}
      className="h-full"
    >
      {data && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-px bg-bloomberg-border flex-shrink-0 p-px">
            <StatBox label="TOTAL A/C" value={data.totalCount} color="text-bloomberg-accent" />
            <StatBox label="IN FLIGHT" value={data.inFlightCount} color="text-bloomberg-positive" />
            <StatBox
              label="NEAR HORMUZ"
              value={data.nearHormuzCount}
              color={data.nearHormuzCount > 10 ? "text-bloomberg-negative" : "text-bloomberg-warning"}
            />
          </div>

          {/* Column headers */}
          <div className="grid text-2xs font-bold tracking-widest text-bloomberg-muted px-2 py-1 border-b border-bloomberg-border bg-bloomberg-header flex-shrink-0"
            style={{ gridTemplateColumns: "1fr 5rem 4rem 4rem 4.5rem" }}>
            <span>CALLSIGN / COUNTRY</span>
            <span className="text-right">ALT (ft)</span>
            <span className="text-right">SPD (kt)</span>
            <span className="text-right">HDG</span>
            <span className="text-right">STATUS</span>
          </div>

          {/* Aircraft list */}
          <div className="flex-1 overflow-y-auto">
            {data.aircraft.length === 0 ? (
              <div className="px-2 py-2 text-2xs text-bloomberg-muted italic">
                No aircraft detected in Persian Gulf region
              </div>
            ) : (
              data.aircraft.map((a) => {
                const isEmergency = !!(a.squawk && EMERGENCY_SQUAWKS.has(a.squawk));
                const isIran = isIranian(a);
                const callsign = a.callsign?.trim();
                const flightUrl = callsign
                  ? `https://flightaware.com/live/flight/${callsign}`
                  : `https://www.flightradar24.com/data/aircraft/${a.icao24}`;
                return (
                  <a
                    key={a.icao24}
                    href={flightUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "grid items-center px-2 py-1 border-b border-bloomberg-border hover:bg-bloomberg-bg cursor-pointer group",
                      getRowClass(a)
                    )}
                    style={{ gridTemplateColumns: "1fr 5rem 4rem 4rem 4.5rem" }}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className={cn(
                        "text-2xs font-bold truncate group-hover:underline",
                        isEmergency ? "text-bloomberg-negative" :
                        isIran ? "text-bloomberg-warning" :
                        "text-bloomberg-accent"
                      )}>
                        {callsign ?? a.icao24.toUpperCase()}
                      </span>
                      <span className="text-2xs text-bloomberg-muted truncate">
                        {a.originCountry}
                      </span>
                    </div>
                    <span className="text-2xs text-bloomberg-text text-right tabular-nums">
                      {mToFt(a.baroAltitude)}
                    </span>
                    <span className="text-2xs text-bloomberg-text text-right tabular-nums">
                      {msToKt(a.velocity)}
                    </span>
                    <span className="text-2xs text-bloomberg-muted text-right tabular-nums">
                      {a.trueTrack != null ? `${Math.round(a.trueTrack)}°` : "—"}
                    </span>
                    <span className={cn(
                      "text-2xs font-bold text-right truncate",
                      isEmergency ? "text-bloomberg-negative" :
                      isIran ? "text-bloomberg-warning" :
                      a.onGround ? "text-bloomberg-muted" :
                      "text-bloomberg-positive"
                    )}>
                      {isEmergency && a.squawk
                        ? SQUAWK_LABELS[a.squawk] ?? `SQWK ${a.squawk}`
                        : isIran ? "IRAN"
                        : a.onGround ? "GROUND"
                        : (a.verticalRate ?? 0) > 1 ? "▲ CLIMB"
                        : (a.verticalRate ?? 0) < -1 ? "▼ DESCEND"
                        : "— CRUISE"}
                    </span>
                  </a>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-2 py-1 border-t border-bloomberg-border bg-bloomberg-header flex items-center justify-between flex-shrink-0">
            <span className="text-2xs text-bloomberg-muted">SOURCE: OPENSKY NETWORK</span>
            <span className="text-2xs text-bloomberg-muted">
              {data.groundCount} ON GROUND
            </span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
