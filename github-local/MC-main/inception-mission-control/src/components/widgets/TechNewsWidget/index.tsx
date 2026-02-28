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

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-2 py-2 border-b border-bloomberg-border hover:bg-bloomberg-bg group"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xs text-bloomberg-accent font-bold tracking-widest truncate max-w-[120px]">
          {article.source.toUpperCase()}
        </span>
        <span className="text-bloomberg-muted text-2xs">·</span>
        <span className="text-2xs text-bloomberg-muted">{timeAgo(article.publishedAt)}</span>
      </div>
      <p className="text-xs text-bloomberg-text leading-snug group-hover:text-bloomberg-accent transition-colors line-clamp-2">
        {article.title}
      </p>
    </a>
  );
}

export function TechNewsWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useNews("tech");

  return (
    <WidgetShell
      widgetId="tech-ai-news"
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
          {data.articles.length === 0 ? (
            <div className="p-4 text-bloomberg-muted text-2xs">NO ARTICLES FOUND</div>
          ) : (
            data.articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))
          )}
        </div>
      )}
    </WidgetShell>
  );
}
