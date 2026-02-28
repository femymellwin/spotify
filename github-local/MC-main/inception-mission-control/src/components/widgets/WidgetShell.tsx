import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils/cn";
import type { WidgetShellProps } from "@/types/widget";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function WidgetShell({
  label,
  children,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  liveIndicator = true,
  lastUpdated,
  className,
}: WidgetShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-bloomberg-surface border border-bloomberg-border overflow-hidden",
        className
      )}
    >
      {/* Title bar — also serves as the drag handle for react-grid-layout */}
      <div className="widget-drag-handle flex items-center justify-between px-2 py-1.5 bg-bloomberg-header border-b border-bloomberg-border flex-shrink-0 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center gap-2">
          {liveIndicator && <LiveIndicator color="accent" label="" />}
          <span className="widget-title">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-2xs text-bloomberg-muted">
              {formatTime(lastUpdated)}
            </span>
          )}
          {isLoading && !lastUpdated && (
            <span className="text-2xs text-bloomberg-muted animate-pulse">
              LOADING
            </span>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && !lastUpdated ? (
          <LoadingSkeleton lines={6} />
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : (
          <div className="h-full overflow-y-auto fade-in">{children}</div>
        )}
      </div>
    </div>
  );
}
