"use client";

import { useNarrative } from "@/components/providers/NarrativeProvider";
import { WidgetShell } from "@/components/widgets/WidgetShell";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { WidgetProps } from "@/types/widget";
import type { Sentiment } from "@/types/narrative";

const SENTIMENT_STYLE: Record<Sentiment, { color: string; label: string }> = {
  POSITIVE: { color: "#00d084", label: "POSITIVE" },
  NEGATIVE: { color: "#ff3333", label: "NEGATIVE" },
  NEUTRAL:  { color: "#888888", label: "NEUTRAL" },
  MIXED:    { color: "#ffd700", label: "MIXED" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  return `${Math.floor(mins / 60)}H AGO`;
}

export function NarrativeSummaryWidget({ label }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useNarrative();
  const sentiment = data ? SENTIMENT_STYLE[data.overallSentiment] : null;

  return (
    <WidgetShell
      widgetId="narrative-summary"
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
        <LoadingSkeleton lines={5} />
      ) : data ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sentiment + shift banner */}
          <div
            className="px-3 py-2 border-b border-bloomberg-border flex-shrink-0"
            style={{ background: sentiment ? `${sentiment.color}14` : undefined }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-black tracking-[0.2em] px-2 py-0.5 border"
                  style={{ color: sentiment?.color, borderColor: sentiment?.color }}
                >
                  {sentiment?.label}
                </span>
                <span className="text-2xs text-bloomberg-muted tracking-widest">
                  UAE STABILITY SENTIMENT
                </span>
              </div>
              <span className="text-2xs text-bloomberg-muted">
                {timeAgo(data.analysedAt)}
              </span>
            </div>
            <p className="text-2xs text-bloomberg-text leading-snug">
              <span className="font-bold text-bloomberg-warning">SHIFT: </span>
              {data.narrativeShift}
            </p>
          </div>

          {/* Executive summary */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <p className="text-xs text-bloomberg-text leading-relaxed">
              {data.executiveSummary}
            </p>
          </div>

          {/* Stats footer */}
          <div className="border-t border-bloomberg-border px-3 py-1.5 flex items-center gap-4 flex-shrink-0 bg-bloomberg-header">
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-bloomberg-accent tabular-nums">
                {data.articlesAnalysed}
              </span>
              <span className="text-2xs text-bloomberg-muted tracking-widest">ARTICLES</span>
            </div>
            <div className="w-px h-6 bg-bloomberg-border" />
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-bloomberg-text tabular-nums">
                {data.dominantNarratives.length}
              </span>
              <span className="text-2xs text-bloomberg-muted tracking-widest">NARRATIVES</span>
            </div>
            <div className="w-px h-6 bg-bloomberg-border" />
            <div className="flex flex-col items-center">
              <span
                className="text-base font-black tabular-nums"
                style={{ color: data.emergingThreads.length > 0 ? "#ffd700" : "#555" }}
              >
                {data.emergingThreads.length}
              </span>
              <span className="text-2xs text-bloomberg-muted tracking-widest">EMERGING</span>
            </div>
            <div className="w-px h-6 bg-bloomberg-border" />
            <div className="flex flex-col items-center">
              <span
                className="text-base font-black tabular-nums"
                style={{ color: data.infoOps.length > 0 ? "#ff3333" : "#00d084" }}
              >
                {data.infoOps.length}
              </span>
              <span className="text-2xs text-bloomberg-muted tracking-widest">IO ALERTS</span>
            </div>
          </div>
        </div>
      ) : null}
    </WidgetShell>
  );
}
