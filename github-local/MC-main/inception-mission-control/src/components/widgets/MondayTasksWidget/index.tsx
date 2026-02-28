"use client";

import { WidgetShell } from "@/components/widgets/WidgetShell";
import { useMondayTasks } from "@/hooks/useMondayTasks";
import { TaskRow } from "./TaskRow";
import type { WidgetProps } from "@/types/widget";

export function MondayTasksWidget({ label, pollingIntervalMs }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useMondayTasks();

  return (
    <WidgetShell
      widgetId="monday-tasks"
      label={label}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refresh}
      lastUpdated={lastUpdated}
      className="h-full"
    >
      {data && (
        <div className="flex flex-col h-full">
          {/* Summary bar */}
          <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-bg flex items-center gap-2 flex-shrink-0">
            <span className="text-bloomberg-accent font-black text-sm tabular-nums">
              {data.totalPendingCount}
            </span>
            <span className="text-bloomberg-muted text-2xs tracking-widest">
              PENDING ACROSS {data.boards.length} BOARD{data.boards.length !== 1 ? "S" : ""}
            </span>
          </div>

          {/* Boards */}
          <div className="flex-1 overflow-y-auto">
            {data.boards.length === 0 ? (
              <div className="p-4 text-bloomberg-positive text-2xs tracking-widest">
                ✓ ALL CLEAR — NO PENDING TASKS
              </div>
            ) : (
              data.boards.map((board) => (
                <div key={board.id}>
                  {/* Board header */}
                  <div className="sticky top-0 px-2 py-1 bg-bloomberg-header border-b border-bloomberg-border flex items-center justify-between z-10">
                    <span className="text-2xs font-bold tracking-wider text-bloomberg-cyan">
                      {board.name.toUpperCase()}
                    </span>
                    <span className="text-2xs text-bloomberg-muted">
                      {board.tasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  {board.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
