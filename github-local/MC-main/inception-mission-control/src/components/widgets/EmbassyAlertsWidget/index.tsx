"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useEmbassyAlerts } from "@/hooks/useEmbassyAlerts";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { EmbassyAlertsData, EmbassyAlert } from "@/app/api/embassy-alerts/route";

// Advisory level → Bloomberg color class
function advisoryColor(level: number): string {
  if (level >= 4) return "text-bloomberg-negative";
  if (level >= 3) return "text-bloomberg-warning";
  if (level >= 2) return "text-bloomberg-accent";
  return "text-bloomberg-positive";
}

function advisoryBg(level: number): string {
  if (level >= 4) return "bg-bloomberg-negative";
  if (level >= 3) return "bg-bloomberg-warning";
  if (level >= 2) return "bg-bloomberg-accent";
  return "bg-bloomberg-positive";
}

function alertTypeColor(type: EmbassyAlert["alertType"]): string {
  if (type === "security") return "text-bloomberg-negative";
  if (type === "health") return "text-bloomberg-warning";
  return "text-bloomberg-muted-light";
}

function alertTypeBadge(type: EmbassyAlert["alertType"]): string {
  if (type === "security") return "SEC";
  if (type === "health") return "HLT";
  return "GEN";
}

function AdvisoryBanner({ data }: { data: EmbassyAlertsData }) {
  return (
    <div
      className={cn(
        "px-2 py-2 border-b border-bloomberg-border flex items-center gap-3 flex-shrink-0",
        "bg-bloomberg-bg"
      )}
    >
      {/* Level indicator */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-6 h-6 flex items-center justify-center font-black text-sm text-bloomberg-bg",
            advisoryBg(data.advisoryLevel)
          )}
        >
          {data.advisoryLevel}
        </div>
        <div>
          <p className={cn("text-2xs font-bold tracking-widest", advisoryColor(data.advisoryLevel))}>
            {data.advisoryText.toUpperCase()}
          </p>
          {data.advisoryUpdated && (
            <p className="text-2xs text-bloomberg-muted">
              Updated: {data.advisoryUpdated}
            </p>
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-2xs text-bloomberg-muted tracking-widest">STATE DEPT · UAE</span>
        {data.advisoryLevel >= 3 && (
          <span
            className={cn(
              "text-2xs font-black tracking-widest animate-pulse",
              advisoryColor(data.advisoryLevel)
            )}
          >
            ■ ELEVATED
          </span>
        )}
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: EmbassyAlert }) {
  return (
    <div
      className={cn(
        "px-2 py-2 border-b border-bloomberg-border",
        alert.alertType === "security" && "border-l-2 border-l-bloomberg-negative"
      )}
    >
      <div className="flex items-start gap-1.5 mb-0.5">
        <span
          className={cn(
            "text-2xs font-bold tracking-widest flex-shrink-0",
            alertTypeColor(alert.alertType)
          )}
        >
          {alertTypeBadge(alert.alertType)}
        </span>
        <p className="text-xs text-bloomberg-text leading-snug line-clamp-2">
          {alert.title}
        </p>
      </div>
      <div className="flex items-center gap-2 pl-4 mb-0.5">
        <span className="text-2xs text-bloomberg-muted">{alert.date}</span>
      </div>
      {alert.summary && (
        <p className="text-2xs text-bloomberg-muted pl-4 leading-relaxed line-clamp-2">
          {alert.summary}
        </p>
      )}
    </div>
  );
}

export function EmbassyAlertsWidget({ label }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useEmbassyAlerts();

  const securityCount = data?.alerts.filter((a) => a.alertType === "security").length ?? 0;

  return (
    <WidgetShell
      widgetId="embassy-alerts"
      label={label}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refresh}
      lastUpdated={lastUpdated}
      liveIndicator={false}
      className="h-full"
    >
      {data && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Advisory level banner */}
          <AdvisoryBanner data={data} />

          {/* Stats bar */}
          <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-bg flex items-center gap-3 flex-shrink-0">
            <span className="text-bloomberg-muted-light text-2xs tracking-widest">
              US EMBASSY ABU DHABI · ALERTS
            </span>
            <span className="ml-auto flex items-center gap-2">
              {securityCount > 0 && (
                <span className="text-2xs font-black text-bloomberg-negative tracking-widest">
                  {securityCount} SECURITY
                </span>
              )}
              <span className="text-2xs text-bloomberg-muted">
                {data.alerts.length} TOTAL
              </span>
            </span>
          </div>

          {/* Alert list */}
          <div className="flex-1 overflow-y-auto">
            {data.alerts.length === 0 ? (
              <div className="px-2 py-3 text-2xs text-bloomberg-muted italic">
                No recent embassy alerts found
              </div>
            ) : (
              data.alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))
            )}
          </div>

          {/* Legend */}
          <div className="px-2 py-1 border-t border-bloomberg-border bg-bloomberg-header flex items-center gap-3 flex-shrink-0">
            <span className="text-2xs font-bold text-bloomberg-negative">■ SECURITY</span>
            <span className="text-2xs font-bold text-bloomberg-warning">■ HEALTH</span>
            <span className="text-2xs font-bold text-bloomberg-muted">■ GENERAL</span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
