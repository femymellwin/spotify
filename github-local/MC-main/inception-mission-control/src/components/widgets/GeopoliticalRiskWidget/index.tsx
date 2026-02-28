"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useGeopoliticalRisk } from "@/hooks/useGeopoliticalRisk";
import { RiskScore } from "./RiskScore";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { GeopoliticalArticle } from "@/types/geopolitical";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}

function ArticleRow({
  article,
  accentColor = "text-bloomberg-accent",
  badge,
}: {
  article: GeopoliticalArticle;
  accentColor?: string;
  badge?: string;
}) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2 px-2 py-1.5 border-b border-bloomberg-border hover:bg-bloomberg-bg group"
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={cn("text-2xs font-bold tracking-wide truncate max-w-[100px]", accentColor)}>
            {article.source.toUpperCase()}
          </span>
          <span className="text-bloomberg-muted text-2xs">·</span>
          <span className="text-2xs text-bloomberg-muted">{timeAgo(article.publishedAt)}</span>
          {badge && (
            <span className="ml-auto text-2xs font-bold text-bloomberg-bg px-1 py-px"
              style={{ background: accentColor.includes("cyan") ? "#00bfff" : "#00d084" }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-bloomberg-text leading-snug group-hover:text-bloomberg-accent transition-colors line-clamp-2">
          {article.title}
        </p>
      </div>
    </a>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="px-2 py-1 bg-bloomberg-header border-b border-bloomberg-border flex items-center justify-between sticky top-0 z-10">
      <span className="text-2xs font-bold tracking-wider text-bloomberg-muted-light">
        {label}
      </span>
      <span className="text-2xs text-bloomberg-muted">{count}</span>
    </div>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="px-2 py-1.5 text-2xs text-bloomberg-muted italic">
      {message}
    </div>
  );
}

export function GeopoliticalRiskWidget({ label }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } =
    useGeopoliticalRisk();

  return (
    <WidgetShell
      widgetId="geopolitical-risk"
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
          {/* Risk score banner */}
          <RiskScore risk={data.risk} />

          {/* Three-column article grid */}
          <div
            className="flex-1 grid overflow-hidden"
            style={{
              gridTemplateColumns: "1fr 1.5fr 1fr",
              gap: "1px",
              backgroundColor: "var(--color-border)",
            }}
          >
            {/* Col 1: Official UAE statements */}
            <div className="flex flex-col overflow-hidden bg-bloomberg-surface">
              <SectionHeader
                label="UAE / GULF POSITION"
                count={data.officialStatements.length}
              />
              <div className="flex-1 overflow-y-auto">
                {data.officialStatements.length === 0 ? (
                  <EmptySection message="No confirmed official statements yet" />
                ) : (
                  data.officialStatements.map((a) => (
                    <ArticleRow
                      key={a.id}
                      article={a}
                      accentColor="text-bloomberg-positive"
                      badge="OFFICIAL"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Col 2: Iran-US escalation relevant to UAE/Gulf */}
            <div className="flex flex-col overflow-hidden bg-bloomberg-surface">
              <SectionHeader
                label="IRAN–US ESCALATION · GULF IMPACT"
                count={data.conflictNews.length}
              />
              <div className="flex-1 overflow-y-auto">
                {data.conflictNews.length === 0 ? (
                  <EmptySection message="No confirmed escalation reports" />
                ) : (
                  data.conflictNews.map((a) => (
                    <ArticleRow
                      key={a.id}
                      article={a}
                      accentColor="text-bloomberg-negative"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Col 3: Abu Dhabi specific */}
            <div className="flex flex-col overflow-hidden bg-bloomberg-surface">
              <SectionHeader
                label="ABU DHABI SPECIFIC"
                count={data.abuDhabiNews.length}
              />
              <div className="flex-1 overflow-y-auto">
                {data.abuDhabiNews.length === 0 ? (
                  <EmptySection message="No Abu Dhabi-specific reports" />
                ) : (
                  data.abuDhabiNews.map((a) => (
                    <ArticleRow
                      key={a.id}
                      article={a}
                      accentColor="text-bloomberg-cyan"
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
