"use client";

import { cn } from "@/lib/utils/cn";

interface LiveIndicatorProps {
  className?: string;
  label?: string;
  color?: "accent" | "positive" | "negative" | "cyan";
}

const colorMap = {
  accent: "bg-bloomberg-accent",
  positive: "bg-bloomberg-positive",
  negative: "bg-bloomberg-negative",
  cyan: "bg-bloomberg-cyan",
};

export function LiveIndicator({
  className,
  label = "LIVE",
  color = "positive",
}: LiveIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span
        className={cn(
          "inline-block w-1.5 h-1.5 rounded-full live-pulse",
          colorMap[color]
        )}
      />
      {label && (
        <span className="text-2xs font-bold tracking-widest text-bloomberg-muted-light">
          {label}
        </span>
      )}
    </span>
  );
}
