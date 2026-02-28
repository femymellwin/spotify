"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useNews } from "@/hooks/useNews";
import type { WidgetProps } from "@/types/widget";
import type { NewsArticle } from "@/types/news";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}

function WorldNewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-72 p-3 bg-bloomberg-surface border border-bloomberg-border hover:border-bloomberg-muted group flex flex-col gap-1.5"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-2xs text-bloomberg-accent font-bold tracking-widest truncate">
          {article.source.toUpperCase()}
        </span>
        <span className="text-bloomberg-muted text-2xs flex-shrink-0">
          · {timeAgo(article.publishedAt)}
        </span>
      </div>
      <p className="text-xs text-bloomberg-text leading-snug group-hover:text-bloomberg-accent transition-colors line-clamp-3 flex-1">
        {article.title}
      </p>
      {article.description && (
        <p className="text-2xs text-bloomberg-muted leading-tight line-clamp-2">
          {article.description}
        </p>
      )}
    </a>
  );
}

export function WorldNewsWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useNews("world");

  return (
    <WidgetShell
      widgetId="world-news"
      label={label}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refresh}
      lastUpdated={lastUpdated}
      className="h-full"
    >
      {data && (
        <div className="h-full flex items-stretch horizontal-scroll">
          <div className="flex gap-px h-full">
            {data.articles.length === 0 ? (
              <div className="p-4 text-bloomberg-muted text-2xs flex items-center">
                NO ARTICLES FOUND
              </div>
            ) : (
              data.articles.map((article) => (
                <WorldNewsCard key={article.id} article={article} />
              ))
            )}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
