"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useXConflict } from "@/hooks/useXConflict";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { XTweet } from "@/types/x";

// News orgs whose tweets get highlighted as confirmed reports
const NEWS_ACCOUNTS = new Set([
  "Reuters", "AP", "BBCWorld", "BBCBreaking", "AlArabiya_Eng",
  "AJEnglish", "skynewsarabia", "CNN", "nytimes", "washingtonpost",
  "guardian", "FT", "WSJ", "axios", "politico", "TheEconomist",
  "WAMnews", "thenational_ae", "GulfNews",
]);

// OSINT / geopolitical analysts to highlight in cyan
const OSINT_ACCOUNTS = new Set([
  "OSINTdefender", "UAWeapons", "IntelCrab", "GeoConfirmed",
  "BabakTaghvaee", "ArmchairW", "MT_Anderson", "JominiW",
  "sentdefender", "RALee85", "RichardEngel", "michaelweiss_dc",
]);

const BREAKING_KEYWORDS = /\b(BREAKING|URGENT|ALERT|DEVELOPING|JUST IN|CONFIRMED)\b/i;

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

function getTweetSignal(tweet: XTweet): {
  tier: "breaking" | "news" | "osint" | "normal";
  label: string | null;
} {
  const isBreaking =
    BREAKING_KEYWORDS.test(tweet.text) &&
    (tweet.metrics.likes > 50 || tweet.metrics.retweets > 20);
  if (isBreaking) return { tier: "breaking", label: "BREAKING" };

  const isNews = NEWS_ACCOUNTS.has(tweet.authorUsername);
  if (isNews) return { tier: "news", label: "NEWS" };

  const isOsint = OSINT_ACCOUNTS.has(tweet.authorUsername);
  if (isOsint) return { tier: "osint", label: "OSINT" };

  if (tweet.metrics.likes > 500 || tweet.metrics.impressions > 50_000)
    return { tier: "news", label: "VIRAL" };

  return { tier: "normal", label: null };
}

function BadgePill({ label, tier }: { label: string; tier: string }) {
  const colorMap: Record<string, string> = {
    breaking: "bg-bloomberg-negative text-bloomberg-bg",
    news: "bg-bloomberg-accent text-bloomberg-bg",
    osint: "bg-bloomberg-cyan text-bloomberg-bg",
    normal: "bg-bloomberg-muted text-bloomberg-bg",
  };
  return (
    <span className={cn("text-2xs font-black px-1 py-px tracking-widest", colorMap[tier] ?? colorMap.normal)}>
      {label}
    </span>
  );
}

function ConflictTweetRow({ tweet }: { tweet: XTweet }) {
  const { tier, label } = getTweetSignal(tweet);

  const usernameColor =
    tier === "breaking" ? "text-bloomberg-negative" :
    tier === "news" ? "text-bloomberg-accent" :
    tier === "osint" ? "text-bloomberg-cyan" :
    "text-bloomberg-muted-light";

  return (
    <a
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block px-2 py-2 border-b border-bloomberg-border hover:bg-bloomberg-bg group",
        tier === "breaking" && "border-l-2 border-l-bloomberg-negative"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
        <span className={cn("text-2xs font-bold tracking-wide truncate max-w-[120px]", usernameColor)}>
          @{tweet.authorUsername}
        </span>
        <span className="text-bloomberg-muted text-2xs">·</span>
        <span className="text-2xs text-bloomberg-muted">{timeAgo(tweet.createdAt)}</span>
        {label && (
          <span className="ml-auto">
            <BadgePill label={label} tier={tier} />
          </span>
        )}
      </div>

      {/* Tweet text */}
      <p className="text-xs text-bloomberg-text leading-snug group-hover:text-bloomberg-accent transition-colors line-clamp-3 mb-1.5">
        {tweet.text || (
          <span className="text-bloomberg-muted italic">[ media / link post ]</span>
        )}
      </p>

      {/* Engagement */}
      <div className="flex items-center gap-3">
        {tweet.metrics.likes > 0 && (
          <span className={cn("text-2xs flex items-center gap-0.5",
            tier === "breaking" ? "text-bloomberg-negative" : "text-bloomberg-muted")}>
            <span>♥</span><span>{formatCount(tweet.metrics.likes)}</span>
          </span>
        )}
        {tweet.metrics.retweets > 0 && (
          <span className="text-2xs text-bloomberg-muted flex items-center gap-0.5">
            <span>↺</span><span>{formatCount(tweet.metrics.retweets)}</span>
          </span>
        )}
        {tweet.metrics.impressions > 0 && (
          <span className="text-2xs text-bloomberg-muted flex items-center gap-0.5">
            <span>◎</span><span>{formatCount(tweet.metrics.impressions)}</span>
          </span>
        )}
      </div>
    </a>
  );
}

export function XConflictWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useXConflict();

  const breakingCount = data?.tweets.filter(
    (t) => getTweetSignal(t).tier === "breaking"
  ).length ?? 0;

  return (
    <WidgetShell
      widgetId="x-conflict"
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
          {/* Subtitle bar */}
          <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-bg flex items-center gap-2 flex-shrink-0">
            <span className="text-bloomberg-muted-light text-2xs tracking-widest">
              IRAN · US · UAE · GULF REGION
            </span>
            <span className="ml-auto flex items-center gap-2">
              {breakingCount > 0 && (
                <span className="text-2xs font-black text-bloomberg-negative tracking-widest animate-pulse">
                  {breakingCount} BREAKING
                </span>
              )}
              <span className="text-2xs text-bloomberg-muted">
                {data.tweets.length} POSTS
              </span>
            </span>
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto">
            {data.tweets.length === 0 ? (
              <div className="p-4 text-bloomberg-muted text-2xs tracking-widest">
                NO RESULTS — CHECK X_BEARER_TOKEN OR QUERY
              </div>
            ) : (
              data.tweets.map((tweet) => (
                <ConflictTweetRow key={tweet.id} tweet={tweet} />
              ))
            )}
          </div>

          {/* Legend */}
          <div className="px-2 py-1 border-t border-bloomberg-border bg-bloomberg-header flex items-center gap-3 flex-shrink-0">
            <span className="text-2xs font-black text-bloomberg-negative">■ BREAKING</span>
            <span className="text-2xs font-black text-bloomberg-accent">■ NEWS</span>
            <span className="text-2xs font-black text-bloomberg-cyan">■ OSINT</span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
