"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useXTrends } from "@/hooks/useXTrends";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { XTweet } from "@/types/x";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function engagementTier(likes: number, impressions: number): "high" | "mid" | "low" {
  if (likes > 500 || impressions > 50_000) return "high";
  if (likes > 100 || impressions > 10_000) return "mid";
  return "low";
}

function TweetCard({ tweet }: { tweet: XTweet }) {
  const tier = engagementTier(tweet.metrics.likes, tweet.metrics.impressions);

  return (
    <a
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-2 py-2 border-b border-bloomberg-border hover:bg-bloomberg-bg group"
    >
      {/* Author + time */}
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className={cn(
            "text-2xs font-bold tracking-wide",
            tier === "high" ? "text-bloomberg-accent" : "text-bloomberg-cyan"
          )}
        >
          @{tweet.authorUsername}
        </span>
        <span className="text-bloomberg-muted text-2xs">·</span>
        <span className="text-2xs text-bloomberg-muted">{timeAgo(tweet.createdAt)}</span>
        {tier === "high" && (
          <span className="ml-auto text-2xs font-bold text-bloomberg-accent tracking-widest">
            ▲ TRENDING
          </span>
        )}
      </div>

      {/* Tweet text */}
      <p className="text-xs text-bloomberg-text leading-snug group-hover:text-bloomberg-accent transition-colors line-clamp-3 mb-1.5">
        {tweet.text || <span className="text-bloomberg-muted italic">[ media / link post ]</span>}
      </p>

      {/* Engagement metrics */}
      <div className="flex items-center gap-3">
        <MetricPill icon="♥" value={tweet.metrics.likes} tier={tier} />
        <MetricPill icon="↺" value={tweet.metrics.retweets} />
        <MetricPill icon="↩" value={tweet.metrics.replies} />
        {tweet.metrics.impressions > 0 && (
          <MetricPill icon="◎" value={tweet.metrics.impressions} label="VIEWS" />
        )}
      </div>
    </a>
  );
}

function MetricPill({
  icon,
  value,
  tier,
  label,
}: {
  icon: string;
  value: number;
  tier?: "high" | "mid" | "low";
  label?: string;
}) {
  if (value === 0) return null;
  return (
    <span
      className={cn(
        "text-2xs flex items-center gap-0.5",
        tier === "high" ? "text-bloomberg-accent" : "text-bloomberg-muted"
      )}
    >
      <span>{icon}</span>
      <span>{formatCount(value)}</span>
      {label && <span className="tracking-widest ml-0.5">{label}</span>}
    </span>
  );
}

export function XTrendsWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useXTrends();

  return (
    <WidgetShell
      widgetId="x-trends"
      label={label}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refresh}
      lastUpdated={lastUpdated}
      className="h-full"
    >
      {data && (
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Subtitle bar */}
          <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-bg flex items-center gap-2 flex-shrink-0">
            <span className="text-bloomberg-muted-light text-2xs tracking-widest">
              AI · FRONTIER MODELS · AGENTS · LLMs
            </span>
            <span className="ml-auto text-2xs text-bloomberg-muted">
              {data.tweets.length} POSTS
            </span>
          </div>

          {data.tweets.length === 0 ? (
            <div className="p-4 text-bloomberg-muted text-2xs tracking-widest">
              NO RESULTS — CHECK X_BEARER_TOKEN OR QUERY
            </div>
          ) : (
            data.tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))
          )}
        </div>
      )}
    </WidgetShell>
  );
}
