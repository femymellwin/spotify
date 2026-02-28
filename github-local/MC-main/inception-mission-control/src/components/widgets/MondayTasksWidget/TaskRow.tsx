import { cn } from "@/lib/utils/cn";
import type { MondayTask } from "@/types/monday";
import { StatusBadge } from "./StatusBadge";

interface TaskRowProps {
  task: MondayTask;
}

const priorityColors: Record<string, string> = {
  Critical: "text-bloomberg-negative",
  High: "text-bloomberg-accent",
  Medium: "text-bloomberg-warning",
  Low: "text-bloomberg-muted",
};

function formatDueDate(dueDate: string | null, isOverdue: boolean): string | null {
  if (!dueDate) return null;
  try {
    const d = new Date(dueDate);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return dueDate;
  }
  return null;
}

export function TaskRow({ task }: TaskRowProps) {
  const dueLabel = formatDueDate(task.dueDate, task.isOverdue);
  const priorityColor = priorityColors[task.priority] ?? "text-bloomberg-muted";

  return (
    <div
      className={cn(
        "flex items-start gap-1.5 px-2 py-1.5 border-b border-bloomberg-border/50 hover:bg-bloomberg-bg/50 group",
        task.isOverdue && "bg-bloomberg-negative/5"
      )}
    >
      {/* Status badge */}
      <StatusBadge status={task.status} />

      {/* Task name */}
      <span
        className={cn(
          "flex-1 text-2xs text-bloomberg-text leading-tight min-w-0 line-clamp-2",
          task.isOverdue && "text-bloomberg-negative"
        )}
        title={task.name}
      >
        {task.name}
      </span>

      {/* Right side: priority + due date */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        {task.priority && (
          <span className={cn("text-2xs font-bold", priorityColor)}>
            {task.priority.slice(0, 4).toUpperCase()}
          </span>
        )}
        {dueLabel && (
          <span
            className={cn(
              "text-2xs",
              task.isOverdue ? "text-bloomberg-negative font-bold" : "text-bloomberg-muted"
            )}
          >
            {task.isOverdue ? "⚠ " : ""}{dueLabel}
          </span>
        )}
      </div>
    </div>
  );
}
