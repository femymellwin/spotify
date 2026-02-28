import { cn } from "@/lib/utils/cn";
import type { MondayStatus } from "@/types/monday";

interface StatusBadgeProps {
  status: MondayStatus;
}

function getStatusStyle(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("work") || s.includes("progress")) {
    return "bg-bloomberg-status-working/20 text-bloomberg-status-working border-bloomberg-status-working/40";
  }
  if (s.includes("stuck")) {
    return "bg-bloomberg-status-stuck/20 text-bloomberg-status-stuck border-bloomberg-status-stuck/40";
  }
  if (s.includes("wait") || s.includes("review")) {
    return "bg-bloomberg-status-waiting/20 text-bloomberg-status-waiting border-bloomberg-status-waiting/40";
  }
  if (s.includes("not") || s.includes("pending")) {
    return "bg-bloomberg-status-not-started/20 text-bloomberg-muted-light border-bloomberg-status-not-started/40";
  }
  return "bg-bloomberg-surface text-bloomberg-muted border-bloomberg-border";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block text-2xs px-1 py-0.5 border font-bold tracking-widest whitespace-nowrap flex-shrink-0",
        getStatusStyle(status)
      )}
    >
      {status.toUpperCase().slice(0, 12)}
    </span>
  );
}
