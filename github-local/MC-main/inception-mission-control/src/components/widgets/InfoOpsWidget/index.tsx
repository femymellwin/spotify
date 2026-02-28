"use client";

import { useNarrative } from "@/components/providers/NarrativeProvider";
import { WidgetShell } from "@/components/widgets/WidgetShell";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { WidgetProps } from "@/types/widget";
import type { InformationOperation, InfoOpType } from "@/types/narrative";

const IO_TYPE_CONFIG: Record<InfoOpType, { color: string; label: string }> = {
  COORDINATED_AMPLIFICATION: { color: "#ff3333", label: "COORD AMP" },
  RECYCLED_CONTENT:          { color: "#ff6600", label: "RECYCLED" },
  NARRATIVE_INJECTION:       { color: "#ffd700", label: "NARR INJ" },
  ASTROTURFING:              { color: "#ff3333", label: "ASTROTURF" },
  FRAMING_SHIFT:             { color: "#00bfff", label: "FRAME SHIFT" },
};

function IORow({ op }: { op: InformationOperation }) {
  const config = IO_TYPE_CONFIG[op.type];

  return (
    <div
      className="px-3 py-2 border-b border-bloomberg-border"
      style={{ borderLeft: `3px solid ${config.color}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-2xs font-black tracking-widest px-1.5 py-px"
            style={{ color: config.color, background: `${config.color}18` }}
          >
            {config.label}
          </span>
          <span className="text-xs font-bold text-bloomberg-text">{op.headline}</span>
        </div>
        <span className="text-2xs tabular-nums font-bold flex-shrink-0" style={{ color: config.color }}>
          {op.confidence}%
        </span>
      </div>

      <p className="text-2xs text-bloomberg-text leading-snug mb-1">{op.description}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-2xs text-bloomberg-muted tracking-widest">ORIGIN:</span>
        <span className="text-2xs font-bold text-bloomberg-warning">{op.suspectedOrigin}</span>
        {op.affectedSources.length > 0 && (
          <>
            <span className="text-2xs text-bloomberg-muted">·</span>
            <span className="text-2xs text-bloomberg-muted">
              {op.affectedSources.join(", ")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function InfoOpsWidget({ label }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useNarrative();

  return (
    <WidgetShell
      widgetId="info-ops"
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
        <LoadingSkeleton lines={4} />
      ) : data ? (
        <div className="flex flex-col h-full overflow-hidden">
          {data.infoOps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="text-2xl font-black text-bloomberg-positive">✓</span>
              <span className="text-2xs font-bold tracking-widest text-bloomberg-positive">
                NO ACTIVE IO INDICATORS
              </span>
              <span className="text-2xs text-bloomberg-muted text-center px-4">
                No coordinated information operations detected in current articles
              </span>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-header flex items-center gap-2 flex-shrink-0">
                <span className="text-2xs font-bold tracking-widest text-bloomberg-negative animate-pulse">
                  ⚠ {data.infoOps.length} IO INDICATOR{data.infoOps.length !== 1 ? "S" : ""} DETECTED
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {data.infoOps.map((op, i) => (
                  <IORow key={i} op={op} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </WidgetShell>
  );
}
