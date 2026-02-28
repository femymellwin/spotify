import { cn } from "@/lib/utils/cn";

interface SkeletonLineProps {
  width?: string;
  className?: string;
}

function SkeletonLine({ width = "100%", className }: SkeletonLineProps) {
  return (
    <div
      className={cn("h-2 rounded-sm shimmer-bg", className)}
      style={{ width }}
    />
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 5, className }: LoadingSkeletonProps) {
  const widths = ["85%", "70%", "90%", "60%", "75%", "80%", "65%", "88%"];

  return (
    <div className={cn("flex flex-col gap-3 p-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}
