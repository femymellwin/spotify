"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useVerifiedNews } from "@/hooks/useVerifiedNews";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { VerifiedNewsItem } from "@/app/api/verified-news/route";

// Source badge styling — colour signals trust level
const SOURCE_STYLES: Record<string, { bg: string; text: string; abbr: string }> = {
  WAM:        { bg: "bg-bloomberg-positive",  text: "text-bloomberg-bg", abbr: "WAM" },
  BBC:        { bg: "bg-bloomberg-cyan",       text: "text-bloomberg-bg", abbr: "BBC" },
  Reuters:    { bg: "bg-bloomberg-accent",     text: "text-bloomberg-bg", abbr: "RTR" },
  "Al Jazeera":{ bg: "bg-bloomberg-warning",  text: "text-bloomberg-bg", abbr: "AJZ" },
  "Al Arabiya":{ bg: "bg-bloomberg-accent",   text: "text-bloomberg-bg", abbr: "ARA" },
};

const SOURCE_TYPE_LABEL: Record<string, string> = {
  state:    "UAE OFFICIAL",
  wire:     "WIRE",
  regional: "REGIONAL",
  intl:     "INTERNATIONAL",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}

function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_STYLES[source];
  if (!style) {
    return (
      <span className="text-2xs font-bold bg-bloomberg-muted text-bloomberg-bg px-1 py-px tracking-widest">
        {source.slice(0, 4).toUpperCase()}
      </span>
    );
  }
  return (
    <span className={cn("text-2xs font-bold px-1 py-px tracking-widest", style.bg, style.text)}>
      {style.abbr}
    </span>
  );
}

function NewsRow({ item }: { item: VerifiedNewsItem }) {
  const isOfficial = item.sourceType === "state";
  const isRecent = Date.now() - new Date(item.publishedAt).getTime() < 30 * 60 * 1000;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-start gap-2 px-2 py-1.5 border-b border-bloomberg-border hover:bg-bloomberg-bg group",
        isOfficial && "border-l-2 border-l-bloomberg-positive"
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        <SourceBadge source={item.source} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-xs text-bloomberg-text leading-snug group-hover:text-bloomberg-accent transition-colors line-clamp-2">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-2xs text-bloomberg-muted">{timeAgo(item.publishedAt)}</span>
          {isOfficial && (
            <span className="text-2xs font-bold text-bloomberg-positive tracking-widest">
              OFFICIAL
            </span>
          )}
          {isRecent && !isOfficial && (
            <span className="text-2xs font-bold text-bloomberg-warning tracking-widest animate-pulse">
              NEW
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export function VerifiedNewsWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } =
    useVerifiedNews();

  // Group by sourceType: show state/official first
  const sorted = data?.items.slice().sort((a, b) => {
    const order = { state: 0, wire: 1, regional: 2, intl: 3 };
    const timeDiff =
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    // Prioritize official sources + recent
    const typeBonus = (order[b.sourceType] ?? 3) - (order[a.sourceType] ?? 3);
    return typeBonus !== 0 ? typeBonus : timeDiff;
  });

  // Group for the section header legend
  const sourcesActive = new Set(data?.items.map((i) => i.source));

  return (
    <WidgetShell
      widgetId="verified-news"
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
          {/* Source legend */}
          <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-bg flex items-center gap-2 flex-wrap flex-shrink-0">
            {Array.from(sourcesActive).map((src) => (
              <span key={src} className="flex items-center gap-1">
                <SourceBadge source={src} />
                <span className="text-2xs text-bloomberg-muted">
                  {src}
                </span>
              </span>
            ))}
            <span className="ml-auto text-2xs text-bloomberg-muted">
              {data.items.length} ITEMS · {data.sourcesAvailable} SOURCES
            </span>
          </div>

          {/* Article list */}
          <div className="flex-1 overflow-y-auto">
            {data.items.length === 0 ? (
              <div className="px-2 py-3 text-2xs text-bloomberg-muted italic">
                No conflict-relevant articles found across sources
              </div>
            ) : (
              (sorted ?? data.items).map((item) => (
                <NewsRow key={item.id} item={item} />
              ))
            )}
          </div>

          {/* Source type legend */}
          <div className="px-2 py-1 border-t border-bloomberg-border bg-bloomberg-header flex items-center gap-3 flex-shrink-0 flex-wrap">
            <span className="text-2xs font-bold text-bloomberg-positive">■ OFFICIAL</span>
            <span className="text-2xs font-bold text-bloomberg-accent">■ WIRE</span>
            <span className="text-2xs font-bold text-bloomberg-warning">■ REGIONAL</span>
            <span className="text-2xs font-bold text-bloomberg-cyan">■ INTL</span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
