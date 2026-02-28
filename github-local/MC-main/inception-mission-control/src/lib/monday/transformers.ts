import type {
  MondayBoard,
  MondayTask,
  MondayTasksResponse,
  RawMondayBoard,
  RawMondayColumnValue,
} from "@/types/monday";
import { MONDAY_ACTIVE_STATUSES, MONDAY_DONE_STATUSES, PRIORITY_ORDER, SLT_BOARD_NAME_FILTER } from "@/lib/utils/constants";

function parsePersonValue(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as { personsAndTeams?: Array<{ name?: string }> };
    return (parsed.personsAndTeams ?? [])
      .map((p) => p.name ?? "")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseDateValue(value: string | null, text: string): string | null {
  if (text && text.trim()) return text.trim();
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { date?: string };
    return parsed.date ?? null;
  } catch {
    return null;
  }
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function isSLTBoard(boardName: string): boolean {
  return boardName.toLowerCase().includes(SLT_BOARD_NAME_FILTER.toLowerCase());
}

function isActiveStatus(status: string): boolean {
  const s = status.toLowerCase().trim();
  // Show if it's in the explicit active whitelist
  if (MONDAY_ACTIVE_STATUSES.some((a: string) => a.toLowerCase() === s)) return true;
  // Also show any unknown status that isn't explicitly "done"
  const isDone = MONDAY_DONE_STATUSES.some((d: string) => d.toLowerCase() === s);
  return !isDone;
}

function getColumnValue(
  columns: RawMondayColumnValue[],
  ...ids: string[]
): RawMondayColumnValue | undefined {
  return columns.find((c) => ids.includes(c.id));
}

function sortTasks(tasks: MondayTask[]): MondayTask[] {
  return [...tasks].sort((a, b) => {
    // Overdue tasks first
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    // Then by priority
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    // Then by updated_at descending
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function transformMondayResponse(rawBoards: RawMondayBoard[]): MondayTasksResponse {
  const boards: MondayBoard[] = [];

  for (const rawBoard of rawBoards) {
    if (rawBoard.state !== "active") continue;
    if (!isSLTBoard(rawBoard.name)) continue;

    const tasks: MondayTask[] = [];

    for (const item of rawBoard.items_page.items) {
      const cols = item.column_values;
      const statusCol = getColumnValue(cols, "status");
      const priorityCol = getColumnValue(cols, "priority");
      const personCol = getColumnValue(cols, "person");
      const dueDateCol = getColumnValue(cols, "date4", "due_date");

      const status = statusCol?.text ?? "Not Started";
      if (!isActiveStatus(status)) continue;

      const priority = priorityCol?.text ?? "";
      const assignees = parsePersonValue(personCol?.value ?? null);
      const dueDate = parseDateValue(dueDateCol?.value ?? null, dueDateCol?.text ?? "");

      tasks.push({
        id: item.id,
        name: item.name,
        status,
        priority,
        assignees,
        dueDate,
        boardId: rawBoard.id,
        boardName: rawBoard.name,
        isOverdue: isOverdue(dueDate),
        updatedAt: item.updated_at,
      });
    }

    if (tasks.length === 0) continue;

    boards.push({
      id: rawBoard.id,
      name: rawBoard.name,
      tasks: sortTasks(tasks),
    });
  }

  // Sort boards by most tasks first
  boards.sort((a, b) => b.tasks.length - a.tasks.length);

  const totalPendingCount = boards.reduce((sum, b) => sum + b.tasks.length, 0);

  return {
    boards,
    totalPendingCount,
    fetchedAt: new Date().toISOString(),
  };
}
