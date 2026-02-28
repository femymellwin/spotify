"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useCommodities } from "@/hooks/useCommodities";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type { CommodityPrice } from "@/types/commodities";

// Historical reference levels for escalation signals
// Oil above these = stress signal; gold above = safe-haven flight
const STRESS_THRESHOLDS: Record<string, { elevated: number; high: number }> = {
  "CL=F": { elevated: 75, high: 90 },   // WTI Crude
  "BZ=F": { elevated: 78, high: 93 },   // Brent Crude
  "GC=F": { elevated: 2600, high: 3000 }, // Gold
  "NG=F": { elevated: 3.5, high: 5.5 },  // Natural Gas
};

function getStressLabel(
  symbol: string,
  price: number
): { label: string; color: string } {
  const t = STRESS_THRESHOLDS[symbol];
  if (!t) return { label: "NORMAL", color: "text-bloomberg-positive" };
  if (price >= t.high) return { label: "HIGH", color: "text-bloomberg-negative" };
  if (price >= t.elevated) return { label: "ELEVATED", color: "text-bloomberg-warning" };
  return { label: "NORMAL", color: "text-bloomberg-positive" };
}

function formatPrice(price: number, symbol: string): string {
  if (symbol === "GC=F") return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function ChangeArrow({ pct }: { pct: number }) {
  if (pct > 0) return <span className="text-bloomberg-positive">▲ +{pct.toFixed(2)}%</span>;
  if (pct < 0) return <span className="text-bloomberg-negative">▼ {pct.toFixed(2)}%</span>;
  return <span className="text-bloomberg-muted">— {pct.toFixed(2)}%</span>;
}

function OilStressBar({ items }: { items: CommodityPrice[] }) {
  // Composite stress index: average of WTI and Brent stress levels (0–100)
  const oilItems = items.filter((i) => i.symbol === "CL=F" || i.symbol === "BZ=F");
  if (oilItems.length === 0) return null;

  const avgStress = oilItems.reduce((sum, item) => {
    const t = STRESS_THRESHOLDS[item.symbol];
    if (!t || item.price === 0) return sum;
    // Normalize: 0 = baseline (elevated threshold), 100 = extreme (high + 20%)
    const normalized = Math.min(100, Math.max(0,
      ((item.price - t.elevated) / (t.high * 1.2 - t.elevated)) * 100
    ));
    return sum + normalized;
  }, 0) / oilItems.length;

  const pct = Math.round(Math.max(0, Math.min(100, avgStress)));
  const color = pct >= 70 ? "var(--color-negative)" : pct >= 40 ? "var(--color-warning)" : "var(--color-positive)";
  const stressLabel = pct >= 70 ? "HIGH" : pct >= 40 ? "MODERATE" : "LOW";

  return (
    <div className="px-2 py-1.5 border-t border-bloomberg-border flex-shrink-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xs font-bold tracking-widest text-bloomberg-muted-light">
          OIL STRESS INDEX
        </span>
        <span className="text-2xs font-bold" style={{ color }}>{stressLabel}</span>
      </div>
      <div className="h-1.5 bg-bloomberg-border rounded-none">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function CommoditiesWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } =
    useCommodities(pollingIntervalMs);

  return (
    <WidgetShell
      widgetId="commodities"
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
          {/* Commodity rows */}
          <div className="flex-1 overflow-y-auto">
            {/* Column header */}
            <div
              className="grid text-2xs font-bold tracking-widest text-bloomberg-muted px-2 py-1 border-b border-bloomberg-border bg-bloomberg-header sticky top-0 z-10"
              style={{ gridTemplateColumns: "1fr 5rem 6rem 4.5rem" }}
            >
              <span>COMMODITY</span>
              <span className="text-right">PRICE</span>
              <span className="text-right">CHANGE</span>
              <span className="text-right">SIGNAL</span>
            </div>

            {data.items.map((item) => {
              const { label: stressLabel, color: stressColor } = getStressLabel(
                item.symbol,
                item.price
              );
              const hasData = item.price > 0;

              return (
                <div
                  key={item.symbol}
                  className="grid items-center px-2 py-2 border-b border-bloomberg-border hover:bg-bloomberg-bg"
                  style={{ gridTemplateColumns: "1fr 5rem 6rem 4.5rem" }}
                >
                  <div className="flex flex-col">
                    <span className="text-2xs font-bold text-bloomberg-accent tracking-wide">
                      {item.name}
                    </span>
                    <span className="text-2xs text-bloomberg-muted">
                      USD{item.unit}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-bloomberg-text text-right tabular-nums">
                    {hasData ? `$${formatPrice(item.price, item.symbol)}` : "—"}
                  </span>

                  <div className="text-xs font-bold text-right tabular-nums">
                    {hasData ? <ChangeArrow pct={item.changePercent} /> : <span className="text-bloomberg-muted">—</span>}
                  </div>

                  <span className={cn("text-2xs font-bold text-right", stressColor)}>
                    {hasData ? stressLabel : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Oil stress bar */}
          <OilStressBar items={data.items} />

          {/* Footer */}
          <div className="px-2 py-1 border-t border-bloomberg-border bg-bloomberg-header flex items-center justify-between flex-shrink-0">
            <span className="text-2xs text-bloomberg-muted">SOURCE: YAHOO FINANCE</span>
            <span className="text-2xs text-bloomberg-muted">DELAYED ~15 MIN</span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
