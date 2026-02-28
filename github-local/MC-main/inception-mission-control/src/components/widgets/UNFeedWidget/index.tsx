"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useUNFeed } from "@/hooks/useUNFeed";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { UNPressItem } from "@/app/api/un-feed/route";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}

function UNItemRow({ item }: { item: UNPressItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block px-2 py-2 border-b border-bloomberg-border hover:bg-bloomberg-bg group",
        item.isUrgent && "border-l-2 border-l-bloomberg-negative",
        item.isSecurityCouncil && !item.isUrgent && "border-l-2 border-l-bloomberg-cyan"
      )}
    >
      <div className="flex items-start gap-1.5 mb-0.5">
        <span
          className={cn(
            "text-2xs font-bold tracking-widest flex-shrink-0",
            item.isUrgent
              ? "text-bloomberg-negative"
              : item.isSecurityCouncil
              ? "text-bloomberg-cyan"
              : "text-bloomberg-muted-light"
          )}
        >
          {item.isUrgent ? "SC" : item.isSecurityCouncil ? "SC" : "UN"}
        </span>
        <p className="text-xs text-bloomberg-text leading-snug group-hover:text-bloomberg-accent transition-colors line-clamp-2">
          {item.title}
        </p>
      </div>
      <div className="flex items-center gap-2 pl-4">
        <span className="text-2xs text-bloomberg-muted">{timeAgo(item.publishedAt)}</span>
        {item.isUrgent && (
          <span className="text-2xs font-black text-bloomberg-negative tracking-widest animate-pulse">
            URGENT
          </span>
        )}
        {item.isSecurityCouncil && !item.isUrgent && (
          <span className="text-2xs font-bold text-bloomberg-cyan tracking-widest">
            SECURITY COUNCIL
          </span>
        )}
      </div>
    </a>
  );
}

export function UNFeedWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useUNFeed();

  const scCount = data?.filter((i) => i.isSecurityCouncil).length ?? 0;
  const urgentCount = data?.filter((i) => i.isUrgent).length ?? 0;

  return (
    <WidgetShell
      widgetId="un-feed"
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
          <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-bg flex items-center gap-3 flex-shrink-0">
            <span className="text-bloomberg-muted-light text-2xs tracking-widest">
              PRESS.UN.ORG · MIDDLE EAST FILTER
            </span>
            <span className="ml-auto flex items-center gap-3">
              {urgentCount > 0 && (
                <span className="text-2xs font-black text-bloomberg-negative tracking-widest animate-pulse">
                  {urgentCount} URGENT
                </span>
              )}
              {scCount > 0 && (
                <span className="text-2xs font-bold text-bloomberg-cyan tracking-widest">
                  {scCount} UNSC
                </span>
              )}
              <span className="text-2xs text-bloomberg-muted">{data.length} ITEMS</span>
            </span>
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto">
            {data.length === 0 ? (
              <div className="px-2 py-3 text-2xs text-bloomberg-muted italic">
                No Middle East / Iran-related UN press releases found
              </div>
            ) : (
              data.map((item) => <UNItemRow key={item.id} item={item} />)
            )}
          </div>

          <div className="px-2 py-1 border-t border-bloomberg-border bg-bloomberg-header flex items-center gap-3 flex-shrink-0">
            <span className="text-2xs font-bold text-bloomberg-negative">■ URGENT</span>
            <span className="text-2xs font-bold text-bloomberg-cyan">■ SECURITY COUNCIL</span>
            <span className="text-2xs font-bold text-bloomberg-muted">■ UN GENERAL</span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
