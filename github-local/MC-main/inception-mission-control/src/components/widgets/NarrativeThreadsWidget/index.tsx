"use client";

import { useState } from "react";
import { useNarrative } from "@/components/providers/NarrativeProvider";
import { WidgetShell } from "@/components/widgets/WidgetShell";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { NarrativeThread, NarrativeStance } from "@/types/narrative";

const STANCE_CONFIG: Record<NarrativeStance, { color: string; label: string }> = {
  PRO_IRAN:        { color: "#ff3333", label: "PRO-IRAN" },
  PRO_US:          { color: "#00bfff", label: "PRO-US" },
  PRO_UAE:         { color: "#00d084", label: "PRO-UAE" },
  NEUTRAL:         { color: "#888888", label: "NEUTRAL" },
  ANTI_ESCALATION: { color: "#ffd700", label: "DE-ESCALATION" },
  ALARMIST:        { color: "#ff6600", label: "ALARMIST" },
  DISINFORMATION:  { color: "#ff3333", label: "DISINFO" },
};

function ThreadCard({ thread, isEmerging }: { thread: NarrativeThread; isEmerging?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const stance = STANCE_CONFIG[thread.stance];

  return (
    <div
      className="border-b border-bloomberg-border"
      style={{ borderLeft: `3px solid ${stance.color}` }}
    >
      <button
        className="w-full text-left px-3 py-2 hover:bg-bloomberg-bg transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-2xs font-black tracking-widest px-1.5 py-px border flex-shrink-0"
                style={{ color: stance.color, borderColor: stance.color }}
              >
                {stance.label}
              </span>
              {isEmerging && (
                <span className="text-2xs font-bold text-bloomberg-warning tracking-widest animate-pulse flex-shrink-0">
                  NEW
                </span>
              )}
              <span className="text-xs font-bold text-bloomberg-text truncate">
                {thread.title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xs text-bloomberg-muted tabular-nums">
              {thread.dominanceScore}%
            </span>
            <span
              className="text-2xs text-bloomberg-muted"
              style={{ color: expanded ? stance.color : undefined }}
            >
              {expanded ? "▲" : "▼"}
            </span>
          </div>
        </div>

        {/* Dominance bar */}
        <div className="mt-1.5 h-px bg-bloomberg-border">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${thread.dominanceScore}%`,
              background: stance.color,
              opacity: 0.6,
            }}
          />
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-2 space-y-2" style={{ background: `${stance.color}08` }}>
          {/* Summary */}
          <p className="text-2xs text-bloomberg-text leading-relaxed">{thread.summary}</p>

          {/* Sources */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-2xs text-bloomberg-muted tracking-widest">SOURCES:</span>
            {thread.sources.map((src) => (
              <span
                key={src}
                className="text-2xs font-bold px-1 py-px tracking-wide"
                style={{ color: stance.color, border: `1px solid ${stance.color}40` }}
              >
                {src}
              </span>
            ))}
          </div>

          {/* Evidence quotes */}
          {thread.evidenceQuotes.length > 0 && (
            <div className="space-y-1">
              {thread.evidenceQuotes.slice(0, 2).map((q, i) => (
                <p
                  key={i}
                  className="text-2xs text-bloomberg-muted italic leading-snug border-l-2 pl-2"
                  style={{ borderColor: `${stance.color}60` }}
                >
                  &ldquo;{q}&rdquo;
                </p>
              ))}
            </div>
          )}

          {/* Confidence */}
          <div className="flex items-center gap-2">
            <span className="text-2xs text-bloomberg-muted tracking-widest">CONFIDENCE:</span>
            <span className="text-2xs font-bold" style={{ color: stance.color }}>
              {thread.confidence}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function NarrativeThreadsWidget({ label }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useNarrative();

  return (
    <WidgetShell
      widgetId="narrative-threads"
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
        <LoadingSkeleton lines={8} />
      ) : data ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Dominant narratives */}
          <div className="px-2 py-1 bg-bloomberg-header border-b border-bloomberg-border flex-shrink-0">
            <span className="text-2xs font-bold tracking-widest text-bloomberg-accent">
              DOMINANT NARRATIVES — {data.dominantNarratives.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {data.dominantNarratives.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}

            {/* Emerging threads section */}
            {data.emergingThreads.length > 0 && (
              <>
                <div className="px-2 py-1 bg-bloomberg-header border-y border-bloomberg-border sticky top-0 z-10">
                  <span className="text-2xs font-bold tracking-widest text-bloomberg-warning animate-pulse">
                    EMERGING THREADS — {data.emergingThreads.length}
                  </span>
                </div>
                {data.emergingThreads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} isEmerging />
                ))}
              </>
            )}

            {data.dominantNarratives.length === 0 && (
              <div className="px-3 py-4 text-2xs text-bloomberg-muted italic text-center">
                No dominant narratives identified in current articles
              </div>
            )}
          </div>
        </div>
      ) : null}
    </WidgetShell>
  );
}
