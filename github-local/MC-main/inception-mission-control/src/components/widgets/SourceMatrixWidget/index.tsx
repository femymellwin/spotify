"use client";

import { useNarrative } from "@/components/providers/NarrativeProvider";
import { WidgetShell } from "@/components/widgets/WidgetShell";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { WidgetProps } from "@/types/widget";
import type { SourceProfile } from "@/types/narrative";

function credibilityColor(score: number): string {
  if (score >= 75) return "#00d084";
  if (score >= 50) return "#ffd700";
  if (score >= 25) return "#ff6600";
  return "#ff3333";
}

function SourceRow({ profile }: { profile: SourceProfile }) {
  const color = credibilityColor(profile.credibilityScore);

  return (
    <div className="border-b border-bloomberg-border px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black tracking-wide text-bloomberg-text">
          {profile.name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-2xs font-bold tabular-nums" style={{ color }}>
            {profile.credibilityScore}
          </span>
          <span className="text-2xs text-bloomberg-muted">CRED</span>
        </div>
      </div>

      {/* Credibility bar */}
      <div className="h-px bg-bloomberg-border mb-1.5">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${profile.credibilityScore}%`, background: color }}
        />
      </div>

      {/* Slant badge */}
      <p className="text-2xs text-bloomberg-muted mb-1 italic">{profile.slant}</p>

      {/* Primary narrative */}
      <p className="text-2xs text-bloomberg-text leading-snug mb-1">
        <span className="font-bold text-bloomberg-accent">↳ </span>
        {profile.primaryNarrative}
      </p>

      {/* Recent headlines */}
      {profile.recentHeadlines.slice(0, 2).map((hl, i) => (
        <p
          key={i}
          className="text-2xs text-bloomberg-muted leading-snug border-l border-bloomberg-border pl-2 mt-0.5 line-clamp-1"
        >
          {hl}
        </p>
      ))}
    </div>
  );
}

export function SourceMatrixWidget({ label }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useNarrative();

  return (
    <WidgetShell
      widgetId="source-matrix"
      label={label}
      isLoading={isLoading && !data}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refresh}
      lastUpdated={lastUpdated}
      liveIndicator={true}
      className="h-full"
    >
      {isLoading && !data ? (
        <LoadingSkeleton lines={6} />
      ) : data ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Legend */}
          <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-header flex items-center gap-3 flex-shrink-0 flex-wrap">
            <span className="text-2xs font-bold text-bloomberg-positive">■ HIGH CRED 75+</span>
            <span className="text-2xs font-bold text-bloomberg-warning">■ MED 50–74</span>
            <span className="text-2xs font-bold text-bloomberg-accent">■ LOW 25–49</span>
            <span className="text-2xs font-bold text-bloomberg-negative">■ SUSPECT &lt;25</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {data.sourceProfiles.length === 0 ? (
              <div className="px-3 py-4 text-2xs text-bloomberg-muted italic text-center">
                No source profiles in current analysis
              </div>
            ) : (
              data.sourceProfiles
                .slice()
                .sort((a, b) => b.credibilityScore - a.credibilityScore)
                .map((profile) => (
                  <SourceRow key={profile.name} profile={profile} />
                ))
            )}
          </div>
        </div>
      ) : null}
    </WidgetShell>
  );
}
